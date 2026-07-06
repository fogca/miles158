import { describe, it, expect } from 'vitest';
import { calcTotal, type ClassRate, type DurationDiscount } from './calculator';
import { jstDateToUtc } from '$lib/time';

const GT: ClassRate = {
	base24h: 45000,
	extra24h: 38000,
	extra1h: 4000,
	cdwPerDay: 3300,
	nocWaiverPerDay: 1650
};
const DISCOUNTS: DurationDiscount[] = [
	{ minDays: 3, ratePercent: 5 },
	{ minDays: 7, ratePercent: 10 }
];
const normal = () => 1.0;

describe('calcTotal', () => {
	it('prices a 2-day normal-season rental', () => {
		const r = calcTotal({
			classRate: GT,
			pickupAt: jstDateToUtc('2026-09-10', '10:00'),
			returnAt: jstDateToUtc('2026-09-12', '10:00'),
			seasonMultiplier: normal,
			options: [],
			durationDiscounts: DISCOUNTS,
			cdwSelected: false,
			nocWaiver: false
		});
		expect(r.rentalDays).toBe(2);
		expect(r.baseAmount).toBe(83000); // 45000 + 38000
		expect(r.taxAmount).toBe(8300);
		expect(r.total).toBe(91300);
		expect(r.discountPercent).toBe(0);
	});

	it('applies the season multiplier day-by-day across a boundary', () => {
		const r = calcTotal({
			classRate: GT,
			pickupAt: jstDateToUtc('2026-07-10', '10:00'),
			returnAt: jstDateToUtc('2026-07-12', '10:00'),
			seasonMultiplier: (d) => (d === '2026-07-11' ? 1.2 : 1.0),
			options: [],
			durationDiscounts: DISCOUNTS,
			cdwSelected: false,
			nocWaiver: false
		});
		// day0 45000*1.0 + day1 38000*1.2(=45600) = 90600
		expect(r.baseAmount).toBe(90600);
	});

	it('applies the long-stay discount to base only', () => {
		const r = calcTotal({
			classRate: GT,
			pickupAt: jstDateToUtc('2026-09-10', '10:00'),
			returnAt: jstDateToUtc('2026-09-13', '10:00'),
			seasonMultiplier: normal,
			options: [],
			durationDiscounts: DISCOUNTS,
			cdwSelected: false,
			nocWaiver: false
		});
		expect(r.rentalDays).toBe(3);
		expect(r.baseAmount).toBe(121000); // 45000 + 38000 + 38000
		expect(r.discountPercent).toBe(5);
		expect(r.discountAmount).toBe(6050);
		expect(r.subtotal).toBe(114950);
		expect(r.total).toBe(126445);
	});

	it('adds coverage and options correctly', () => {
		const r = calcTotal({
			classRate: GT,
			pickupAt: jstDateToUtc('2026-09-10', '10:00'),
			returnAt: jstDateToUtc('2026-09-12', '10:00'),
			seasonMultiplier: normal,
			options: [
				{ code: 'wifi', unitPrice: 1100, type: 'per_day', qty: 1 },
				{ code: 'child_seat', unitPrice: 3300, type: 'per_rental', qty: 1 }
			],
			durationDiscounts: DISCOUNTS,
			cdwSelected: true,
			nocWaiver: false
		});
		expect(r.coverageAmount).toBe(6600); // 3300 * 2
		expect(r.optionsAmount).toBe(5500); // 1100*2 + 3300
		expect(r.subtotal).toBe(95100); // 83000 + 6600 + 5500
		expect(r.total).toBe(104610);
	});
});
