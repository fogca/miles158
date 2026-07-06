// Lightweight in-house i18n (same pattern as Joule Joule): key-first trilingual
// dictionary + URL-prefix locales for public pages (/ = ja, /en, /zh) and a
// cookie-driven locale for the dashboard.

import { dict, type DictKey } from './dict';

export type Locale = 'ja' | 'en' | 'zh';
export const LOCALES: Locale[] = ['ja', 'en', 'zh'];
export const LOCALE_LABELS: Record<Locale, string> = { ja: 'JA', en: 'EN', zh: 'ZH' };

export function isLocale(v: unknown): v is Locale {
	return v === 'ja' || v === 'en' || v === 'zh';
}

/** Translate a dictionary key; falls back to ja, then to the key itself. */
export function t(locale: Locale, key: DictKey, params?: Record<string, string | number>): string {
	const entry = dict[key] as Record<string, string> | undefined;
	let s = entry?.[locale] ?? entry?.ja ?? String(key);
	if (params) {
		for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
	}
	return s;
}

/** Prefix a path with the locale segment ('/' stays clean for ja). */
export function l(locale: Locale, path: string): string {
	if (locale === 'ja') return path;
	if (path === '/') return `/${locale}`;
	return `/${locale}${path}`;
}

/** Same path in another locale (for the language switcher). */
export function switchLocalePath(current: string, to: Locale): string {
	const stripped = current.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';
	return l(to, stripped);
}

/** Read the locale prefix from a raw pathname. */
export function localeFromPath(pathname: string): Locale {
	const m = pathname.match(/^\/(en|zh)(\/|$)/);
	return (m?.[1] as Locale) ?? 'ja';
}

/** Pick a localized column from a D1 row (name_ja / name_en / name_zh_hans). */
export function pickLoc(
	row: { name_ja: string; name_en?: string | null; name_zh_hans?: string | null },
	locale: Locale
): string {
	if (locale === 'en') return row.name_en || row.name_ja;
	if (locale === 'zh') return row.name_zh_hans || row.name_ja;
	return row.name_ja;
}

/** BCP-47 tag for Intl / <html lang>. */
export function htmlLang(locale: Locale): string {
	return locale === 'zh' ? 'zh-Hans' : locale;
}
