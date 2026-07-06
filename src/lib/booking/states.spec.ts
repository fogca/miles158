import { describe, it, expect } from 'vitest';
import {
	canTransition,
	assertTransition,
	InvalidTransitionError,
	isTerminal,
	locksInventory
} from './states';

describe('reservation state machine', () => {
	it('allows the happy-path transitions', () => {
		expect(canTransition('draft', 'quote')).toBe(true);
		expect(canTransition('quote', 'held')).toBe(true);
		expect(canTransition('held', 'pending_payment')).toBe(true);
		expect(canTransition('pending_payment', 'confirmed')).toBe(true);
		expect(canTransition('confirmed', 'checked_out')).toBe(true);
		expect(canTransition('checked_out', 'active')).toBe(true);
		expect(canTransition('active', 'returned')).toBe(true);
		expect(canTransition('returned', 'completed')).toBe(true);
	});

	it('rejects skipping payment and reviving terminal states', () => {
		expect(canTransition('held', 'confirmed')).toBe(false);
		expect(canTransition('completed', 'active')).toBe(false);
		expect(canTransition('cancelled', 'confirmed')).toBe(false);
	});

	it('assertTransition throws on an invalid transition', () => {
		expect(() => assertTransition('completed', 'active')).toThrow(InvalidTransitionError);
	});

	it('classifies terminal and locking states', () => {
		expect(isTerminal('cancelled')).toBe(true);
		expect(isTerminal('active')).toBe(false);
		expect(locksInventory('held')).toBe(true);
		expect(locksInventory('quote')).toBe(false);
	});
});
