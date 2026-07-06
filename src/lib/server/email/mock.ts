// MockEmailProvider — no external calls. Logs the email and returns 'sent', so
// the whole flow (and the email_log idempotency) works before a real provider
// (Resend/SES) is configured. Persistence is the service layer's job (index.ts).

import type { EmailMessage, EmailProvider, EmailResult } from './types';

export interface MockEmailEnv {
	MOCK_EMAIL_FAIL?: string;
}

const ref = () => `mock_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;

export class MockEmailProvider implements EmailProvider {
	readonly name = 'mock' as const;
	constructor(private env: MockEmailEnv = {}) {}

	async send(message: EmailMessage): Promise<EmailResult> {
		if (this.env.MOCK_EMAIL_FAIL === '1') {
			return { status: 'failed', error: 'mock failure (MOCK_EMAIL_FAIL=1)' };
		}
		console.log('[email:mock]', {
			to: message.to,
			subject: message.subject,
			idempotencyKey: message.idempotencyKey
		});
		return { status: 'sent', providerMessageId: ref() };
	}
}
