// Static sitemap: public pages × 3 locales (ja has no prefix).
import { LOCALES, l } from '$lib/i18n';
import type { RequestHandler } from './$types';

const SITE_ORIGIN = 'https://miles158.pages.dev';

const PUBLIC_PATHS = [
	'/',
	'/about',
	'/rental',
	'/community',
	'/reserve',
	'/terms',
	'/legal/privacy',
	'/legal/insurance',
	'/legal/tokushohou'
];

export const prerender = true;

export const GET: RequestHandler = () => {
	const urls = PUBLIC_PATHS.flatMap((path) =>
		LOCALES.map((loc) => `${SITE_ORIGIN}${l(loc, path)}`)
	);
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
		'\n</urlset>\n';
	return new Response(body, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' }
	});
};
