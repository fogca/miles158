// Time helpers. Miles158 operates in a single timezone (JST, UTC+9, no DST).
// Rule: slot dates are 'YYYY-MM-DD' in JST; instants are stored as ISO 8601 UTC.

export const JST_OFFSET = '+09:00';
const MS_PER_DAY = 86_400_000;

/** Current instant as ISO 8601 UTC. */
export function nowIso(): string {
	return new Date().toISOString();
}

/** Combine a JST calendar date + wall-clock time into a UTC ISO instant. */
export function jstDateToUtc(dateStr: string, timeStr = '10:00'): string {
	return new Date(`${dateStr}T${timeStr}:00${JST_OFFSET}`).toISOString();
}

/** The JST calendar date ('YYYY-MM-DD') that a UTC instant falls on. */
export function jstDateStr(iso: string): string {
	// Shift by +9h then read the UTC date parts.
	const shifted = new Date(new Date(iso).getTime() + 9 * 3_600_000);
	return shifted.toISOString().slice(0, 10);
}

/** Inclusive list of 'YYYY-MM-DD' from start to end (both ends included). */
export function enumerateDates(startDateStr: string, endDateStr: string): string[] {
	const out: string[] = [];
	const start = new Date(`${startDateStr}T00:00:00${JST_OFFSET}`).getTime();
	const end = new Date(`${endDateStr}T00:00:00${JST_OFFSET}`).getTime();
	for (let t = start; t <= end; t += MS_PER_DAY) {
		out.push(jstDateStr(new Date(t).toISOString()));
	}
	return out;
}

/** Add n days to a 'YYYY-MM-DD' (JST), returning 'YYYY-MM-DD'. */
export function addDaysStr(dateStr: string, n: number): string {
	const t = new Date(`${dateStr}T00:00:00${JST_OFFSET}`).getTime() + n * MS_PER_DAY;
	return jstDateStr(new Date(t).toISOString());
}

/** Whole hours between two ISO instants (b - a). */
export function diffHours(aIso: string, bIso: string): number {
	return (new Date(bIso).getTime() - new Date(aIso).getTime()) / 3_600_000;
}

/** Billed 24h blocks between pickup and return (ceil, minimum 1). */
export function billedDays(pickupIso: string, returnIso: string): number {
	const hours = diffHours(pickupIso, returnIso);
	if (hours <= 0) return 1;
	return Math.max(1, Math.ceil(hours / 24));
}

const LOCALE_TAG: Record<string, string> = {
	ja: 'ja-JP',
	en: 'en-US',
	zh: 'zh-CN',
	'zh-Hans': 'zh-CN',
	'zh-Hant': 'zh-TW'
};

/** Format a UTC instant for display in JST for the given app locale. */
export function formatJst(iso: string, locale = 'ja'): string {
	return new Intl.DateTimeFormat(LOCALE_TAG[locale] ?? 'ja-JP', {
		timeZone: 'Asia/Tokyo',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(iso));
}

/** Format JPY for display (integer yen). */
export function formatJpy(amount: number, locale = 'ja'): string {
	return new Intl.NumberFormat(LOCALE_TAG[locale] ?? 'ja-JP', {
		style: 'currency',
		currency: 'JPY',
		maximumFractionDigits: 0
	}).format(amount);
}
