import { redirect } from '@sveltejs/kit';
import { isLocale } from '$lib/i18n';
import type { RequestHandler } from './$types';

// Dashboard language switcher: /dashboard/lang?to=zh — sets the cookie and
// returns to the referring dashboard page.
export const GET: RequestHandler = async ({ url, cookies, request }) => {
	const to = url.searchParams.get('to');
	if (isLocale(to)) {
		cookies.set('m158_lang', to, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
	}
	const ref = request.headers.get('referer');
	const back = ref && new URL(ref).pathname.startsWith('/dashboard') ? new URL(ref).pathname : '/dashboard';
	throw redirect(303, back);
};
