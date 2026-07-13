// Reservation service: the ONLY place reservation.status changes. Guards the
// transition, stamps the lifecycle timestamp, writes status history + audit, and
// releases inventory slots on cancel/no-show. Call from server endpoints only.

import { genId, type DB } from './db';
import { nowIso } from '$lib/time';
import { assertTransition, InvalidTransitionError, type ReservationState } from '$lib/booking/states';

export interface ReservationRow {
	id: string;
	code: string;
	status: ReservationState;
	origin: string;
	vehicle_id: string | null;
	class_id: string | null;
	customer_id: string | null;
	pickup_office: string | null;
	return_office: string | null;
	pickup_scheduled_at: string | null;
	return_scheduled_at: string | null;
	base_amount: number | null;
	options_amount: number | null;
	subtotal: number | null;
	tax_amount: number | null;
	total_amount: number | null;
	deposit_amount: number | null;
	cancellation_fee: number | null;
	cancellation_policy_id: string | null;
	cdw_selected: number;
	noc_waiver_purchased: number;
	mileage_overage_km: number | null;
	mileage_overage_amount: number | null;
	price_snapshot: string | null;
	held_expires_at: string | null;
	[key: string]: unknown;
}

// Lifecycle timestamp column written when entering a state.
const TS_COL: Partial<Record<ReservationState, string>> = {
	quote: 'quoted_at',
	held: 'held_at',
	confirmed: 'confirmed_at',
	checked_out: 'checked_out_at',
	returned: 'returned_at',
	completed: 'completed_at',
	cancelled: 'cancelled_at',
	no_show: 'no_show_at'
};

// Columns a transition is allowed to patch (prevents arbitrary column writes).
const PATCH_COLS = new Set([
	'customer_id',
	'cancellation_fee',
	'mileage_start_km',
	'mileage_end_km',
	'mileage_overage_km',
	'mileage_overage_amount',
	'fuel_start',
	'fuel_end',
	'accident_notes',
	'passenger_count',
	'route_destination',
	'notes',
	'terms_agreed_at',
	'consent_edoc_at',
	'extension_requested_at',
	'extension_approved_at',
	'overstay_flagged_at'
]);

export async function loadReservation(db: DB, id: string): Promise<ReservationRow | null> {
	return db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<ReservationRow>();
}

export async function getReservationByCode(db: DB, code: string): Promise<ReservationRow | null> {
	return db.prepare('SELECT * FROM reservations WHERE code = ?').bind(code).first<ReservationRow>();
}

export interface TransitionParams {
	reservationId: string;
	to: ReservationState;
	actor: string; // 'customer' | 'staff:<id>' | 'cron' | 'webhook'
	reason?: string;
	patch?: Record<string, unknown>;
	ip?: string | null;
}

/** Guarded state transition. Returns the updated row, or throws on invalid transition. */
export async function transitionReservation(
	db: DB,
	params: TransitionParams
): Promise<ReservationRow> {
	const current = await loadReservation(db, params.reservationId);
	if (!current) throw new Error(`Reservation not found: ${params.reservationId}`);

	const from = current.status;
	assertTransition(from, params.to);

	const now = nowIso();
	const sets = ['status = ?', 'updated_at = ?'];
	const vals: unknown[] = [params.to, now];

	const tsCol = TS_COL[params.to];
	if (tsCol) {
		sets.push(`${tsCol} = ?`);
		vals.push(now);
	}
	if (params.to === 'confirmed') {
		sets.push('paid_at = COALESCE(paid_at, ?)');
		vals.push(now);
	}

	const appliedPatch: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(params.patch ?? {})) {
		if (!PATCH_COLS.has(k)) continue;
		sets.push(`${k} = ?`);
		vals.push(v);
		appliedPatch[k] = v;
	}
	vals.push(params.reservationId, from);

	// TOCTOU guard: every statement is conditioned on the row still being in
	// `from` when the batch runs, so a lost race writes nothing (no phantom
	// history/audit rows, no premature slot release). Statement order matters:
	// the gated INSERTs/DELETE run before the UPDATE flips the status.
	const guard = `EXISTS (SELECT 1 FROM reservations WHERE id = ? AND status = ?)`;
	const stmts = [
		db
			.prepare(
				`INSERT INTO reservation_status_history (id, reservation_id, from_status, to_status, triggered_by, reason, created_at)
				 SELECT ?, ?, ?, ?, ?, ?, ? WHERE ${guard}`
			)
			.bind(
				genId(),
				params.reservationId,
				from,
				params.to,
				params.actor,
				params.reason ?? null,
				now,
				params.reservationId,
				from
			),
		db
			.prepare(
				`INSERT INTO audit_log (id, actor, action, entity, entity_id, before, after, ip, created_at)
				 SELECT ?, ?, 'reservation.transition', 'reservation', ?, ?, ?, ?, ? WHERE ${guard}`
			)
			.bind(
				genId(),
				params.actor,
				params.reservationId,
				JSON.stringify({ status: from }),
				JSON.stringify({ status: params.to, ...appliedPatch }),
				params.ip ?? null,
				now,
				params.reservationId,
				from
			)
	];

	// Free inventory when the booking ends without a rental.
	if (params.to === 'cancelled' || params.to === 'no_show') {
		stmts.push(
			db
				.prepare(`DELETE FROM reservation_days WHERE reservation_id = ? AND ${guard}`)
				.bind(params.reservationId, params.reservationId, from)
		);
	}

	// Conditional UPDATE last: only fires while status is still `from`.
	stmts.push(
		db.prepare(`UPDATE reservations SET ${sets.join(', ')} WHERE id = ? AND status = ?`).bind(...vals)
	);

	await db.batch(stmts);

	// Post-verify: D1 offers no interactive transactions, so confirm the row
	// actually reached the target state; otherwise a concurrent writer won.
	const after = await db
		.prepare('SELECT status FROM reservations WHERE id = ?')
		.bind(params.reservationId)
		.first<{ status: ReservationState }>();
	if (after?.status !== params.to) {
		throw new InvalidTransitionError(from, params.to);
	}

	return { ...current, status: params.to, ...appliedPatch };
}

export interface ReservationDetail {
	reservation: ReservationRow;
	options: Array<{
		option_id: string;
		quantity: number;
		line_amount: number;
		name_ja: string;
		name_en: string | null;
		name_zh_hans: string | null;
		pricing_type: string;
	}>;
	history: Array<{ from_status: string | null; to_status: string; triggered_by: string; reason: string | null; created_at: string }>;
	payments: Array<Record<string, unknown>>;
	days: Array<{ date: string; type: string }>;
	vehicle: Record<string, unknown> | null;
	customer: Record<string, unknown> | null;
}

/** Full reservation aggregate for the dashboard detail view. */
export async function getReservationDetail(db: DB, id: string): Promise<ReservationDetail | null> {
	const reservation = await loadReservation(db, id);
	if (!reservation) return null;

	const [options, history, payments, days, vehicle, customer] = await Promise.all([
		db
			.prepare(
				`SELECT bo.option_id, bo.quantity, bo.line_amount, bo.pricing_type, oc.name_ja, oc.name_en, oc.name_zh_hans
				 FROM booking_options bo JOIN option_catalog oc ON oc.id = bo.option_id
				 WHERE bo.reservation_id = ?`
			)
			.bind(id)
			.all(),
		db
			.prepare(
				`SELECT from_status, to_status, triggered_by, reason, created_at
				 FROM reservation_status_history WHERE reservation_id = ? ORDER BY created_at`
			)
			.bind(id)
			.all(),
		db.prepare('SELECT * FROM payments WHERE reservation_id = ? ORDER BY created_at').bind(id).all(),
		db
			.prepare('SELECT date, type FROM reservation_days WHERE reservation_id = ? ORDER BY date')
			.bind(id)
			.all(),
		reservation.vehicle_id
			? db.prepare('SELECT * FROM vehicles WHERE id = ?').bind(reservation.vehicle_id).first()
			: Promise.resolve(null),
		reservation.customer_id
			? db.prepare('SELECT * FROM customers WHERE id = ?').bind(reservation.customer_id).first()
			: Promise.resolve(null)
	]);

	return {
		reservation,
		options: (options.results ?? []) as ReservationDetail['options'],
		history: (history.results ?? []) as ReservationDetail['history'],
		payments: (payments.results ?? []) as ReservationDetail['payments'],
		days: (days.results ?? []) as ReservationDetail['days'],
		vehicle: (vehicle as Record<string, unknown> | null) ?? null,
		customer: (customer as Record<string, unknown> | null) ?? null
	};
}
