// Pricing data for Aether — sourced from requirements_v1.1.md §11.3
// All prices are fixed per currency (no exchange-rate dependency)

export type LicenseType = 'desktop' | 'web' | 'app' | 'books';
export type Currency = 'EUR' | 'JPY' | 'USD';

// null = "Contact us" (no purchasable price)
export type Price = number | null;

export interface Tier {
	id: string;
	label: string;
	prices: Record<Currency, Price>;
}

export interface LicenseDef {
	id: LicenseType;
	label: string;
	axisLabel: string;
	blurb: string;
	tiers: Tier[];
}

// Currency symbol map for display
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
	EUR: '€',
	JPY: '¥',
	USD: '$'
};

// Numeric prefix for formatting (JPY has no decimals; EUR/USD need none here)
export const CURRENCY_LOCALE: Record<Currency, string> = {
	EUR: 'de-DE',
	JPY: 'ja-JP',
	USD: 'en-US'
};

// Format a price for display
export function formatPrice(price: Price, currency: Currency): string {
	if (price === null) return 'Contact';
	const sym = CURRENCY_SYMBOLS[currency];
	if (currency === 'JPY') {
		return `${sym}${price.toLocaleString('ja-JP')}`;
	}
	return `${sym}${price.toLocaleString('en-US')}`;
}

// Single-weight price for anchoring display (Family discount calculation)
export const SINGLE_WEIGHT_EUR = 40;
export const FAMILY_WEIGHT_COUNT = 12;
export const FAMILY_DISCOUNT_RATE = 0.25; // −25%

export const LICENSES: LicenseDef[] = [
	{
		id: 'desktop',
		label: 'Desktop',
		axisLabel: 'users',
		blurb: 'For use in print, PDF, and locally installed applications.',
		tiers: [
			{ id: 'desktop-5',    label: '5 users',     prices: { EUR: 360,  JPY: 56000,  USD: 390  } },
			{ id: 'desktop-10',   label: '10 users',    prices: { EUR: 540,  JPY: 84000,  USD: 590  } },
			{ id: 'desktop-25',   label: '25 users',    prices: { EUR: 810,  JPY: 126000, USD: 880  } },
			{ id: 'desktop-50',   label: '50 users',    prices: { EUR: 1200, JPY: 186000, USD: 1300 } },
			{ id: 'desktop-100',  label: '100 users',   prices: { EUR: 1800, JPY: 280000, USD: 1950 } },
			{ id: 'desktop-250',  label: '250 users',   prices: { EUR: 2700, JPY: 420000, USD: 2920 } },
			{ id: 'desktop-500',  label: '500 users',   prices: { EUR: 4000, JPY: 620000, USD: 4320 } },
			{ id: 'desktop-1000', label: '1,000 users', prices: { EUR: 6000, JPY: 930000, USD: 6490 } },
			{ id: 'desktop-1000+', label: '1,000+ users', prices: { EUR: null, JPY: null, USD: null } }
		]
	},
	{
		id: 'web',
		label: 'Web',
		axisLabel: 'monthly pageviews',
		blurb: 'Perpetual license for web use. Covers the stated monthly pageview volume.',
		tiers: [
			{ id: 'web-250k',  label: 'up to 250K PV / mo',  prices: { EUR: 360,  JPY: 56000,  USD: 390  } },
			{ id: 'web-1m',    label: 'up to 1M PV / mo',    prices: { EUR: 540,  JPY: 84000,  USD: 590  } },
			{ id: 'web-5m',    label: 'up to 5M PV / mo',    prices: { EUR: 810,  JPY: 126000, USD: 880  } },
			{ id: 'web-25m',   label: 'up to 25M PV / mo',   prices: { EUR: 1200, JPY: 186000, USD: 1300 } },
			{ id: 'web-100m',  label: 'up to 100M PV / mo',  prices: { EUR: 1800, JPY: 280000, USD: 1950 } },
			{ id: 'web-100m+', label: '100M+ PV / mo',       prices: { EUR: null, JPY: null,   USD: null } }
		]
	},
	{
		id: 'app',
		label: 'App',
		axisLabel: 'downloads',
		blurb: 'For mobile and desktop applications (iOS, Android, etc.).',
		tiers: [
			{ id: 'app-100k',  label: 'up to 100K downloads',  prices: { EUR: 720,  JPY: 112000, USD: 780  } },
			{ id: 'app-1m',    label: 'up to 1M downloads',    prices: { EUR: 1080, JPY: 168000, USD: 1170 } },
			{ id: 'app-10m',   label: 'up to 10M downloads',   prices: { EUR: 1620, JPY: 252000, USD: 1750 } },
			{ id: 'app-100m',  label: 'up to 100M downloads',  prices: { EUR: 2400, JPY: 372000, USD: 2600 } },
			{ id: 'app-100m+', label: '100M+ downloads',       prices: { EUR: null, JPY: null,   USD: null } }
		]
	},
	{
		id: 'books',
		label: 'Books',
		axisLabel: 'copies',
		blurb: 'For books, magazines, and printed editorial publications.',
		tiers: [
			{ id: 'books-5k',   label: 'up to 5,000 copies',   prices: { EUR: 360, JPY: 56000,  USD: 390 } },
			{ id: 'books-50k',  label: 'up to 50,000 copies',  prices: { EUR: 540, JPY: 84000,  USD: 590 } },
			{ id: 'books-500k', label: 'up to 500,000 copies', prices: { EUR: 810, JPY: 126000, USD: 880 } },
			{ id: 'books-500k+', label: '500K+ copies',        prices: { EUR: null, JPY: null,  USD: null } }
		]
	}
];

// Convenience lookup by id
export function getLicense(id: LicenseType): LicenseDef {
	const found = LICENSES.find((l) => l.id === id);
	if (!found) throw new Error(`Unknown license: ${id}`);
	return found;
}

export function getTier(licenseId: LicenseType, tierId: string): Tier {
	const license = getLicense(licenseId);
	const found = license.tiers.find((t) => t.id === tierId);
	if (!found) throw new Error(`Unknown tier: ${tierId}`);
	return found;
}
