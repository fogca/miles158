import { fail } from '@sveltejs/kit';
import { getDb, genId } from '$lib/server/db';
import { nowIso } from '$lib/time';
import { audit } from '$lib/server/audit';
import { t } from '$lib/i18n';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const vehicles = (
		await db
			.prepare(
				`SELECT v.id, v.display_name, v.subtitle, v.registration_number, v.color, v.status,
				        vc.name_ja AS class_name, vc.id AS class_id
				 FROM vehicles v JOIN vehicle_classes vc ON vc.id = v.class_id
				 WHERE v.deleted_at IS NULL ORDER BY vc.sort_order, v.display_name`
			)
			.all()
	).results;
	const classes = (
		await db.prepare('SELECT id, name_ja FROM vehicle_classes ORDER BY sort_order').all()
	).results;
	return { vehicles, classes };
};

export const actions: Actions = {
	create: async ({ request, platform, locals }) => {
		const db = getDb(platform);
		const f = await request.formData();
		const displayName = String(f.get('display_name') ?? '').trim();
		const classId = String(f.get('class_id') ?? '');
		const reg = String(f.get('registration_number') ?? '').trim();
		if (!displayName || !classId || !reg) {
			return fail(400, { message: t(locals.locale, 'vh.errRequired') });
		}
		const id = genId();
		const now = nowIso();
		try {
			await db
				.prepare(
					`INSERT INTO vehicles (id, class_id, display_name, subtitle, registration_number, color, status, created_at, updated_at)
					 VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`
				)
				.bind(id, classId, displayName, String(f.get('subtitle') ?? '') || null, reg, String(f.get('color') ?? '') || null, now, now)
				.run();
		} catch {
			return fail(409, { message: t(locals.locale, 'vh.errDupReg') });
		}
		await audit(db, { actor: `staff:${locals.staff?.id}`, action: 'vehicle.create', entity: 'vehicle', entityId: id, after: { displayName, reg } });
		return { ok: true };
	},

	setStatus: async ({ request, platform, locals }) => {
		const db = getDb(platform);
		const f = await request.formData();
		const id = String(f.get('id') ?? '');
		const status = String(f.get('status') ?? '');
		if (!['active', 'maintenance', 'retired'].includes(status)) return fail(400, { message: t(locals.locale, 'vh.errBadStatus') });
		await db.prepare('UPDATE vehicles SET status = ?, updated_at = ? WHERE id = ?').bind(status, nowIso(), id).run();
		await audit(db, { actor: `staff:${locals.staff?.id}`, action: 'vehicle.status', entity: 'vehicle', entityId: id, after: { status } });
		return { ok: true };
	}
};
