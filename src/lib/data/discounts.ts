// Discount rules for Aether — sourced from requirements_v1.1.md §11.4
//
// Discount stacking rules:
//   - Educational ON  → only Educational applies; all others suppressed
//   - Educational OFF → Family / Pre-launch / Bundle all stack freely
//
// | Discount    | Condition                            | Rate | Stacks with       |
// |-------------|--------------------------------------|------|-------------------|
// | Family      | always (Aether sold as family only)  | −25% | standard baseline |
// | Pre-launch  | Web license in cart                  | −17% | Family / Bundle   |
// | Bundle      | 2+ distinct license types in cart    | −17% | Family / Pre-launch|
// | Educational | student toggle ON                    | −30% | none (exclusive)  |

import type { Currency } from './pricing';

export type DiscountId = 'family' | 'pre-launch' | 'bundle' | 'educational';

export interface CartItem {
	licenseType: import('./pricing').LicenseType;
	tierId: string;
	basePrice: number; // price in selected currency, 0 if Contact tier
}

export interface CartState {
	currency: Currency;
	items: CartItem[];
	isStudent: boolean;
}

export interface AppliedDiscount {
	id: DiscountId;
	label: string;
	rate: number; // e.g. 0.17 for 17%
	amount: number; // computed savings in selected currency (negative is savings)
}

// Pre-launch discount rate — Web license only (§11.4-B)
export const PRE_LAUNCH_RATE = 0.17;
// Bundle discount rate — 2+ distinct license types (§11.4-C)
export const BUNDLE_RATE = 0.17;
// Educational discount rate — exclusive (§11.4-D)
export const EDUCATIONAL_RATE = 0.30;
// Family discount rate — always applied as anchoring (§11.4-A)
export const FAMILY_RATE = 0.25;

// Compute the gross subtotal (sum of all item base prices, before any discount)
function grossSubtotal(items: CartItem[]): number {
	return items.reduce((sum, item) => sum + item.basePrice, 0);
}

// Check whether there are 2+ distinct license types in the cart
function hasMultipleLicenseTypes(items: CartItem[]): boolean {
	const types = new Set(items.map((i) => i.licenseType));
	return types.size >= 2;
}

// Check whether the Web license is in the cart
function hasWebLicense(items: CartItem[]): boolean {
	return items.some((i) => i.licenseType === 'web');
}

// Family-bundle gross price: subtotal before the 25% family discount is applied
function familyGross(basePrice: number): number {
	return Math.round(basePrice / (1 - FAMILY_RATE));
}

/**
 * Compute the final total — Söhne-style breakdown.
 *
 * Subtotal is the family-bundle GROSS (single-weight × 12 weights × license count),
 * NOT the post-family-bundle price. The 25% family discount is rendered as the first
 * discount line so the customer sees the breakdown explicitly.
 *
 * Stacking:
 *   - Educational ON  → only Educational applies (on gross subtotal)
 *   - Educational OFF → Family + Pre-launch (Web only) + Bundle (2+ types) stack
 *
 * Pre-launch / Bundle rates (17%) apply to the post-family base (= sum of item.basePrice)
 * to match the spec example (§11.4 末 — Bundle example €120 ≈ €720 × 17%).
 */
export function computeTotal(cart: CartState): {
	subtotal: number;
	discounts: AppliedDiscount[];
	total: number;
} {
	const { items, isStudent } = cart;
	if (items.length === 0) return { subtotal: 0, discounts: [], total: 0 };

	// Subtotal is the family-bundle GROSS — sum of (basePrice / 0.75) per item
	const subtotal = items.reduce((s, i) => s + familyGross(i.basePrice), 0);
	const discounts: AppliedDiscount[] = [];

	// Educational: exclusive — applies to gross subtotal
	if (isStudent) {
		const amount = Math.round(subtotal * EDUCATIONAL_RATE);
		discounts.push({
			id: 'educational',
			label: 'Educational (−30%)',
			rate: EDUCATIONAL_RATE,
			amount
		});
		return { subtotal, discounts, total: Math.max(0, subtotal - amount) };
	}

	// Family bundle: always, on gross subtotal
	const familyAmount = subtotal - grossSubtotal(items); // = subtotal × 0.25, exact relative to basePrice
	discounts.push({
		id: 'family',
		label: 'Family bundle (−25%)',
		rate: FAMILY_RATE,
		amount: familyAmount
	});

	// Pre-launch: −17% on Web items' post-family base (basePrice)
	if (hasWebLicense(items)) {
		const webBase = items
			.filter((i) => i.licenseType === 'web')
			.reduce((s, i) => s + i.basePrice, 0);
		const amount = Math.round(webBase * PRE_LAUNCH_RATE);
		discounts.push({
			id: 'pre-launch',
			label: 'Pre-launch Web (−17%)',
			rate: PRE_LAUNCH_RATE,
			amount
		});
	}

	// Bundle: −17% on entire post-family subtotal when 2+ distinct license types
	if (hasMultipleLicenseTypes(items)) {
		const baseSum = grossSubtotal(items);
		const amount = Math.round(baseSum * BUNDLE_RATE);
		discounts.push({
			id: 'bundle',
			label: 'Bundle (−17%)',
			rate: BUNDLE_RATE,
			amount
		});
	}

	const totalDiscount = discounts.reduce((s, d) => s + d.amount, 0);
	const total = Math.max(0, subtotal - totalDiscount);
	return { subtotal, discounts, total };
}
