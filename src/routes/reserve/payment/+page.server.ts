import { fail, redirect } from '@sveltejs/kit';
import { getDb, genId } from '$lib/server/db';
import { nowIso } from '$lib/time';
import { loadSession } from '$lib/server/reserve-session';
import { loadReservation, transitionReservation } from '$lib/server/reservation';
import { InvalidTransitionError } from '$lib/booking/states';
import { loadCancellationRules } from '$lib/server/pricing-data';
import { getPaymentProvider, type Method } from '$lib/server/payment';
import { sendEmail, buildBookingEmailData, type EmailEnv } from '$lib/server/email';
import { t, l as lhref } from '$lib/i18n';
import type { PriceBreakdown } from '$lib/pricing/calculator';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, cookies, locals }) => {
	const db = getDb(platform);
	const locale = locals.locale;
	const session = await loadSession(db, cookies);
	if (!session?.data.reservationId) throw redirect(303, lhref(locale, '/reserve'));

	const res = await loadReservation(db, session.data.reservationId);
	if (!res) throw redirect(303, lhref(locale, '/reserve'));
	if (res.status === 'confirmed') throw redirect(303, lhref(locale, `/reserve/${res.code}`));
	if (res.status !== 'held' && res.status !== 'pending_payment') {
		throw redirect(303, lhref(locale, '/reserve'));
	}
	if (res.held_expires_at && res.held_expires_at < nowIso()) {
		throw redirect(303, lhref(locale, '/reserve?expired=1'));
	}

	const breakdown = res.price_snapshot ? (JSON.parse(res.price_snapshot) as PriceBreakdown) : null;
	const rules = res.cancellation_policy_id
		? await loadCancellationRules(db, res.cancellation_policy_id)
		: [];

	const vehicle = res.vehicle_id
		? await db
				.prepare('SELECT display_name, subtitle FROM vehicles WHERE id = ?')
				.bind(res.vehicle_id)
				.first<{ display_name: string; subtitle: string | null }>()
		: null;

	return {
		reservation: {
			code: res.code,
			total: res.total_amount,
			deposit: res.deposit_amount,
			pickupAt: res.pickup_scheduled_at,
			returnAt: res.return_scheduled_at
		},
		breakdown,
		rules,
		vehicle
	};
};

export const actions: Actions = {
	pay: async ({ request, platform, cookies, locals }) => {
		const db = getDb(platform);
		const locale = locals.locale;
		const session = await loadSession(db, cookies);
		if (!session?.data.reservationId) throw redirect(303, lhref(locale, '/reserve'));

		const form = await request.formData();
		const agreed = form.get('agree') === 'on';
		const method = (String(form.get('method') ?? 'card') as Method) || 'card';
		if (!agreed) return fail(400, { message: t(locale, 'pay.errAgree') });

		const res = await loadReservation(db, session.data.reservationId);
		if (!res) throw redirect(303, lhref(locale, '/reserve'));
		if (res.status === 'confirmed') throw redirect(303, lhref(locale, `/reserve/${res.code}`));
		if (res.status !== 'held' && res.status !== 'pending_payment') {
			return fail(409, { message: t(locale, 'pay.errState') });
		}
		if (res.held_expires_at && res.held_expires_at < nowIso()) {
			throw redirect(303, lhref(locale, '/reserve?expired=1'));
		}

		const now = nowIso();
		// HELD -> PENDING_PAYMENT (record consent). The conditional UPDATE inside
		// transitionReservation makes this the double-submit gate: if a parallel
		// submit already moved the reservation on, fail safely instead of 500ing.
		if (res.status === 'held') {
			try {
				await transitionReservation(db, {
					reservationId: res.id,
					to: 'pending_payment',
					actor: 'customer',
					patch: { terms_agreed_at: now, consent_edoc_at: now }
				});
			} catch (e) {
				if (e instanceof InvalidTransitionError) {
					const latest = await loadReservation(db, res.id);
					if (latest?.status === 'confirmed') {
						throw redirect(303, lhref(locale, `/reserve/${res.code}`));
					}
					return fail(409, { message: t(locale, 'pay.errState') });
				}
				throw e;
			}
		}

		// Authorize via the provider abstraction (Mock for now).
		const provider = getPaymentProvider(platform?.env as unknown as Record<string, string>);
		const auth = await provider.authorizeDeposit({
			reservationId: res.id,
			amount: res.total_amount ?? 0,
			depositAmount: res.deposit_amount ?? 0,
			currency: 'jpy',
			method,
			metadata: { code: res.code }
		});

		// Persist payment record. Map the provider status explicitly — anything we
		// don't positively recognise must never be recorded (or confirmed) as paid.
		const isWallet = method === 'wechat' || method === 'alipay';
		const authorized = auth.status === 'succeeded' || auth.status === 'requires_capture' || auth.status === 'authorized';
		const payStatus =
			auth.status === 'requires_action'
				? 'requires_action'
				: authorized
					? isWallet
						? 'captured'
						: 'requires_capture'
					: 'failed';
		await db
			.prepare(
				`INSERT INTO payments
				 (id, reservation_id, provider, method, kind, intent_id, status, authorized_amount,
				  captured_amount, deposit_amount, currency, capture_before, client_secret, created_at, updated_at)
				 VALUES (?, ?, ?, ?, 'rental', ?, ?, ?, ?, ?, 'jpy', ?, ?, ?, ?)`
			)
			.bind(
				genId(),
				res.id,
				provider.name,
				method,
				auth.providerRef,
				payStatus,
				res.total_amount ?? 0,
				isWallet ? (res.total_amount ?? 0) : null,
				res.deposit_amount ?? 0,
				auth.captureBefore ?? null,
				auth.clientSecret ?? null,
				now,
				now
			)
			.run();

		if (auth.status === 'requires_action') {
			// Card authentication (3DS etc.) not completed — never confirm here.
			// Roll back to HELD so the customer can retry while the slot is theirs.
			await transitionReservation(db, {
				reservationId: res.id,
				to: 'held',
				actor: 'customer',
				reason: 'payment requires additional authentication'
			});
			return fail(400, { message: t(locale, 'pay.errFailed') });
		}
		if (!authorized) {
			// 'failed' and any unrecognised status: roll back to HELD for retry.
			await transitionReservation(db, {
				reservationId: res.id,
				to: 'held',
				actor: 'customer',
				reason: 'payment failed'
			});
			return fail(402, { message: t(locale, 'pay.errFailed') });
		}

		// succeeded / requires_capture -> CONFIRMED.
		try {
			await transitionReservation(db, {
				reservationId: res.id,
				to: 'confirmed',
				actor: 'customer',
				reason: `mock ${method} authorized`
			});
		} catch (e) {
			if (e instanceof InvalidTransitionError) {
				// A parallel submit won the race; if it confirmed, treat as success.
				const latest = await loadReservation(db, res.id);
				if (latest?.status === 'confirmed') {
					throw redirect(303, lhref(locale, `/reserve/${res.code}`));
				}
				return fail(409, { message: t(locale, 'pay.errState') });
			}
			throw e;
		}

		// Booking confirmation + staff notification (idempotent; never block the flow).
		try {
			const env = platform?.env as unknown as EmailEnv;
			const baseUrl = env?.PUBLIC_BASE_URL || new URL(request.url).origin;
			const { data, customerEmail, locale: mailLocale } = await buildBookingEmailData(db, res, baseUrl);
			if (customerEmail) {
				await sendEmail(db, env, {
					kind: 'booking_confirmation',
					idempotencyKey: `booking_confirmation/${res.code}`,
					to: customerEmail,
					locale: mailLocale,
					reservationId: res.id,
					data
				});
			}
			if (env?.STAFF_NOTIFY_TO) {
				await sendEmail(db, env, {
					kind: 'staff_new_booking',
					idempotencyKey: `staff_new_booking/${res.code}`,
					to: env.STAFF_NOTIFY_TO,
					reservationId: res.id,
					data: { ...data, adminUrl: `${baseUrl}/dashboard/bookings/${res.id}` }
				});
			}
		} catch (e) {
			console.error('[email] booking confirmation failed', e);
		}

		throw redirect(303, lhref(locale, `/reserve/${res.code}`));
	}
};
