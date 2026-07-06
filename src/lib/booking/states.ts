// Reservation lifecycle state machine. The transition guard is pure and shared;
// the DB-mutating transition lives in $lib/server/reservation.ts and must only be
// called from server endpoints. Clients never set state directly.

export const STATES = [
	'draft',
	'quote',
	'held',
	'pending_payment',
	'confirmed',
	'checked_out',
	'active',
	'returned',
	'completed',
	'cancelled',
	'no_show'
] as const;

export type ReservationState = (typeof STATES)[number];

/** Allowed transitions. Anything not listed here is rejected. */
export const ALLOWED_TRANSITIONS: Record<ReservationState, ReservationState[]> = {
	draft: ['quote', 'cancelled'],
	quote: ['held', 'cancelled'],
	held: ['pending_payment', 'cancelled'],
	pending_payment: ['confirmed', 'held', 'cancelled'],
	confirmed: ['checked_out', 'cancelled', 'no_show'],
	checked_out: ['active', 'returned'],
	active: ['returned'],
	returned: ['completed'],
	completed: [],
	cancelled: [],
	no_show: []
};

/** States that physically occupy inventory (have reservation_days rows). */
export const LOCKING_STATES: ReadonlySet<ReservationState> = new Set([
	'held',
	'pending_payment',
	'confirmed',
	'checked_out',
	'active',
	'returned'
]);

/** Terminal states — no further transitions. */
export const TERMINAL_STATES: ReadonlySet<ReservationState> = new Set([
	'completed',
	'cancelled',
	'no_show'
]);

export function canTransition(from: ReservationState, to: ReservationState): boolean {
	return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export class InvalidTransitionError extends Error {
	constructor(from: ReservationState, to: ReservationState) {
		super(`Invalid reservation transition: ${from} -> ${to}`);
		this.name = 'InvalidTransitionError';
	}
}

export function assertTransition(from: ReservationState, to: ReservationState): void {
	if (!canTransition(from, to)) throw new InvalidTransitionError(from, to);
}

export function isTerminal(state: ReservationState): boolean {
	return TERMINAL_STATES.has(state);
}

export function locksInventory(state: ReservationState): boolean {
	return LOCKING_STATES.has(state);
}
