import { error, fail, redirect } from '@sveltejs/kit';
import { getDb, genId } from '$lib/server/db';
import { nowIso, diffHours } from '$lib/time';
import {
	getReservationDetail,
	loadReservation,
	transitionReservation
} from '$lib/server/reservation';
import { ALLOWED_TRANSITIONS, type ReservationState } from '$lib/booking/states';
import { loadCancellationRules } from '$lib/server/pricing-data';
import { calcCancellationFee } from '$lib/cancellation/policy';
import { getPaymentProvider } from '$lib/server/payment';
import { sendEmail, buildBookingEmailData, type EmailEnv } from '$lib/server/email';
import { calcMileageOverage } from '$lib/pricing/mileage';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const detail = await getReservationDetail(db, params.id);
	if (!detail) throw error(404, 'Reservation not found');
	const next = ALLOWED_TRANSITIONS[detail.reservation.status] ?? [];
	return { detail, next };
};

const NUM_PATCH = ['mileage_start_km', 'mileage_end_km', 'fuel_start', 'fuel_end'];

export const actions: Actions = {
	advance: async ({ params, request, platform, locals, getClientAddress }) => {
		const db = getDb(platform);
		const form = await request.formData();
		const to = String(form.get('to')) as ReservationState;
		const patch: Record<string, unknown> = {};
		for (const k of NUM_PATCH) {
			const v = form.get(k);
			if (v != null && v !== '') patch[k] = Number(v);
		}
		const notes = form.get('notes');
		if (notes) patch.notes = String(notes);

		// Auto-calc mileage overage (300km/day allowance, ¥55/km beyond) on return.
		if (to === 'returned') {
			const current = await loadReservation(db, params.id);
			const startKm = (patch.mileage_start_km as number | undefined) ?? current?.mileage_start_km ?? null;
			const endKm = (patch.mileage_end_km as number | undefined) ?? null;
			const rentalDays = current?.price_snapshot
				? (JSON.parse(current.price_snapshot) as { rentalDays?: number }).rentalDays
				: undefined;
			if (rentalDays != null) {
				const overage = calcMileageOverage(rentalDays, startKm as number | null, endKm);
				if (overage) {
					patch.mileage_overage_km = overage.overageKm;
					patch.mileage_overage_amount = overage.overageAmount;
				}
			}
		}

		try {
			await transitionReservation(db, {
				reservationId: params.id,
				to,
				actor: `staff:${locals.staff?.id}`,
				patch,
				ip: getClientAddress()
			});
		} catch (e) {
			return fail(400, { message: (e as Error).message });
		}
		throw redirect(303, `/dashboard/bookings/${params.id}`);
	},

	cancel: async ({ params, platform, locals, getClientAddress, request }) => {
		const db = getDb(platform);
		const res = await loadReservation(db, params.id);
		if (!res) throw error(404, 'Reservation not found');

		const rules = res.cancellation_policy_id
			? await loadCancellationRules(db, res.cancellation_policy_id)
			: [];
		const hoursBefore = res.pickup_scheduled_at
			? diffHours(nowIso(), res.pickup_scheduled_at)
			: 9999;
		const { feeJpy } = calcCancellationFee(res.base_amount ?? 0, hoursBefore, rules);

		try {
			await transitionReservation(db, {
				reservationId: params.id,
				to: 'cancelled',
				actor: `staff:${locals.staff?.id}`,
				reason: 'staff cancellation',
				patch: { cancellation_fee: feeJpy },
				ip: getClientAddress()
			});
		} catch (e) {
			return fail(400, { message: (e as Error).message });
		}

		// Mock refund of (total - cancellation fee) against the rental payment.
		const pay = await db
			.prepare(
				"SELECT id, intent_id FROM payments WHERE reservation_id = ? AND kind = 'rental' ORDER BY created_at DESC LIMIT 1"
			)
			.bind(params.id)
			.first<{ id: string; intent_id: string | null }>();
		if (pay) {
			const refundAmt = Math.max(0, (res.total_amount ?? 0) - feeJpy);
			const provider = getPaymentProvider(platform?.env as unknown as Record<string, string>);
			const rr = await provider.refund(pay.intent_id ?? '', refundAmt, 'cancellation');
			await db
				.prepare(
					`INSERT INTO refunds (id, payment_id, amount, reason, status, provider_ref, created_at, updated_at)
					 VALUES (?, ?, ?, 'cancellation', ?, ?, ?, ?)`
				)
				.bind(genId(), pay.id, refundAmt, rr.status, rr.refundId, nowIso(), nowIso())
				.run();
		}

		// Cancellation email (idempotent; failures don't block).
		try {
			const env = platform?.env as unknown as EmailEnv;
			const baseUrl = env?.PUBLIC_BASE_URL || new URL(request.url).origin;
			const { data, customerEmail } = await buildBookingEmailData(db, res, baseUrl);
			if (customerEmail) {
				await sendEmail(db, env, {
					kind: 'cancellation',
					idempotencyKey: `cancellation/${res.code}`,
					to: customerEmail,
					reservationId: res.id,
					data: {
						...data,
						cancellationFee: feeJpy,
						refundAmount: Math.max(0, (res.total_amount ?? 0) - feeJpy)
					}
				});
			}
		} catch (e) {
			console.error('[email] cancellation failed', e);
		}

		throw redirect(303, `/dashboard/bookings/${params.id}`);
	}
};
