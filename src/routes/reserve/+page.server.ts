import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { isVehicleAvailable } from '$lib/server/inventory';
import { getOrCreateSession, saveSession } from '$lib/server/reserve-session';
import { loadVehicleClass, loadRateMultiplier, loadDurationDiscounts } from '$lib/server/pricing-data';
import { isEligible } from '$lib/reserve/eligibility';
import { jstDateToUtc, enumerateDates, addDaysStr, jstDateStr, nowIso } from '$lib/time';
import { t, l as lhref } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

const DEFAULT_PICKUP_TIME = '10:00';
const DEFAULT_RETURN_TIME = '20:00';
const AVAILABILITY_DAYS = 120; // how far ahead the calendar shows
const MIN_LEAD_DAYS = 3; // online bookings accepted up to 3 days before pickup

export const load: PageServerLoad = async ({ url, platform, locals }) => {
	const db = getDb(platform);
	const locale = locals.locale;

	const vehicles = (
		await db
			.prepare(
				`SELECT v.id, v.class_id, v.display_name, v.subtitle, v.image_url, v.color,
				        vc.name_ja, vc.name_en, vc.name_zh_hans, vc.base_rate_24h, vc.deposit_amount
				 FROM vehicles v JOIN vehicle_classes vc ON vc.id = v.class_id
				 WHERE v.status = 'active' AND v.deleted_at IS NULL
				 ORDER BY vc.sort_order, v.display_name`
			)
			.all<{
				id: string;
				class_id: string;
				display_name: string;
				subtitle: string | null;
				image_url: string | null;
				color: string | null;
				name_ja: string;
				name_en: string | null;
				name_zh_hans: string | null;
				base_rate_24h: number;
				deposit_amount: number;
			}>()
	).results.map((v) => ({
		...v,
		class_name:
			locale === 'en' ? v.name_en || v.name_ja : locale === 'zh' ? v.name_zh_hans || v.name_ja : v.name_ja
	}));

	// Booked days (rental/buffer/maintenance/blackout) per vehicle, ignoring expired holds.
	const today = jstDateStr(nowIso());
	const end = addDaysStr(today, AVAILABILITY_DAYS);
	const slots = (
		await db
			.prepare(
				`SELECT rd.vehicle_id, rd.date FROM reservation_days rd
				 JOIN reservations r ON r.id = rd.reservation_id
				 WHERE rd.date BETWEEN ? AND ?
				   AND NOT (r.status = 'held' AND r.held_expires_at < ?)`
			)
			.bind(today, end, nowIso())
			.all<{ vehicle_id: string; date: string }>()
	).results;

	const bookedByVehicle: Record<string, string[]> = {};
	for (const s of slots) (bookedByVehicle[s.vehicle_id] ??= []).push(s.date);

	// Per-class daily rate info so the calendar can show a price on each day and
	// the cart can compute a live total client-side (matching the server calc).
	const dates = enumerateDates(today, end);
	const classIds = [...new Set(vehicles.map((v) => v.class_id))];
	const classInfo: Record<
		string,
		{ base24h: number; extra24h: number; cdwPerDay: number; multByDate: Record<string, number> }
	> = {};
	for (const cid of classIds) {
		const cls = await loadVehicleClass(db, cid);
		if (!cls) continue;
		const resolver = await loadRateMultiplier(db, cid);
		const multByDate: Record<string, number> = {};
		for (const d of dates) multByDate[d] = resolver(d);
		classInfo[cid] = {
			base24h: cls.base_rate_24h,
			extra24h: cls.extra_24h,
			cdwPerDay: cls.cdw_per_day,
			multByDate
		};
	}

	const durationDiscounts = await loadDurationDiscounts(db);

	return {
		vehicles,
		bookedByVehicle,
		classInfo,
		durationDiscounts,
		license: url.searchParams.get('license') ?? '',
		expired: url.searchParams.get('expired') === '1',
		today
	};
};

export const actions: Actions = {
	select: async ({ request, platform, cookies, locals }) => {
		const db = getDb(platform);
		const locale = locals.locale;
		const form = await request.formData();
		const licenseKind = String(form.get('licenseKind') ?? '');
		const vehicleId = String(form.get('vehicleId') ?? '');
		const classId = String(form.get('classId') ?? '');
		const pickupDate = String(form.get('pickupDate') ?? '');
		const pickupTime = String(form.get('pickupTime') ?? DEFAULT_PICKUP_TIME);
		const returnDate = String(form.get('returnDate') ?? '');
		const returnTime = String(form.get('returnTime') ?? DEFAULT_RETURN_TIME);

		if (!isEligible(licenseKind)) {
			return fail(400, { message: t(locale, 'rsv.errIneligible') });
		}
		if (!vehicleId || !pickupDate || !returnDate || returnDate < pickupDate) {
			return fail(400, { message: t(locale, 'rsv.errDates') });
		}

		// Lead-time guard: online bookings only from MIN_LEAD_DAYS before pickup.
		const minDate = addDaysStr(jstDateStr(nowIso()), MIN_LEAD_DAYS);
		if (pickupDate < minDate) {
			return fail(400, { message: t(locale, 'rsv.errLead') });
		}

		// Slot days include the turnaround buffer (day after return).
		const slotDays = enumerateDates(pickupDate, addDaysStr(returnDate, 1));
		const available = await isVehicleAvailable(db, vehicleId, slotDays);
		if (!available) {
			return fail(409, { message: t(locale, 'rsv.errTaken') });
		}

		const pickupAt = jstDateToUtc(pickupDate, pickupTime);
		const returnAt = jstDateToUtc(returnDate, returnTime);

		const session = await getOrCreateSession(db, cookies);
		await saveSession(db, session.id, {
			...session.data,
			licenseKind,
			vehicleId,
			classId,
			pickupDate,
			pickupTime,
			returnDate,
			returnTime,
			pickupAt,
			returnAt
		});

		throw redirect(303, lhref(locale, '/reserve/configure'));
	}
};
