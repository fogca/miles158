import { fail, redirect } from '@sveltejs/kit';
import { getDb, SlotConflictError } from '$lib/server/db';
import { nowIso, jstDateToUtc, enumerateDates, addDaysStr } from '$lib/time';
import { computeQuote } from '$lib/server/pricing-data';
import { createHold } from '$lib/server/inventory';
import { createCustomer } from '$lib/server/customer';
import { transitionReservation } from '$lib/server/reservation';
import { t } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const vehicles = (
		await db
			.prepare(
				`SELECT v.id, v.display_name, v.class_id, vc.name_ja AS class_name
				 FROM vehicles v JOIN vehicle_classes vc ON vc.id = v.class_id
				 WHERE v.status = 'active' AND v.deleted_at IS NULL ORDER BY vc.sort_order, v.display_name`
			)
			.all<{ id: string; display_name: string; class_id: string; class_name: string }>()
	).results;
	return { vehicles };
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		const db = getDb(platform);
		const f = await request.formData();
		const vehicleId = String(f.get('vehicleId') ?? '');
		const pickupDate = String(f.get('pickupDate') ?? '');
		const pickupTime = String(f.get('pickupTime') ?? '10:00');
		const returnDate = String(f.get('returnDate') ?? '');
		const returnTime = String(f.get('returnTime') ?? '20:00');
		const nameFamily = String(f.get('nameFamily') ?? '').trim();
		const nameGiven = String(f.get('nameGiven') ?? '').trim();
		const phone = String(f.get('phone') ?? '').trim();
		const cdwSelected = f.get('cdw') === 'on';

		if (!vehicleId || !pickupDate || !returnDate || returnDate < pickupDate || !nameFamily) {
			return fail(400, { message: t(locals.locale, 'nb.errRequired'), values: Object.fromEntries(f) });
		}

		const veh = await db
			.prepare('SELECT class_id FROM vehicles WHERE id = ?')
			.bind(vehicleId)
			.first<{ class_id: string }>();
		if (!veh) return fail(400, { message: t(locals.locale, 'nb.errNoVehicle') });

		const pickupAt = jstDateToUtc(pickupDate, pickupTime);
		const returnAt = jstDateToUtc(returnDate, returnTime);
		const quote = await computeQuote(db, {
			classId: veh.class_id,
			pickupAt,
			returnAt,
			options: [],
			cdwSelected,
			nocWaiver: false
		});

		const slotDays = enumerateDates(pickupDate, returnDate);
		const bufferDays = [addDaysStr(returnDate, 1)];

		let reservationId: string;
		try {
			const hold = await createHold(db, {
				vehicleId,
				classId: veh.class_id,
				pickupAt,
				returnAt,
				slotDays,
				bufferDays,
				breakdown: quote.breakdown,
				depositAmount: quote.depositAmount,
				cdwSelected,
				nocWaiver: false,
				optionRows: [],
				cancellationPolicyId: quote.cancellationPolicyId,
				holdMinutes: 60,
				origin: 'staff'
			});
			reservationId = hold.reservationId;
		} catch (err) {
			if (err instanceof SlotConflictError) {
				return fail(409, { message: t(locals.locale, 'nb.errTaken') });
			}
			throw err;
		}

		const customerId = await createCustomer(db, {
			nameFamily,
			nameGiven: nameGiven || '—',
			phone,
			email: String(f.get('email') ?? '') || undefined
		});
		await db
			.prepare('UPDATE reservations SET customer_id = ?, updated_at = ? WHERE id = ?')
			.bind(customerId, nowIso(), reservationId)
			.run();

		// Staff manual bookings are confirmed immediately; payment handled offline.
		const actor = `staff:${locals.staff?.id}`;
		await transitionReservation(db, { reservationId, to: 'pending_payment', actor, reason: 'manual booking' });
		await transitionReservation(db, { reservationId, to: 'confirmed', actor, reason: 'manual booking (offline payment)' });

		throw redirect(303, `/dashboard/bookings/${reservationId}`);
	}
};
