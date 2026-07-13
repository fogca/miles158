import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { flagNoShows } from '$lib/server/inventory';
import type { RequestHandler } from './$types';

// Flag CONFIRMED reservations past pickup + grace as no-show (fee per policy).
// POST with header `x-cron-secret: $CRON_SECRET`. Fail-closed: refuses to run
// without a secret configured.
export const POST: RequestHandler = async ({ platform, request }) => {
	const expected = (platform?.env as { CRON_SECRET?: string } | undefined)?.CRON_SECRET;
	if (!expected) throw error(500, 'CRON_SECRET is not configured');
	if (request.headers.get('x-cron-secret') !== expected) throw error(401, 'unauthorized');
	const db = getDb(platform);
	const flagged = await flagNoShows(db);
	return json({ ok: true, flagged });
};
