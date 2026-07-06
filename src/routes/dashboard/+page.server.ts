import { fail } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { nowIso, jstDateStr } from '$lib/time';
import { addBlackout, removeBlackout, BLACKOUT_RES_ID } from '$lib/server/inventory';
import { audit } from '$lib/server/audit';
import type { Actions, PageServerLoad } from './$types';

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export const load: PageServerLoad = async ({ url, platform }) => {
	const db = getDb(platform);
	const today = jstDateStr(nowIso());

	const vehicles = (
		await db
			.prepare(
				`SELECT v.id, v.display_name, vc.name_ja AS class_name
				 FROM vehicles v JOIN vehicle_classes vc ON vc.id = v.class_id
				 WHERE v.deleted_at IS NULL ORDER BY vc.sort_order, v.display_name`
			)
			.all<{ id: string; display_name: string; class_name: string }>()
	).results;

	const vehicleId = url.searchParams.get('vehicle') || vehicles[0]?.id || '';
	const offset = Math.max(-1, Math.min(12, Number(url.searchParams.get('m') ?? 0) || 0));

	// Displayed month = current JST month + offset.
	const startY = Number(today.slice(0, 4));
	const startM = Number(today.slice(5, 7)) - 1;
	const totalM = startM + offset;
	const year = startY + Math.floor(totalM / 12);
	const month = ((totalM % 12) + 12) % 12; // 0-indexed
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const monthStart = `${year}-${pad(month + 1)}-01`;
	const monthEnd = `${year}-${pad(month + 1)}-${pad(daysInMonth)}`;

	let dayMap: Record<string, { type: string; resId: string; code: string; status: string }> = {};
	if (vehicleId) {
		const slots = (
			await db
				.prepare(
					`SELECT rd.date, rd.type, r.id AS res_id, r.code, r.status
					 FROM reservation_days rd JOIN reservations r ON r.id = rd.reservation_id
					 WHERE rd.vehicle_id = ? AND rd.date BETWEEN ? AND ?`
				)
				.bind(vehicleId, monthStart, monthEnd)
				.all<{ date: string; type: string; res_id: string; code: string; status: string }>()
		).results;
		dayMap = Object.fromEntries(
			slots.map((s) => [s.date, { type: s.type, resId: s.res_id, code: s.code, status: s.status }])
		);
	}

	const statusRows = (
		await db
			.prepare('SELECT status, COUNT(*) AS n FROM reservations GROUP BY status')
			.all<{ status: string; n: number }>()
	).results;
	const summary: Record<string, number> = {};
	for (const r of statusRows) summary[r.status] = r.n;

	return {
		vehicles,
		vehicleId,
		offset,
		year,
		month, // 0-indexed
		monthLabel: `${year}年 ${month + 1}月`,
		monthStart,
		monthEnd,
		dayMap,
		today,
		summary
	};
};

export const actions: Actions = {
	// Reconcile the desired blackout dates for one vehicle within the displayed
	// month (a single "save" of staged calendar edits).
	saveBlackouts: async ({ request, platform, locals }) => {
		const db = getDb(platform);
		const f = await request.formData();
		const vehicleId = String(f.get('vehicleId') ?? '');
		const monthStart = String(f.get('monthStart') ?? '');
		const monthEnd = String(f.get('monthEnd') ?? '');
		if (!vehicleId || !monthStart || !monthEnd) return fail(400, { message: '保存に必要な情報が不足しています。' });

		const desired = new Set(
			String(f.get('dates') ?? '')
				.split(',')
				.map((d) => d.trim())
				.filter(Boolean)
		);

		const current = new Set(
			(
				await db
					.prepare(
						`SELECT date FROM reservation_days WHERE reservation_id = ? AND vehicle_id = ? AND date BETWEEN ? AND ?`
					)
					.bind(BLACKOUT_RES_ID, vehicleId, monthStart, monthEnd)
					.all<{ date: string }>()
			).results.map((r) => r.date)
		);

		const toAdd = [...desired].filter((d) => !current.has(d));
		const toRemove = [...current].filter((d) => !desired.has(d));

		const conflicts: string[] = [];
		for (const d of toAdd) {
			try {
				await addBlackout(db, vehicleId, d);
			} catch {
				conflicts.push(d); // day was booked in the meantime
			}
		}
		for (const d of toRemove) await removeBlackout(db, vehicleId, d);

		await audit(db, {
			actor: `staff:${locals.staff?.id}`,
			action: 'vehicle.blackout.save',
			entity: 'vehicle',
			entityId: vehicleId,
			after: { added: toAdd.filter((d) => !conflicts.includes(d)), removed: toRemove, conflicts }
		});

		return { ok: true, added: toAdd.length - conflicts.length, removed: toRemove.length, conflicts };
	}
};
