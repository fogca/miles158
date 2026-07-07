// Mileage overage billing (client-approved guideline, 2026-07-07): every
// rental includes a free daily mileage allowance; distance beyond that is
// billed per km at return-time reconciliation.

export const MILEAGE_INCLUDED_KM_PER_DAY = 300;
export const MILEAGE_OVERAGE_RATE_JPY_PER_KM = 55;

export interface MileageOverage {
	allowanceKm: number;
	drivenKm: number;
	overageKm: number;
	overageAmount: number;
}

/**
 * Computes the free-mileage allowance and any overage charge for a rental.
 * Returns null when either odometer reading is missing (overage cannot yet
 * be determined).
 */
export function calcMileageOverage(
	rentalDays: number,
	startKm: number | null | undefined,
	endKm: number | null | undefined
): MileageOverage | null {
	if (startKm == null || endKm == null) return null;
	const allowanceKm = rentalDays * MILEAGE_INCLUDED_KM_PER_DAY;
	const drivenKm = Math.max(0, endKm - startKm);
	const overageKm = Math.max(0, drivenKm - allowanceKm);
	const overageAmount = overageKm * MILEAGE_OVERAGE_RATE_JPY_PER_KM;
	return { allowanceKm, drivenKm, overageKm, overageAmount };
}
