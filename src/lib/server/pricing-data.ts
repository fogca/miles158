// Server-side data access for pricing: loads class rates, season multipliers,
// option catalog, discounts and cancellation rules from D1, then composes an
// authoritative quote via the pure calculator.

import type { DB } from './db';
import {
	calcTotal,
	type ClassRate,
	type DurationDiscount,
	type PriceBreakdown,
	type PriceOptionInput
} from '$lib/pricing/calculator';
import type { CancellationRule } from '$lib/cancellation/policy';

export interface VehicleClassRow {
	id: string;
	code: string;
	name_ja: string;
	name_en: string | null;
	name_zh_hans: string | null;
	name_zh_hant: string | null;
	base_rate_24h: number;
	extra_24h: number;
	extra_1h: number;
	cdw_per_day: number;
	noc_waiver_per_day: number;
	deposit_amount: number;
	body_diagram: string | null;
}

export interface OptionRow {
	id: string;
	code: string;
	name_ja: string;
	name_en: string | null;
	name_zh_hans: string | null;
	name_zh_hant: string | null;
	pricing_type: 'per_rental' | 'per_day';
	price_amount: number;
	max_quantity: number;
	preselect: number;
	category: string | null;
}

export async function loadVehicleClass(db: DB, classId: string): Promise<VehicleClassRow | null> {
	return db.prepare('SELECT * FROM vehicle_classes WHERE id = ?').bind(classId).first<VehicleClassRow>();
}

export function classToRate(c: VehicleClassRow): ClassRate {
	return {
		base24h: c.base_rate_24h,
		extra24h: c.extra_24h,
		extra1h: c.extra_1h,
		cdwPerDay: c.cdw_per_day,
		nocWaiverPerDay: c.noc_waiver_per_day
	};
}

// Weekend surcharge (Fri/Sat/Sun) — applied on top of the season multiplier.
export const WEEKEND_MULTIPLIER = 1.3;
const WEEKEND_DOW = new Set([5, 6, 0]); // getDay(): Sun=0 … Fri=5, Sat=6

function weekendFactor(date: string): number {
	const dow = new Date(`${date}T00:00:00+09:00`).getDay();
	return WEEKEND_DOW.has(dow) ? WEEKEND_MULTIPLIER : 1;
}

/**
 * Effective daily-rate multiplier for a date = season multiplier × weekend
 * surcharge. Single source of truth used by computeQuote (authoritative) and the
 * /reserve calendar/cart, so all three always agree.
 */
export async function loadRateMultiplier(db: DB, classId: string) {
	const periods = (
		await db
			.prepare(
				`SELECT start_date, end_date, season_id FROM season_periods ORDER BY priority DESC`
			)
			.all<{ start_date: string; end_date: string; season_id: string }>()
	).results;
	const rates = (
		await db
			.prepare('SELECT season_id, multiplier FROM season_rates WHERE class_id = ?')
			.bind(classId)
			.all<{ season_id: string; multiplier: number }>()
	).results;
	const rateMap = new Map(rates.map((r) => [r.season_id, r.multiplier]));
	return (date: string): number => {
		let seasonMult = 1.0;
		for (const p of periods) {
			if (date >= p.start_date && date <= p.end_date) {
				const m = rateMap.get(p.season_id);
				if (m != null) {
					seasonMult = m;
					break;
				}
			}
		}
		return seasonMult * weekendFactor(date);
	};
}

export async function loadOptions(db: DB): Promise<OptionRow[]> {
	return (
		await db
			.prepare('SELECT * FROM option_catalog WHERE active = 1 ORDER BY sort_order')
			.all<OptionRow>()
	).results;
}

export async function loadDurationDiscounts(db: DB): Promise<DurationDiscount[]> {
	const rows = (
		await db
			.prepare('SELECT min_days, rate_percent FROM duration_discounts WHERE active = 1')
			.all<{ min_days: number; rate_percent: number }>()
	).results;
	return rows.map((r) => ({ minDays: r.min_days, ratePercent: r.rate_percent }));
}

export async function loadActiveCancellationPolicy(db: DB) {
	return db
		.prepare('SELECT * FROM cancellation_policies WHERE active = 1 ORDER BY effective_from DESC LIMIT 1')
		.first<{ id: string; no_show_fee_percent: number }>();
}

export async function loadCancellationRules(db: DB, policyId: string): Promise<CancellationRule[]> {
	const rows = (
		await db
			.prepare(
				'SELECT hours_before_min, hours_before_max, fee_percent, fee_cap_jpy FROM cancellation_rules WHERE policy_id = ? ORDER BY sort_order'
			)
			.bind(policyId)
			.all<{
				hours_before_min: number;
				hours_before_max: number | null;
				fee_percent: number;
				fee_cap_jpy: number | null;
			}>()
	).results;
	return rows.map((r) => ({
		hoursBeforeMin: r.hours_before_min,
		hoursBeforeMax: r.hours_before_max,
		feePercent: r.fee_percent,
		feeCapJpy: r.fee_cap_jpy
	}));
}

export interface OptionSelection {
	optionId: string;
	qty: number;
}

export interface ResolvedOption extends PriceOptionInput {
	optionId: string;
	lineAmount: number;
}

export interface Quote {
	breakdown: PriceBreakdown;
	depositAmount: number;
	classRow: VehicleClassRow;
	optionRows: ResolvedOption[];
	cancellationPolicyId: string | null;
}

/** Authoritative server-side quote. Never trust a client-supplied total. */
export async function computeQuote(
	db: DB,
	params: {
		classId: string;
		pickupAt: string;
		returnAt: string;
		options: OptionSelection[];
		cdwSelected: boolean;
		nocWaiver: boolean;
	}
): Promise<Quote> {
	const classRow = await loadVehicleClass(db, params.classId);
	if (!classRow) throw new Error(`Unknown vehicle class: ${params.classId}`);

	const [seasonMultiplier, catalog, durationDiscounts, policy] = await Promise.all([
		loadRateMultiplier(db, params.classId),
		loadOptions(db),
		loadDurationDiscounts(db),
		loadActiveCancellationPolicy(db)
	]);

	const catMap = new Map(catalog.map((o) => [o.id, o]));
	const selected: Array<PriceOptionInput & { optionId: string }> = [];
	for (const o of params.options) {
		if (o.qty <= 0) continue;
		const c = catMap.get(o.optionId);
		if (!c) continue;
		selected.push({
			optionId: c.id,
			code: c.code,
			label: c.name_ja,
			unitPrice: c.price_amount,
			type: c.pricing_type,
			qty: Math.min(o.qty, c.max_quantity)
		});
	}

	const breakdown = calcTotal({
		classRate: classToRate(classRow),
		pickupAt: params.pickupAt,
		returnAt: params.returnAt,
		seasonMultiplier,
		options: selected,
		durationDiscounts,
		cdwSelected: params.cdwSelected,
		nocWaiver: params.nocWaiver
	});

	const days = breakdown.rentalDays;
	const optionRows: ResolvedOption[] = selected.map((o) => ({
		...o,
		lineAmount: o.type === 'per_day' ? o.unitPrice * o.qty * days : o.unitPrice * o.qty
	}));

	return {
		breakdown,
		depositAmount: classRow.deposit_amount,
		classRow,
		optionRows,
		cancellationPolicyId: policy?.id ?? null
	};
}
