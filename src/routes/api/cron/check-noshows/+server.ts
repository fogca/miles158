import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { flagNoShows } from '$lib/server/inventory';
import type { RequestHandler } from './$types';

// Flag CONFIRMED reservations past pickup + grace as no-show (charges base fee).
async function run(platform: App.Platform | undefined, secret: string | null) {
	const expected = (platform?.env as { CRON_SECRET?: string } | undefined)?.CRON_SECRET;
	if (expected && secret !== expected) throw error(401, 'unauthorized');
	const db = getDb(platform);
	const flagged = await flagNoShows(db);
	return { ok: true, flagged };
}

export const POST: RequestHandler = async ({ platform, request }) => {
	return json(await run(platform, request.headers.get('x-cron-secret')));
};

export const GET: RequestHandler = async ({ platform, request }) => {
	return json(await run(platform, request.headers.get('x-cron-secret')));
};
