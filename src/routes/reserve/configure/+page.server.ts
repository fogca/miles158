import { fail, redirect } from '@sveltejs/kit';
import { getDb, SlotConflictError } from '$lib/server/db';
import { loadSession, saveSession, linkReservation } from '$lib/server/reserve-session';
import { computeQuote, loadOptions } from '$lib/server/pricing-data';
import { createHold } from '$lib/server/inventory';
import { createCustomer, addDriver } from '$lib/server/customer';
import { enumerateDates, addDaysStr, nowIso } from '$lib/time';
import { t, l as lhref } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

const HOLD_MINUTES = 15;

function parseOptions(form: FormData, catalogIds: string[]) {
	const out: { optionId: string; qty: number }[] = [];
	for (const id of catalogIds) {
		const raw = form.get(`opt_${id}`);
		const qty = raw ? Number(raw) : 0;
		if (qty > 0) out.push({ optionId: id, qty });
	}
	return out;
}

export const load: PageServerLoad = async ({ platform, cookies, locals }) => {
	const db = getDb(platform);
	const session = await loadSession(db, cookies);
	if (!session?.data.vehicleId || !session.data.classId || !session.data.pickupAt || !session.data.returnAt) {
		throw redirect(303, lhref(locals.locale, '/reserve'));
	}
	const d = session.data;

	const vehicle = await db
		.prepare(
			`SELECT v.display_name, v.subtitle, v.image_url, vc.name_ja AS class_name_ja
			 FROM vehicles v JOIN vehicle_classes vc ON vc.id = v.class_id WHERE v.id = ?`
		)
		.bind(d.vehicleId)
		.first<{ display_name: string; subtitle: string | null; image_url: string | null; class_name_ja: string }>();

	const catalog = await loadOptions(db);
	const cdwSelected = d.cdwSelected ?? true; // coverage recommended by default
	const nocWaiver = d.nocWaiver ?? false;

	const quote = await computeQuote(db, {
		classId: d.classId!,
		pickupAt: d.pickupAt!,
		returnAt: d.returnAt!,
		options: d.options ?? [],
		cdwSelected,
		nocWaiver
	});

	return {
		vehicle,
		catalog,
		quote: quote.breakdown,
		depositAmount: quote.depositAmount,
		coverage: { cdwSelected, nocWaiver },
		classRow: {
			cdw_per_day: quote.classRow.cdw_per_day,
			noc_waiver_per_day: quote.classRow.noc_waiver_per_day
		},
		search: {
			pickupDate: d.pickupDate,
			pickupTime: d.pickupTime,
			returnDate: d.returnDate,
			returnTime: d.returnTime
		},
		licenseKind: d.licenseKind,
		savedOptions: d.options ?? []
	};
};

export const actions: Actions = {
	confirm: async ({ request, platform, cookies, locals }) => {
		const db = getDb(platform);
		const locale = locals.locale;
		const session = await loadSession(db, cookies);
		if (!session?.data.vehicleId || !session.data.classId || !session.data.pickupAt || !session.data.returnAt) {
			throw redirect(303, lhref(locale, '/reserve'));
		}
		const d = session.data;
		const form = await request.formData();

		const catalog = await loadOptions(db);
		const options = parseOptions(form, catalog.map((o) => o.id));
		const cdwSelected = form.get('cdw') === 'on';
		const nocWaiver = form.get('noc') === 'on';

		// Required customer fields.
		const nameFamily = String(form.get('nameFamily') ?? '').trim();
		const nameGiven = String(form.get('nameGiven') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const phone = String(form.get('phone') ?? '').trim();
		const address = String(form.get('address') ?? '').trim();
		const licenseNumber = String(form.get('licenseNumber') ?? '').trim();

		if (!nameFamily || !nameGiven || !email || !phone || !address || !licenseNumber) {
			return fail(400, { message: t(locale, 'cfg.errRequired'), values: Object.fromEntries(form) });
		}

		// Authoritative server-side recompute.
		const quote = await computeQuote(db, {
			classId: d.classId!,
			pickupAt: d.pickupAt!,
			returnAt: d.returnAt!,
			options,
			cdwSelected,
			nocWaiver
		});

		const slotDays = enumerateDates(d.pickupDate!, d.returnDate!);
		const bufferDays = [addDaysStr(d.returnDate!, 1)];

		let reservationId: string;
		let code: string;
		try {
			const hold = await createHold(db, {
				vehicleId: d.vehicleId!,
				classId: d.classId!,
				pickupAt: d.pickupAt!,
				returnAt: d.returnAt!,
				slotDays,
				bufferDays,
				breakdown: quote.breakdown,
				depositAmount: quote.depositAmount,
				cdwSelected,
				nocWaiver,
				optionRows: quote.optionRows.map((o) => ({
					optionId: o.optionId,
					unitPrice: o.unitPrice,
					type: o.type,
					qty: o.qty,
					lineAmount: o.lineAmount
				})),
				cancellationPolicyId: quote.cancellationPolicyId,
				holdMinutes: HOLD_MINUTES,
				origin: 'web'
			});
			reservationId = hold.reservationId;
			code = hold.code;
		} catch (err) {
			if (err instanceof SlotConflictError) {
				return fail(409, { message: t(locale, 'cfg.errTaken') });
			}
			throw err;
		}

		// Persist customer (= legal ledger record) and attach to reservation.
		const customerId = await createCustomer(db, {
			nameFamily,
			nameGiven,
			email,
			phone,
			address,
			nationality: String(form.get('nationality') ?? '') || undefined,
			preferredLocale: 'ja',
			licenseKind: d.licenseKind,
			licenseNumber,
			licenseType: String(form.get('licenseType') ?? '') || undefined,
			licenseExpiry: String(form.get('licenseExpiry') ?? '') || undefined,
			passportNumber: String(form.get('passportNumber') ?? '') || undefined,
			entryDate: String(form.get('entryDate') ?? '') || undefined
		});
		await addDriver(db, customerId, {
			nameFamily,
			nameGiven,
			address,
			licenseType: String(form.get('licenseType') ?? '') || '—',
			licenseNumber
		});
		await db
			.prepare('UPDATE reservations SET customer_id = ?, passenger_count = ?, updated_at = ? WHERE id = ?')
			.bind(customerId, Number(form.get('passengerCount') ?? 1) || 1, nowIso(), reservationId)
			.run();

		await saveSession(db, session.id, {
			...d,
			options,
			cdwSelected,
			nocWaiver,
			reservationId,
			code
		});
		await linkReservation(db, session.id, reservationId);

		throw redirect(303, lhref(locale, '/reserve/payment'));
	}
};
