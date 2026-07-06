import { getDb } from '$lib/server/db';
import { STATES } from '$lib/booking/states';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = getDb(platform);
	const status = url.searchParams.get('status') ?? '';
	const code = url.searchParams.get('code') ?? '';

	let sql = `
		SELECT r.id, r.code, r.status, r.pickup_scheduled_at, r.return_scheduled_at,
		       r.total_amount, r.created_at,
		       v.display_name AS vehicle,
		       (c.name_family || ' ' || c.name_given) AS customer
		FROM reservations r
		LEFT JOIN vehicles v ON v.id = r.vehicle_id
		LEFT JOIN customers c ON c.id = r.customer_id
		WHERE r.status != 'blackout'`;
	const binds: unknown[] = [];
	if (status) {
		sql += ' AND r.status = ?';
		binds.push(status);
	}
	if (code) {
		sql += ' AND r.code LIKE ?';
		binds.push(`%${code}%`);
	}
	sql += ' ORDER BY r.created_at DESC LIMIT 200';

	const rows = (
		await db
			.prepare(sql)
			.bind(...binds)
			.all<{
				id: string;
				code: string;
				status: string;
				pickup_scheduled_at: string | null;
				return_scheduled_at: string | null;
				total_amount: number | null;
				vehicle: string | null;
				customer: string | null;
			}>()
	).results;

	return { rows, filter: { status, code }, statuses: STATES };
};
