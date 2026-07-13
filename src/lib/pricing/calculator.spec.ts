import { describe, it, expect } from 'vitest';
import { calcTotal, type ClassRate, type DurationDiscount } from './calculator';
import { weekendFactor, WEEKEND_MULTIPLIER } from '$lib/server/pricing-data';
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

// R-1 regression: the JST weekday must be resolved independently of the runtime
// timezone (Workers run in UTC). Fri/Sat/Sun carry the weekend surcharge.
describe('weekendFactor (JST weekday, TZ-independent)', () => {
	it('applies 1.3 on Fri/Sat/Sun (JST)', () => {
		expect(weekendFactor('2026-07-10')).toBe(WEEKEND_MULTIPLIER); // Fri
		expect(weekendFactor('2026-07-11')).toBe(WEEKEND_MULTIPLIER); // Sat
		expect(weekendFactor('2026-07-12')).toBe(WEEKEND_MULTIPLIER); // Sun
	});

	it('applies 1.0 on Thu/Mon (JST)', () => {
		expect(weekendFactor('2026-07-09')).toBe(1); // Thu
		expect(weekendFactor('2026-07-13')).toBe(1); // Mon
	});

	it('holds at week boundaries regardless of runtime TZ', () => {
		// Year-end boundary: 2026-12-31 = Thu, 2027-01-01 = Fri.
		expect(weekendFactor('2026-12-31')).toBe(1);
		expect(weekendFactor('2027-01-01')).toBe(WEEKEND_MULTIPLIER);
	});
});
