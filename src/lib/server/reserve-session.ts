// Server-held scratch session for the multi-step reservation flow. The cookie
// only stores an opaque id; all step data lives in D1 (reserve_sessions).

import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { genId, type DB } from './db';
import { nowIso } from '$lib/time';

const COOKIE = 'm158_reserve';
const TTL_MINUTES = 60;

export interface ReserveData {
	licenseKind?: string;
	classId?: string;
	vehicleId?: string;
	pickupDate?: string;
	pickupTime?: string;
	returnDate?: string;
	returnTime?: string;
	pickupAt?: string;
	returnAt?: string;
	options?: { optionId: string; qty: number }[];
	cdwSelected?: boolean;
	nocWaiver?: boolean;
	reservationId?: string;
	code?: string;
}

export interface ReserveSession {
	id: string;
	data: ReserveData;
}

export async function loadSession(db: DB, cookies: Cookies): Promise<ReserveSession | null> {
	const id = cookies.get(COOKIE);
	if (!id) return null;
	const row = await db
		.prepare('SELECT id, data FROM reserve_sessions WHERE id = ? AND expires_at > ?')
		.bind(id, nowIso())
		.first<{ id: string; data: string }>();
	if (!row) return null;
	return { id: row.id, data: JSON.parse(row.data) as ReserveData };
}

export async function getOrCreateSession(db: DB, cookies: Cookies): Promise<ReserveSession> {
	const existing = await loadSession(db, cookies);
	if (existing) return existing;

	const id = genId();
	const now = nowIso();
	const expires = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();
	await db
		.prepare(
			'INSERT INTO reserve_sessions (id, data, expires_at, created_at) VALUES (?, ?, ?, ?)'
		)
		.bind(id, '{}', expires, now)
		.run();
	cookies.set(COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: TTL_MINUTES * 60
	});
	return { id, data: {} };
}

export async function saveSession(db: DB, id: string, data: ReserveData): Promise<void> {
	const expires = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();
	await db
		.prepare('UPDATE reserve_sessions SET data = ?, expires_at = ? WHERE id = ?')
		.bind(JSON.stringify(data), expires, id)
		.run();
}

export async function linkReservation(db: DB, id: string, reservationId: string): Promise<void> {
	await db
		.prepare('UPDATE reserve_sessions SET reservation_id = ? WHERE id = ?')
		.bind(reservationId, id)
		.run();
}

export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(COOKIE, { path: '/' });
}
