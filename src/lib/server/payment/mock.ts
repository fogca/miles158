// MockProvider — drives the exact same state path as real Stripe (HELD ->
// PENDING_PAYMENT -> CONFIRMED) without any external account. Behaviour is
// tunable via env for testing:
//   MOCK_FAIL=1     -> authorize/charge return 'failed'
//   MOCK_REQUIRES_ACTION=1 -> authorize returns 'requires_action'

import type {
	AuthorizeParams,
	AuthResult,
	CaptureResult,
	CheckoutSession,
	NormalizedWebhook,
	PaymentProvider,
	RefundResult
} from './types';

export interface MockEnv {
	MOCK_FAIL?: string;
	MOCK_REQUIRES_ACTION?: string;
}

const ref = (prefix: string) => `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;

/** Card authorizations on a JPY Stripe account hold up to 30 days. */
function plus30dIso(): string {
	return new Date(Date.now() + 30 * 86_400_000).toISOString();
}

export class MockProvider implements PaymentProvider {
	readonly name = 'mock' as const;
	constructor(private env: MockEnv = {}) {}

	async authorizeDeposit(p: AuthorizeParams): Promise<AuthResult> {
		if (this.env.MOCK_FAIL === '1') {
			return { providerRef: ref('mock'), status: 'failed' };
		}
		if (this.env.MOCK_REQUIRES_ACTION === '1') {
			const r = ref('mock_pi');
			return { providerRef: r, status: 'requires_action', clientSecret: `${r}_secret` };
		}
		const r = ref('mock_pi');
		// Wallets cannot hold a deposit; they charge immediately.
		const isWallet = p.method === 'wechat' || p.method === 'alipay';
		return {
			providerRef: r,
			status: isWallet ? 'succeeded' : 'requires_capture',
			clientSecret: `${r}_secret`,
			captureBefore: isWallet ? undefined : plus30dIso(),
			qrCodeUrl: isWallet ? `https://mock.miles158/qr/${r}` : undefined
		};
	}

	async captureDeposit(_ref: string, amount?: Money): Promise<CaptureResult> {
		return { status: 'captured', capturedAmount: amount ?? 0 };
	}

	async releaseDeposit(_ref: string): Promise<CaptureResult> {
		return { status: 'captured', capturedAmount: 0 };
	}

	async charge(p: AuthorizeParams): Promise<AuthResult> {
		if (this.env.MOCK_FAIL === '1') return { providerRef: ref('mock'), status: 'failed' };
		return { providerRef: ref('mock_ch'), status: 'succeeded' };
	}

	async refund(_ref: string, _amount?: Money, _reason?: string): Promise<RefundResult> {
		return { status: 'succeeded', refundId: ref('mock_re') };
	}

	async createCheckoutSession(p: AuthorizeParams): Promise<CheckoutSession> {
		const r = ref('mock_cs');
		return { url: `/reserve/mock-checkout?ref=${r}&res=${p.reservationId}`, providerRef: r };
	}

	async verifyAndParseWebhook(body: string, _signature: string): Promise<NormalizedWebhook> {
		const data = JSON.parse(body) as Partial<NormalizedWebhook>;
		return {
			eventId: data.eventId ?? ref('mock_evt'),
			type: data.type ?? 'payment.succeeded',
			providerRef: data.providerRef ?? '',
			reservationId: data.reservationId,
			raw: data
		};
	}
}

type Money = number;
