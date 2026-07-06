import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { destroySession, STAFF_COOKIE } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ platform, cookies }) => {
	const token = cookies.get(STAFF_COOKIE);
	if (token) {
		await destroySession(getDb(platform), token);
		cookies.delete(STAFF_COOKIE, { path: '/' });
	}
	throw redirect(303, '/dashboard/login');
};
