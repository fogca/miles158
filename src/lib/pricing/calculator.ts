// Pure rental price calculator. Shared by client (live estimate) and server
// (authoritative recompute). The server result is what gets snapshotted onto the
// reservation — never trust a client-sent total.

import { addDaysStr, billedDays, jstDateStr } from '$lib/time';

export const TAX_RATE = 0.1; // consumption tax (constant, not a magic number)

export interface ClassRate {
	base24h: number; // first 24h, normal season, tax-excl
	extra24h: number; // each additional 24h
	extra1h: number; // hourly overflow (reserved for future hourly billing)
	cdwPerDay: number;
	nocWaiverPerDay: number;
}

/** Returns the season multiplier for a JST 'YYYY-MM-DD' date. */
export type SeasonResolver = (jstDate: string) => number;

export interface PriceOptionInput {
	code: string;
	label?: string;
	unitPrice: number;
	type: 'per_rental' | 'per_day';
	qty: number;
}

export interface DurationDiscount {
	minDays: number;
	ratePercent: number;
}

export interface PriceInput {
	classRate: ClassRate;
	pickupAt: string; // ISO UTC
	returnAt: string; // ISO UTC
	seasonMultiplier: SeasonResolver;
	options: PriceOptionInput[];
	durationDiscounts: DurationDiscount[];
	cdwSelected: boolean;
	nocWaiver: boolean;
}

export interface PriceLine {
	code: string;
	label: string;
	amount: number;
	detail?: string;
}

export interface PriceBreakdown {
	rentalDays: number;
	baseAmount: number;
	coverageAmount: number;
	optionsAmount: number;
	discountPercent: number;
	discountAmount: number;
	subtotal: number;
	taxAmount: number;
	total: number;
	lines: PriceLine[];
}

export function calcTotal(input: PriceInput): PriceBreakdown {
	const {
		classRate,
		pickupAt,
		returnAt,
		seasonMultiplier,
		options,
		durationDiscounts,
		cdwSelected,
		nocWaiver
	} = input;

	const days = billedDays(pickupAt, returnAt);
	const pickupDate = jstDateStr(pickupAt);
	const lines: PriceLine[] = [];

	// Base: day-by-day so a rental spanning multiple seasons is priced correctly.
	let baseAmount = 0;
	for (let i = 0; i < days; i++) {
		const date = addDaysStr(pickupDate, i);
		const dayRate = i === 0 ? classRate.base24h : classRate.extra24h;
		const mult = seasonMultiplier(date) || 1;
		baseAmount += Math.round(dayRate * mult);
	}
	lines.push({
		code: 'base',
		label: 'レンタル料金',
		amount: baseAmount,
		detail: `${days}日`
	});

	// Coverage (class-priced, not season-scaled).
	let coverageAmount = 0;
	if (cdwSelected) {
		const cdw = classRate.cdwPerDay * days;
		coverageAmount += cdw;
		lines.push({ code: 'cdw', label: '車両補償(CDW)', amount: cdw, detail: `${days}日` });
	}
	if (nocWaiver) {
		const noc = classRate.nocWaiverPerDay * days;
		coverageAmount += noc;
		lines.push({ code: 'noc_waiver', label: 'NOC免除', amount: noc, detail: `${days}日` });
	}

	// Options.
	let optionsAmount = 0;
	for (const o of options) {
		if (o.qty <= 0) continue;
		const amount = o.type === 'per_day' ? o.unitPrice * o.qty * days : o.unitPrice * o.qty;
		optionsAmount += amount;
		lines.push({
			code: `opt_${o.code}`,
			label: o.label ?? o.code,
			amount,
			detail: o.type === 'per_day' ? `${o.qty}×${days}日` : `×${o.qty}`
		});
	}

	// Duration discount (applies to base only).
	const discountPercent = durationDiscounts
		.filter((d) => days >= d.minDays)
		.reduce((max, d) => Math.max(max, d.ratePercent), 0);
	const discountAmount = Math.round((baseAmount * discountPercent) / 100);
	if (discountAmount > 0) {
		lines.push({
			code: 'discount',
			label: `長期割引 ${discountPercent}%`,
			amount: -discountAmount
		});
	}

	const subtotal = baseAmount + coverageAmount + optionsAmount - discountAmount;
	const taxAmount = Math.round(subtotal * TAX_RATE);
	const total = subtotal + taxAmount;

	return {
		rentalDays: days,
		baseAmount,
		coverageAmount,
		optionsAmount,
		discountPercent,
		discountAmount,
		subtotal,
		taxAmount,
		total,
		lines
	};
}
