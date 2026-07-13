// Inventory & hold service. Availability and double-booking prevention rest on
// reservation_days.UNIQUE(vehicle_id, date): every rental/buffer/blackout day is
// a row, and a colliding INSERT fails the whole atomic batch.

import {
	batchAtomic,
	genId,
	genReservationCode,
	isUniqueConstraintError,
	SlotConflictError,
	type DB
} from './db';
import { nowIso } from '$lib/time';
import type { PriceBreakdown } from '$lib/pricing/calculator';

// Sentinel reservation that owns all staff blackout days (see migration 0005).
export const BLACKOUT_RES_ID = 'res_blackout_system';

export interface VehicleAvailabilityRow {
	id: string;
	class_id: string;
	display_name: string;
	subtitle: string | null;
	image_url: string | null;
	color: string | null;
	registration_number: string;
	status: string;
	class_code: string;
	class_name_ja: string;
	class_name_en: string | null;
	class_name_zh: string | null;
	base_rate_24h: number;
	deposit_amount: number;
}

/** Vehicles with no slot in [startDate, endDate] (expired holds ignored). */
export async function findAvailableVehicles(
	db: DB,
	params: { classId?: string; startDate: string; endDate: string }
): Promise<VehicleAvailabilityRow[]> {
	const occupied = `
		SELECT rd.vehicle_id FROM reservation_days rd
		JOIN reservations r ON r.id = rd.reservation_id
		WHERE rd.date BETWEEN ? AND ?
		  AND NOT (r.status = 'held' AND r.held_expires_at < ?)`;
	let sql = `
		SELECT v.id, v.class_id, v.display_name, v.subtitle, v.image_url, v.color,
		       v.registration_number, v.status,
		       vc.code AS class_code, vc.name_ja AS class_name_ja,
		       vc.name_en AS class_name_en, vc.name_zh_hans AS class_name_zh,
		       vc.base_rate_24h, vc.deposit_amount
		FROM vehicles v
		JOIN vehicle_classes vc ON vc.id = v.class_id
		WHERE v.status = 'active' AND v.deleted_at IS NULL
		  AND v.id NOT IN (${occupied})`;
	const binds: unknown[] = [params.startDate, params.endDate, nowIso()];
	if (params.classId) {
		sql += ' AND v.class_id = ?';
		binds.push(params.classId);
	}
	sql += ' ORDER BY vc.sort_order, v.display_name';
	return (await db.prepare(sql).bind(...binds).all<VehicleAvailabilityRow>()).results;
}

/** True if a specific vehicle is free for every day in the list. */
export async function isVehicleAvailable(
	db: DB,
	vehicleId: string,
	days: string[]
): Promise<boolean> {
	if (days.length === 0) return false;
	const placeholders = days.map(() => '?').join(',');
	const row = await db
		.prepare(
			`SELECT COUNT(*) AS n FROM reservation_days rd
			 JOIN reservations r ON r.id = rd.reservation_id
			 WHERE rd.vehicle_id = ? AND rd.date IN (${placeholders})
			   AND NOT (r.status = 'held' AND r.held_expires_at < ?)`
		)
		.bind(vehicleId, ...days, nowIso())
		.first<{ n: number }>();
	return (row?.n ?? 0) === 0;
}

function dayStmt(db: DB, resId: string, vehicleId: string, date: string, type: string) {
	return db
		.prepare(
			`INSERT INTO reservation_days (id, reservation_id, vehicle_id, date, type)
			 VALUES (?, ?, ?, ?, ?)`
		)
		.bind(genId(), resId, vehicleId, date, type);
}

function historyStmt(
	db: DB,
	resId: string,
	from: string | null,
	to: string,
	by: string,
	reason: string | null,
	at: string
) {
	return db
		.prepare(
			`INSERT INTO reservation_status_history (id, reservation_id, from_status, to_status, triggered_by, reason, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(genId(), resId, from, to, by, reason, at);
}

export interface HoldInput {
	vehicleId: string;
	classId: string;
	pickupAt: string;
	returnAt: string;
	slotDays: string[];
	bufferDays: string[];
	breakdown: PriceBreakdown;
	depositAmount: number;
	cdwSelected: boolean;
	nocWaiver: boolean;
	optionRows: {
		optionId: string;
		unitPrice: number;
		type: 'per_rental' | 'per_day';
		qty: number;
		lineAmount: number;
	}[];
	cancellationPolicyId: string | null;
	holdMinutes: number;
	origin: string;
	pickupOffice?: string;
	returnOffice?: string;
}

export interface HoldResult {
	reservationId: string;
	code: string;
	heldExpiresAt: string;
}

/**
 * Atomically create a HELD reservation + its day slots + option lines.
 * Throws SlotConflictError if any day is already taken.
 */
export async function createHold(db: DB, p: HoldInput): Promise<HoldResult> {
	const id = genId();
	const code = genReservationCode();
	const now = nowIso();
	const expires = new Date(Date.now() + p.holdMinutes * 60_000).toISOString();
	const optionsAmount = p.breakdown.optionsAmount + p.breakdown.coverageAmount;

	// Purge expired holds on this vehicle first (same effect as expireHolds), so
	// their leftover reservation_days rows cannot block the UNIQUE inserts below.
	// Runs inside the same atomic batch: order matters — history and day deletion
	// reference status='held' and must precede the UPDATE that cancels them.
	const expiredHoldCond = `vehicle_id = ? AND status IN ('held', 'pending_payment') AND held_expires_at < ?`;
	const purgeStmts = [
		db
			.prepare(
				`INSERT INTO reservation_status_history (id, reservation_id, from_status, to_status, triggered_by, reason, created_at)
				 SELECT lower(hex(randomblob(16))), id, status, 'cancelled', 'system', 'hold expired (purged on new hold)', ?
				 FROM reservations WHERE ${expiredHoldCond}`
			)
			.bind(now, p.vehicleId, now),
		db
			.prepare(
				`DELETE FROM reservation_days WHERE reservation_id IN
				 (SELECT id FROM reservations WHERE ${expiredHoldCond})`
			)
			.bind(p.vehicleId, now),
		db
			.prepare(
				`UPDATE reservations SET status = 'cancelled', cancelled_at = ?, updated_at = ?
				 WHERE ${expiredHoldCond}`
			)
			.bind(now, now, p.vehicleId, now)
	];

	const stmts = [
		...purgeStmts,
		db
			.prepare(
				`INSERT INTO reservations
				 (id, code, status, origin, vehicle_id, class_id, pickup_office, return_office,
				  pickup_scheduled_at, return_scheduled_at, price_snapshot, base_amount, options_amount,
				  subtotal, tax_amount, total_amount, deposit_amount, cancellation_policy_id,
				  cdw_selected, noc_waiver_purchased, created_at, updated_at, quoted_at, held_at, held_expires_at)
				 VALUES (?, ?, 'held', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.bind(
				id,
				code,
				p.origin,
				p.vehicleId,
				p.classId,
				p.pickupOffice ?? 'nagoya',
				p.returnOffice ?? 'nagoya',
				p.pickupAt,
				p.returnAt,
				JSON.stringify(p.breakdown),
				p.breakdown.baseAmount,
				optionsAmount,
				p.breakdown.subtotal,
				p.breakdown.taxAmount,
				p.breakdown.total,
				p.depositAmount,
				p.cancellationPolicyId,
				p.cdwSelected ? 1 : 0,
				p.nocWaiver ? 1 : 0,
				now,
				now,
				now,
				now,
				expires
			),
		...p.slotDays.map((d) => dayStmt(db, id, p.vehicleId, d, 'rental')),
		...p.bufferDays.map((d) => dayStmt(db, id, p.vehicleId, d, 'buffer')),
		...p.optionRows.map((o) =>
			db
				.prepare(
					`INSERT INTO booking_options (id, reservation_id, option_id, quantity, unit_price, pricing_type, line_amount)
					 VALUES (?, ?, ?, ?, ?, ?, ?)`
				)
				.bind(genId(), id, o.optionId, o.qty, o.unitPrice, o.type, o.lineAmount)
		),
		historyStmt(db, id, null, 'held', 'customer', null, now)
	];

	await batchAtomic(db, stmts);
	return { reservationId: id, code, heldExpiresAt: expires };
}

/** Delete all day slots for a reservation (on cancel / expiry / no-show). */
export async function releaseSlots(db: DB, reservationId: string): Promise<void> {
	await db.prepare('DELETE FROM reservation_days WHERE reservation_id = ?').bind(reservationId).run();
}

/** Cron: expire stale holds (incl. abandoned pending_payment). Returns count expired. */
export async function expireHolds(db: DB, now = nowIso()): Promise<number> {
	const rows = (
		await db
			.prepare(
				`SELECT id, status FROM reservations
				 WHERE status IN ('held', 'pending_payment') AND held_expires_at < ?`
			)
			.bind(now)
			.all<{ id: string; status: string }>()
	).results;
	for (const r of rows) {
		await db.batch([
			db
				.prepare(
					`UPDATE reservations SET status = 'cancelled', cancelled_at = ?, updated_at = ? WHERE id = ? AND status = ?`
				)
				.bind(now, now, r.id, r.status),
			db.prepare('DELETE FROM reservation_days WHERE reservation_id = ?').bind(r.id),
			historyStmt(db, r.id, r.status, 'cancelled', 'cron', 'hold expired', now)
		]);
	}
	return rows.length;
}

/** Mark a single day as company-unavailable (blackout) for a vehicle. */
export async function addBlackout(db: DB, vehicleId: string, date: string): Promise<void> {
	try {
		await db
			.prepare(
				`INSERT INTO reservation_days (id, reservation_id, vehicle_id, date, type)
				 VALUES (?, ?, ?, ?, 'blackout')`
			)
			.bind(genId(), BLACKOUT_RES_ID, vehicleId, date)
			.run();
	} catch (e) {
		if (isUniqueConstraintError(e)) {
			throw new SlotConflictError('その日はすでに予約または確保されています。');
		}
		throw e;
	}
}

/** Remove a blackout day (only blackout slots, never a real booking). */
export async function removeBlackout(db: DB, vehicleId: string, date: string): Promise<void> {
	await db
		.prepare(
			`DELETE FROM reservation_days WHERE reservation_id = ? AND vehicle_id = ? AND date = ? AND type = 'blackout'`
		)
		.bind(BLACKOUT_RES_ID, vehicleId, date)
		.run();
}

/** Cron: flag no-shows for confirmed reservations past pickup + grace minutes. */
export async function flagNoShows(db: DB, graceMinutes = 60, now = nowIso()): Promise<number> {
	const cutoff = new Date(Date.now() - graceMinutes * 60_000).toISOString();
	// Fee follows the reservation's cancellation policy (no_show_fee_percent),
	// not a hard-coded 100%. Missing policy falls back to 100%.
	const rows = (
		await db
			.prepare(
				`SELECT r.id, r.base_amount, COALESCE(cp.no_show_fee_percent, 100) AS no_show_fee_percent
				 FROM reservations r
				 LEFT JOIN cancellation_policies cp ON cp.id = r.cancellation_policy_id
				 WHERE r.status = 'confirmed' AND r.pickup_scheduled_at IS NOT NULL AND r.pickup_scheduled_at < ?`
			)
			.bind(cutoff)
			.all<{ id: string; base_amount: number | null; no_show_fee_percent: number }>()
	).results;
	for (const r of rows) {
		const fee = Math.round(((r.base_amount ?? 0) * r.no_show_fee_percent) / 100);
		await db.batch([
			db
				.prepare(
					`UPDATE reservations SET status = 'no_show', no_show_at = ?, cancellation_fee = ?, updated_at = ? WHERE id = ? AND status = 'confirmed'`
				)
				.bind(now, fee, now, r.id),
			db.prepare('DELETE FROM reservation_days WHERE reservation_id = ?').bind(r.id),
			historyStmt(db, r.id, 'confirmed', 'no_show', 'cron', 'no-show grace exceeded', now)
		]);
	}
	return rows.length;
}
