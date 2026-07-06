// Staff auth using Web Crypto (works on Cloudflare Workers — no native deps).
// Passwords: PBKDF2-SHA256. Sessions: random token in cookie, SHA-256 of the
// token stored as the row id so a DB leak does not expose live sessions.

import { genId, type DB } from './db';
import { nowIso } from '$lib/time';

const PBKDF2_ITERATIONS = 100_000;
// Long-lived sessions: the dashboard is used as an installed PWA on staff
// iPads/iPhones, so re-login should be rare. The session cookie is httpOnly and
// the token is stored hashed; revoke by deleting staff_sessions rows.
const SESSION_DAYS = 90;
export const STAFF_COOKIE = 'm158_staff';

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer | Uint8Array) =>
	[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) =>
	new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
	const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
		'deriveBits'
	]);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
		key,
		256
	);
	return toHex(bits);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16));
	return `${toHex(salt)}:${await pbkdf2(password, salt)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [saltHex, hashHex] = stored.split(':');
	if (!saltHex || !hashHex) return false;
	const computed = await pbkdf2(password, fromHex(saltHex));
	// constant-time-ish compare
	if (computed.length !== hashHex.length) return false;
	let diff = 0;
	for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ hashHex.charCodeAt(i);
	return diff === 0;
}

async function sha256Hex(s: string): Promise<string> {
	return toHex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
}

export interface StaffUser {
	id: string;
	email: string;
	name: string;
	role: 'admin' | 'manager' | 'staff';
}

export async function countStaff(db: DB): Promise<number> {
	const row = await db
		.prepare('SELECT COUNT(*) AS n FROM staff_users WHERE active = 1 AND deleted_at IS NULL')
		.first<{ n: number }>();
	return row?.n ?? 0;
}

export async function createStaff(
	db: DB,
	input: { email: string; password: string; name: string; role?: StaffUser['role'] }
): Promise<string> {
	const id = genId();
	const now = nowIso();
	const hash = await hashPassword(input.password);
	await db
		.prepare(
			`INSERT INTO staff_users (id, email, password_hash, name, role, active, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, 1, ?, ?)`
		)
		.bind(id, input.email.toLowerCase(), hash, input.name, input.role ?? 'staff', now, now)
		.run();
	return id;
}

export async function authenticate(
	db: DB,
	email: string,
	password: string
): Promise<StaffUser | null> {
	const row = await db
		.prepare(
			'SELECT id, email, name, role, password_hash FROM staff_users WHERE email = ? AND active = 1 AND deleted_at IS NULL'
		)
		.bind(email.toLowerCase())
		.first<StaffUser & { password_hash: string }>();
	if (!row) return null;
	if (!(await verifyPassword(password, row.password_hash))) return null;
	return { id: row.id, email: row.email, name: row.name, role: row.role };
}

/** Create a session; returns the raw token to set in the cookie. */
export async function createSession(db: DB, staffId: string, meta: { ip?: string; ua?: string }) {
	const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
	const id = await sha256Hex(token);
	const now = nowIso();
	const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
	await db
		.prepare(
			'INSERT INTO staff_sessions (id, staff_id, expires_at, created_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
		)
		.bind(id, staffId, expires, now, meta.ip ?? null, meta.ua ?? null)
		.run();
	return { token, expires };
}

export async function getSessionStaff(db: DB, token: string): Promise<StaffUser | null> {
	const id = await sha256Hex(token);
	const row = await db
		.prepare(
			`SELECT u.id, u.email, u.name, u.role FROM staff_sessions s
			 JOIN staff_users u ON u.id = s.staff_id
			 WHERE s.id = ? AND s.expires_at > ? AND u.active = 1 AND u.deleted_at IS NULL`
		)
		.bind(id, nowIso())
		.first<StaffUser>();
	return row ?? null;
}

export async function destroySession(db: DB, token: string): Promise<void> {
	const id = await sha256Hex(token);
	await db.prepare('DELETE FROM staff_sessions WHERE id = ?').bind(id).run();
}
