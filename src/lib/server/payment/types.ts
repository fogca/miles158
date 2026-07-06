// Payment provider abstraction. The booking flow only ever talks to this
// interface, so swapping MockProvider -> StripeProvider (card / WeChat / Alipay)
// later requires no changes to reservation logic.
//
// Providers are stateless: they return normalized results; persistence to the
// `payments` / `refunds` tables is the caller's (service layer) responsibility.

export type Money = number; // JPY integer
export type ProviderName = 'mock' | 'stripe';
export type Method = 'card' | 'wechat' | 'alipay';

export interface AuthorizeParams {
	reservationId: string;
	amount: Money; // rental total (will be captured)
	depositAmount: Money; // refundable hold (card) / immediate charge (wallet)
	currency: 'jpy';
	method: Method;
	metadata: Record<string, string>;
}

export type AuthStatus =
	| 'requires_capture'
	| 'authorized'
	| 'succeeded'
	| 'requires_action'
	| 'failed';

export interface AuthResult {
	providerRef: string; // intent id
	status: AuthStatus;
	clientSecret?: string;
	captureBefore?: string; // ISO 8601 (card JPY up to 30d)
	qrCodeUrl?: string; // wallet (WeChat/Alipay QR)
	redirectUrl?: string;
}

export interface CaptureResult {
	status: 'captured' | 'failed';
	capturedAmount: Money;
}

export interface RefundResult {
	status: 'pending' | 'succeeded' | 'failed';
	refundId: string;
}

export interface CheckoutSession {
	url?: string;
	clientSecret?: string;
	providerRef: string;
}

export type WebhookType =
	| 'payment.succeeded'
	| 'payment.failed'
	| 'payment.requires_action'
	| 'refund.succeeded'
	| 'refund.failed';

export interface NormalizedWebhook {
	eventId: string; // idempotency key
	type: WebhookType;
	providerRef: string;
	reservationId?: string;
	raw: unknown;
}

export interface PaymentProvider {
	readonly name: ProviderName;
	/** card: authorize(rental+deposit) -> requires_capture; wallet: immediate charge. */
	authorizeDeposit(p: AuthorizeParams): Promise<AuthResult>;
	/** card: partial capture of the rental amount (releases the remainder). */
	captureDeposit(ref: string, amount?: Money): Promise<CaptureResult>;
	/** card: void / release the held deposit. */
	releaseDeposit(ref: string): Promise<CaptureResult>;
	/** wallet primary path + additional charges (extension/overstay/NOC). */
	charge(p: AuthorizeParams): Promise<AuthResult>;
	refund(ref: string, amount?: Money, reason?: string): Promise<RefundResult>;
	createCheckoutSession(p: AuthorizeParams): Promise<CheckoutSession>;
	verifyAndParseWebhook(body: string, signature: string): Promise<NormalizedWebhook>;
}
