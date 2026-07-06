import { redirect, type Handle } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getSessionStaff, STAFF_COOKIE } from '$lib/server/auth';
import { htmlLang, isLocale, localeFromPath, type Locale } from '$lib/i18n';

const LANG_COOKIE = 'm158_lang';

// Locale resolution:
//  * public pages — URL prefix (/ = ja, /en, /zh), remembered in a cookie
//  * /dashboard   — cookie only (URLs stay clean for auth redirects / PWA)
export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname; // already prefix-stripped by reroute
	const rawPath = new URL(event.request.url).pathname;

	let locale: Locale = 'ja';
	if (path.startsWith('/dashboard')) {
		const c = event.cookies.get(LANG_COOKIE);
		locale = isLocale(c) ? c : 'ja';
	} else {
		locale = localeFromPath(rawPath);
		const c = event.cookies.get(LANG_COOKIE);
		if (locale !== (isLocale(c) ? c : 'ja')) {
			event.cookies.set(LANG_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
		}
	}
	event.locals.locale = locale;
	event.locals.staff = null;

	if (path.startsWith('/dashboard')) {
		const db = getDb(event.platform);
		const token = event.cookies.get(STAFF_COOKIE);
		const staff = token ? await getSessionStaff(db, token) : null;
		event.locals.staff = staff;

		if (!staff && path !== '/dashboard/login') throw redirect(303, '/dashboard/login');
		if (staff && path === '/dashboard/login') throw redirect(303, '/dashboard');
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<html lang="en"', `<html lang="${htmlLang(locale)}"`)
	});
};
