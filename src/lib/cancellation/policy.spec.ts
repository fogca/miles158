import { describe, it, expect } from 'vitest';
import { calcCancellationFee, calcNoShowFee, type CancellationRule } from './policy';

const RULES: CancellationRule[] = [
	{ hoursBeforeMin: 0, hoursBeforeMax: 24, feePercent: 50, feeCapJpy: null },
	{ hoursBeforeMin: 24, hoursBeforeMax: 72, feePercent: 30, feeCapJpy: null },
	{ hoursBeforeMin: 72, hoursBeforeMax: 168, feePercent: 20, feeCapJpy: null },
	{ hoursBeforeMin: 168, hoursBeforeMax: null, feePercent: 0, feeCapJpy: null }
];

describe('calcCancellationFee', () => {
	it('is free 7+ days before pickup', () => {
		expect(calcCancellationFee(100000, 200, RULES).feeJpy).toBe(0);
	});
	it('charges 20% at 3-6 days before', () => {
		expect(calcCancellationFee(100000, 100, RULES).feeJpy).toBe(20000);
	});
	it('charges 30% at 1-2 days before', () => {
		expect(calcCancellationFee(100000, 48, RULES).feeJpy).toBe(30000);
	});
	it('charges 50% on the same day', () => {
		expect(calcCancellationFee(100000, 5, RULES).feeJpy).toBe(50000);
	});
	it('respects a fee cap when present', () => {
		const capped: CancellationRule[] = [
			{ hoursBeforeMin: 0, hoursBeforeMax: null, feePercent: 50, feeCapJpy: 6600 }
		];
		expect(calcCancellationFee(100000, 5, capped).feeJpy).toBe(6600);
	});
	it('computes a 100% no-show fee', () => {
		expect(calcNoShowFee(100000, 100)).toBe(100000);
	});
});
