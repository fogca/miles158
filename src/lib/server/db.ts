// D1 access wrapper. D1 has no interactive transactions or row locks; batch() is
// the atomic unit (single-threaded sequential execution). All multi-row writes
// that must be consistent (e.g. hold creation) go through batchAtomic().

export type DB = D1Database;

/** Resolve the D1 binding from the SvelteKit platform, or throw a clear error. */
export function getDb(platform: App.Platform | undefined): DB {
	const db = platform?.env?.DB as DB | undefined;
	if (!db) {
		throw new Error(
			'D1 binding "DB" is not available. Run `npm run db:migrate` and start via `npm run dev` so the Cloudflare platform is emulated.'
		);
	}
	return db;
}

/** App-side id generation (D1/SQLite has no native uuid). */
export function genId(): string {
	return crypto.randomUUID();
}

/** Human-readable reservation code, e.g. M158-7F3K-2Q9. */
export function genReservationCode(): string {
	const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no ambiguous chars
	const pick = (n: number) =>
		Array.from(crypto.getRandomValues(new Uint8Array(n)))
			.map((b) => alphabet[b % alphabet.length])
			.join('');
	return `M158-${pick(4)}-${pick(3)}`;
}

/** True when a D1 error is a UNIQUE-constraint violation (= slot already taken). */
export function isUniqueConstraintError(err: unknown): boolean {
	const msg = String((err as Error)?.message ?? err ?? '');
	return /UNIQUE constraint failed|SQLITE_CONSTRAINT/i.test(msg);
}

/** Raised when a hold/slot write collides with an existing booking. */
export class SlotConflictError extends Error {
	constructor(message = 'The selected dates are no longer available.') {
		super(message);
		this.name = 'SlotConflictError';
	}
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Run statements as one atomic D1 batch.
 * - UNIQUE violations are surfaced immediately as SlotConflictError (no retry).
 * - Other transient errors retry with exponential backoff (100/200/400ms).
 */
export async function batchAtomic(
	db: DB,
	statements: D1PreparedStatement[],
	retries = 3
): Promise<void> {
	let attempt = 0;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		try {
			await db.batch(statements);
			return;
		} catch (err) {
			if (isUniqueConstraintError(err)) throw new SlotConflictError();
			attempt += 1;
			if (attempt >= retries) throw err;
			await sleep(100 * 2 ** (attempt - 1));
		}
	}
}
