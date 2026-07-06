// Email provider abstraction. The booking/service layer only ever talks to this
// interface, so swapping MockProvider -> ResendProvider -> (later) SES/CF Email
// requires no changes to reservation logic. Providers are stateless: persistence
// to the `email_log` table is the caller's (service layer) responsibility.

import type { CancellationRule } from '$lib/cancellation/policy';
import type { PriceBreakdown } from '$lib/pricing/calculator';

export type EmailProviderName = 'mock' | 'resend' | 'ses';

export type EmailKind =
	| 'booking_confirmation'
	| 'cancellation'
	| 'reminder'
	| 'staff_new_booking';

export type Locale = 'ja' | 'en' | 'zh';

export interface EmailMessage {
	to: string | string[];
	from: string;
	subject: string;
	html: string;
	text: string; // multipart/alternative — always required
	replyTo?: string;
	tags?: Record<string, string>;
	idempotencyKey: string;
}

export type EmailStatus = 'sent' | 'failed' | 'skipped';

export interface EmailResult {
	status: EmailStatus;
	providerMessageId?: string;
	error?: string;
}

export interface EmailProvider {
	readonly name: EmailProviderName;
	send(message: EmailMessage): Promise<EmailResult>;
}

// ---- template data ----
export interface TemplateData {
	reservationCode: string;
	customerName: string;
	vehicleName: string;
	vehicleSubtitle?: string | null;
	pickupAtJst: string; // pre-formatted JST
	returnAtJst: string;
	pickupOffice: string;
	returnOffice: string;
	total: number;
	deposit: number;
	breakdown?: PriceBreakdown | null;
	cancellationRules?: CancellationRule[];
	cancellationFee?: number; // cancellation only
	refundAmount?: number; // cancellation only
	adminUrl?: string; // staff only
	baseUrl: string;
}

export interface RenderedEmail {
	subject: string;
	html: string;
	text: string;
}
