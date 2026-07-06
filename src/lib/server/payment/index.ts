// Payment provider factory. Selects the provider from env; defaults to Mock so
// the system runs end-to-end before a Stripe account exists. When PAYMENT_PROVIDER
// === 'stripe', wire StripeProvider here (P1) — the booking flow is unaffected.

import { MockProvider } from './mock';
import type { PaymentProvider } from './types';

export interface PaymentEnv {
	PAYMENT_PROVIDER?: string;
	MOCK_FAIL?: string;
	MOCK_REQUIRES_ACTION?: string;
	// STRIPE_SECRET_KEY?: string; STRIPE_WEBHOOK_SECRET?: string; // P1
}

export function getPaymentProvider(env: PaymentEnv = {}): PaymentProvider {
	switch (env.PAYMENT_PROVIDER) {
		case 'stripe':
			// P1: return new StripeProvider(env). Falls back to mock until implemented.
			return new MockProvider(env);
		default:
			return new MockProvider(env);
	}
}

export * from './types';
