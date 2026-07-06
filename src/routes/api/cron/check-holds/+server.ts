import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { expireHolds } from '$lib/server/inventory';
import type { RequestHandler } from './$types';

// Expire stale HELD reservations and release their slots.
// Schedule externally (Pages has no native cron): POST with header
// `x-cron-secret: $CRON_SECRET`. In dev (no secret set) it is open.
async function run(platform: App.Platform | undefined, secret: string | null) {
	const expected = (platform?.env as { CRON_SECRET?: string } | undefined)?.CRON_SECRET;
	if (expected && secret !== expected) throw error(401, 'unauthorized');
	const db = getDb(platform);
	const expired = await expireHolds(db);
	return { ok: true, expired };
}

export const POST: RequestHandler = async ({ platform, request }) => {
	return json(await run(platform, request.headers.get('x-cron-secret')));
};

export const GET: RequestHandler = async ({ platform, request }) => {
	return json(await run(platform, request.headers.get('x-cron-secret')));
};
