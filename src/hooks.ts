import type { Reroute } from '@sveltejs/kit';

// /en/* and /zh/* serve the same routes as /* — the locale prefix is stripped
// for route matching and read back in hooks.server.ts to set locals.locale.
export const reroute: Reroute = ({ url }) => {
	const m = url.pathname.match(/^\/(en|zh)(\/.*)?$/);
	if (m) return m[2] || '/';
};
