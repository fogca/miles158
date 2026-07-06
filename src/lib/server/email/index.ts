// Email service layer: provider factory + idempotent send wrapper. The service
// layer owns persistence (email_log) and the idempotency guard, so Mock/Resend/SES
// all share one double-send defence. Trigger sites just `await sendEmail(...)`.

import { genId, isUniqueConstraintError, type DB } from '../db';
import { nowIso, formatJst } from '$lib/time';
import { loadCancellationRules } from '../pricing-data';
import { MockEmailProvider } from './mock';
import { renderEmail } from './templates';
import type { EmailKind, EmailProvider, EmailResult, Locale, TemplateData } from './types';

export interface EmailEnv {
	EMAIL_PROVIDER?: string;
	EMAIL_FROM?: string;
	EMAIL_REPLY_TO?: string;
	STAFF_NOTIFY_TO?: string;
	PUBLIC_BASE_URL?: string;
	MOCK_EMAIL_FAIL?: string;
}

export function getEmailProvider(env: EmailEnv): EmailProvider {
	switch (env.EMAIL_PROVIDER) {
		// case 'resend': return new ResendProvider(env); // P1
		// case 'ses':    return new SesProvider(env);    // P1
		default:
			return new MockEmailProvider(env);
	}
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface SendParams {
	kind: EmailKind;
	idempotencyKey: string;
	to: string | string[];
	locale?: Locale;
	reservationId?: string | null;
	data: TemplateData;
}

/**
 * Idempotent send: claim the key in email_log (status='pending'), send via the
 * provider (with retries), then record the result. A duplicate key returns
 * 'skipped' without sending.
 */
export async function sendEmail(db: DB, env: EmailEnv, p: SendParams): Promise<EmailResult> {
	const toAddr = Array.isArray(p.to) ? p.to.join(',') : p.to;
	if (!toAddr) return { status: 'skipped' };

	const provider = getEmailProvider(env);
	const locale = p.locale ?? 'ja';
	const rendered = renderEmail(p.kind, locale, p.data);
	const id = genId();
	const now = nowIso();

	// Phase 1 — claim the idempotency key.
	try {
		await db
			.prepare(
				`INSERT INTO email_log
				 (id, idempotency_key, reservation_id, kind, to_addr, subject, locale, provider, status, body, created_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
			)
			.bind(
				id,
				p.idempotencyKey,
				p.reservationId ?? null,
				p.kind,
				toAddr,
				rendered.subject,
				locale,
				provider.name,
				rendered.text,
				now
			)
			.run();
	} catch (e) {
		if (isUniqueConstraintError(e)) return { status: 'skipped' };
		throw e;
	}

	// Phase 2 — send (up to 3 attempts), then record outcome.
	const message = {
		to: p.to,
		from: env.EMAIL_FROM ?? `${'MILES 158'} <noreply@miles158.com>`,
		subject: rendered.subject,
		html: rendered.html,
		text: rendered.text,
		replyTo: env.EMAIL_REPLY_TO,
		tags: { kind: p.kind, code: p.data.reservationCode },
		idempotencyKey: p.idempotencyKey
	};
	let result: EmailResult = { status: 'failed', error: 'not sent' };
	for (let attempt = 0; attempt < 3; attempt++) {
		result = await provider.send(message);
		if (result.status !== 'failed') break;
		if (attempt < 2) await sleep(1000);
	}

	await db
		.prepare('UPDATE email_log SET status = ?, provider_message_id = ?, error = ? WHERE id = ?')
		.bind(result.status, result.providerMessageId ?? null, result.error ?? null, id)
		.run();
	return result;
}

interface ReservationRowLike {
	id: string;
	code: string;
	vehicle_id: string | null;
	customer_id: string | null;
	cancellation_policy_id: string | null;
	pickup_scheduled_at: string | null;
	return_scheduled_at: string | null;
	pickup_office: string | null;
	return_office: string | null;
	total_amount: number | null;
	deposit_amount: number | null;
	price_snapshot: string | null;
}

/** Build the TemplateData for a reservation + return the customer email. */
export async function buildBookingEmailData(
	db: DB,
	res: ReservationRowLike,
	baseUrl: string
): Promise<{ data: TemplateData; customerEmail: string | null }> {
	const [customer, vehicle, rules] = await Promise.all([
		res.customer_id
			? db
					.prepare('SELECT email, name_family, name_given FROM customers WHERE id = ?')
					.bind(res.customer_id)
					.first<{ email: string | null; name_family: string; name_given: string }>()
			: Promise.resolve(null),
		res.vehicle_id
			? db
					.prepare('SELECT display_name, subtitle FROM vehicles WHERE id = ?')
					.bind(res.vehicle_id)
					.first<{ display_name: string; subtitle: string | null }>()
			: Promise.resolve(null),
		res.cancellation_policy_id
			? loadCancellationRules(db, res.cancellation_policy_id)
			: Promise.resolve([])
	]);

	const data: TemplateData = {
		reservationCode: res.code,
		customerName: customer ? `${customer.name_family} ${customer.name_given}` : 'お客様',
		vehicleName: vehicle?.display_name ?? '車両',
		vehicleSubtitle: vehicle?.subtitle ?? null,
		pickupAtJst: res.pickup_scheduled_at ? formatJst(res.pickup_scheduled_at, 'ja') : '',
		returnAtJst: res.return_scheduled_at ? formatJst(res.return_scheduled_at, 'ja') : '',
		pickupOffice: res.pickup_office ?? 'nagoya',
		returnOffice: res.return_office ?? 'nagoya',
		total: res.total_amount ?? 0,
		deposit: res.deposit_amount ?? 0,
		breakdown: res.price_snapshot ? JSON.parse(res.price_snapshot) : null,
		cancellationRules: rules,
		baseUrl
	};
	return { data, customerEmail: customer?.email ?? null };
}

export * from './types';
