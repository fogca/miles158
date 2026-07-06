// Localized labels for reservation states (dashboard display).
import { t, type Locale } from '$lib/i18n';
import type { DictKey } from '$lib/i18n/dict';

export function statusLabel(s: string, locale: Locale = 'ja'): string {
	return t(locale, ('st.' + s) as DictKey);
}
