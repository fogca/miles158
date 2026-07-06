// Append-only audit log helper. Every server-side mutation should leave a trail.
import { genId, type DB } from './db';
import { nowIso } from '$lib/time';

export interface AuditEntry {
	actor: string; // 'staff:<id>' | 'customer' | 'cron' | 'webhook'
	action: string; // 'reservation.transition' | 'vehicle.update' | ...
	entity: string;
	entityId?: string | null;
	before?: unknown;
	after?: unknown;
	ip?: string | null;
}

/** Build a prepared INSERT statement (for inclusion in a batch). */
export function auditStmt(db: DB, e: AuditEntry) {
	return db
		.prepare(
			`INSERT INTO audit_log (id, actor, action, entity, entity_id, before, after, ip, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			genId(),
			e.actor,
			e.action,
			e.entity,
			e.entityId ?? null,
			e.before === undefined ? null : JSON.stringify(e.before),
			e.after === undefined ? null : JSON.stringify(e.after),
			e.ip ?? null,
			nowIso()
		);
}

export async function audit(db: DB, e: AuditEntry): Promise<void> {
	await auditStmt(db, e).run();
}
