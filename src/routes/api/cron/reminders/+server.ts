import { json, error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { nowIso, jstDateStr, addDaysStr, jstDateToUtc } from '$lib/time';
import { sendEmail, buildBookingEmailData, type EmailEnv } from '$lib/server/email';
import type { RequestHandler } from './$types';

// Day-before pickup reminders. Schedule externally (Pages has no native cron):
// e.g. daily at JST 06:00, POST with `x-cron-secret: $CRON_SECRET`. Fail-closed:
// refuses to run without a secret configured. Idempotency key includes the
// pickup date so re-runs never double-send.
export const POST: RequestHandler = async ({ platform, request }) => {
	const env = platform?.env as unknown as EmailEnv & { CRON_SECRET?: string };
	if (!env?.CRON_SECRET) throw error(500, 'CRON_SECRET is not configured');
	if (request.headers.get('x-cron-secret') !== env.CRON_SECRET) throw error(401, 'unauthorized');

	const db = getDb(platform);
	const today = jstDateStr(nowIso());
	const tomorrow = addDaysStr(today, 1);
	const from = jstDateToUtc(tomorrow, '00:00');
	const to = jstDateToUtc(addDaysStr(tomorrow, 1), '00:00');

	const rows = (
		await db
			.prepare(
				`SELECT * FROM reservations
				 WHERE status = 'confirmed' AND pickup_scheduled_at >= ? AND pickup_scheduled_at < ?`
			)
			.bind(from, to)
			.all()
	).results as unknown as Array<{
		id: string;
		code: string;
		pickup_scheduled_at: string;
	}>;

	const baseUrl = env?.PUBLIC_BASE_URL || new URL(request.url).origin;
	let sent = 0;
	for (const res of rows) {
		const pickupDate = jstDateStr(res.pickup_scheduled_at);
		const { data, customerEmail, locale } = await buildBookingEmailData(
			db,
			res as unknown as Parameters<typeof buildBookingEmailData>[1],
			baseUrl
		);
		if (!customerEmail) continue;
		const r = await sendEmail(db, env, {
			kind: 'reminder',
			idempotencyKey: `reminder/${res.code}/${pickupDate}`,
			to: customerEmail,
			locale,
			reservationId: res.id,
			data
		});
		if (r.status === 'sent') sent++;
	}

	return json({ ok: true, candidates: rows.length, sent });
};
