// Data-driven cancellation fee engine. Rules come from the cancellation_rules
// table (snapshotted onto the reservation at booking time so a later policy
// revision is never applied retroactively).
//
// Fee is computed on the BASE rental amount only (options/coverage excluded),
// per Japanese rental-industry convention.

export interface CancellationRule {
	hoursBeforeMin: number;
	hoursBeforeMax: number | null; // null = infinity
	feePercent: number;
	feeCapJpy: number | null; // null = no cap (premium fleet)
}

export interface CancellationResult {
	feeJpy: number;
	percent: number;
	rule: CancellationRule | null;
}

/** Find the matching interval [min, max) and compute the fee. */
export function calcCancellationFee(
	basePriceJpy: number,
	hoursBeforePickup: number,
	rules: CancellationRule[]
): CancellationResult {
	const rule = rules.find(
		(r) =>
			hoursBeforePickup >= r.hoursBeforeMin &&
			(r.hoursBeforeMax === null || hoursBeforePickup < r.hoursBeforeMax)
	);
	if (!rule) return { feeJpy: 0, percent: 0, rule: null };

	let fee = Math.round((basePriceJpy * rule.feePercent) / 100);
	if (rule.feeCapJpy !== null) fee = Math.min(fee, rule.feeCapJpy);
	return { feeJpy: fee, percent: rule.feePercent, rule };
}

/** No-show is a fixed policy percentage (default 100%). */
export function calcNoShowFee(basePriceJpy: number, noShowPercent = 100): number {
	return Math.round((basePriceJpy * noShowPercent) / 100);
}
