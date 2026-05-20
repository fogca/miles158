<script lang="ts">
	// Cart summary — Söhne-style layout per chairman directive 2026-05-07.
	// Shows: Licence formats (each license + tier removable),
	//        Fonts (12 Aether weights × per-weight price summing to gross subtotal),
	//        Subtotal / Family discount / Other discounts / Total.
	import { formatPrice, getLicense, getTier, FAMILY_DISCOUNT_RATE, FAMILY_WEIGHT_COUNT } from '$lib/data/pricing';
	import type { Currency, LicenseType } from '$lib/data/pricing';
	import type { CartItem, AppliedDiscount } from '$lib/data/discounts';
	import { WEIGHTS } from '$lib/components/TypeTester/presets';

	interface Props {
		currency: Currency;
		items: CartItem[];
		subtotal: number;
		discounts: AppliedDiscount[];
		total: number;
		mobileExpanded?: boolean;
		onMobileToggle?: () => void;
		onremove: (licenseType: LicenseType) => void;
	}

	let {
		currency,
		items,
		subtotal,
		discounts,
		total,
		mobileExpanded = false,
		onMobileToggle,
		onremove
	}: Props = $props();

	const hasItems = $derived(items.length > 0);

	// Per-weight price for a single line = gross / 12 = basePrice / 9
	function perWeightPrice(item: CartItem): number {
		const gross = item.basePrice / (1 - FAMILY_DISCOUNT_RATE);
		return gross / FAMILY_WEIGHT_COUNT;
	}

	// Total per-weight price across all cart items (= row price in the Fonts list)
	const perWeightTotal = $derived(
		items.reduce((s, i) => s + perWeightPrice(i), 0)
	);

	// Pretty-format an integer-rounded price for the per-weight rows
	function rowPrice(p: number): string {
		return formatPrice(Math.round(p), currency);
	}

	function licenseLineLabel(item: CartItem): string {
		const license = getLicense(item.licenseType);
		const tier = getTier(item.licenseType, item.tierId);
		return `${license.label} — ${tier.label}`;
	}
</script>

<aside
	class="CartSummary"
	class:is-expanded={mobileExpanded}
	role="region"
	aria-label="Cart summary"
>
	<!-- Mobile sticky bar header -->
	<button
		type="button"
		class="CartSummary__mobile-bar"
		onclick={onMobileToggle}
		aria-expanded={mobileExpanded}
		aria-controls="cart-details"
	>
		<span class="CartSummary__mobile-label">
			{#if hasItems}
				{items.length} licence{items.length > 1 ? 's' : ''} selected
			{:else}
				No licence selected
			{/if}
		</span>
		<span class="CartSummary__mobile-total" aria-live="polite" role="status">
			{hasItems ? formatPrice(total, currency) : '—'}
		</span>
		<span class="CartSummary__mobile-chevron" aria-hidden="true">
			{mobileExpanded ? '▾' : '▴'}
		</span>
	</button>

	<!-- Cart details panel -->
	<div class="CartSummary__details" id="cart-details" aria-live="polite" role="status">
		{#if !hasItems}
			<h3 class="CartSummary__heading">Your cart</h3>
			<p class="CartSummary__empty">Choose a licence type to begin.</p>
		{:else}
			<!-- Licence formats -->
			<section class="CartSummary__section">
				<h3 class="CartSummary__heading">Licence formats</h3>
				<ul class="CartSummary__licences">
					{#each items as item (item.licenseType + item.tierId)}
						<li class="CartSummary__licence">
							<span class="CartSummary__licence-label">{licenseLineLabel(item)}</span>
							<button
								type="button"
								class="CartSummary__remove"
								onclick={() => onremove(item.licenseType)}
								aria-label={`Remove ${licenseLineLabel(item)}`}
							>
								×
							</button>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Fonts (12 weights) -->
			<section class="CartSummary__section">
				<h3 class="CartSummary__heading">Fonts</h3>
				<ul class="CartSummary__fonts">
					{#each WEIGHTS as weight (weight.id)}
						<li class="CartSummary__font">
							<span class="CartSummary__font-name">Aether {weight.name}</span>
							<span class="CartSummary__font-price">{rowPrice(perWeightTotal)}</span>
						</li>
					{/each}
				</ul>
			</section>

			<!-- Totals -->
			<section class="CartSummary__totals">
				<div class="CartSummary__row">
					<span>Subtotal</span>
					<span class="CartSummary__row-currency">{currency}</span>
					<span class="CartSummary__row-amount">{formatPrice(subtotal, currency)}</span>
				</div>

				{#each discounts as discount (discount.id)}
					<div class="CartSummary__row CartSummary__row--discount">
						<span>{discount.label}</span>
						<span class="CartSummary__row-currency">{currency}</span>
						<span class="CartSummary__row-amount">−{formatPrice(discount.amount, currency)}</span>
					</div>
				{/each}

				<div class="CartSummary__row CartSummary__row--total">
					<span>Total</span>
					<span class="CartSummary__row-currency">{currency}</span>
					<span class="CartSummary__row-amount">{formatPrice(total, currency)}</span>
				</div>
			</section>

			<!-- Checkout -->
			<form method="POST" action="?/checkout" class="CartSummary__form">
				<input type="hidden" name="currency" value={currency} />
				<input type="hidden" name="total" value={total} />
				{#each items as item}
					<input type="hidden" name="item_license" value={item.licenseType} />
					<input type="hidden" name="item_tier" value={item.tierId} />
					<input type="hidden" name="item_price" value={item.basePrice} />
				{/each}
				<button type="submit" class="CartSummary__checkout-btn">Checkout</button>
			</form>
		{/if}
	</div>
</aside>

<style>
	.CartSummary {
		background: var(--color-bg);
		font-family: 'Aether', sans-serif;
	}

	/* ── Mobile sticky bar ── */
	.CartSummary__mobile-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		padding: 14px 20px;
		background: var(--color-text);
		color: var(--color-bg);
		border: 0;
		cursor: pointer;
		font-family: 'Aether', sans-serif;
	}

	.CartSummary__mobile-label {
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		flex: 1;
		text-align: left;
	}

	.CartSummary__mobile-total {
		font-size: 14px;
		font-variation-settings: 'wght' 500;
	}

	.CartSummary__mobile-chevron {
		font-size: 10px;
		opacity: 0.7;
	}

	/* ── Details panel ── */
	.CartSummary__details {
		display: none;
		padding: 24px 20px;
		background: var(--color-bg-gray);
	}

	/* Mobile expanded: cap height + scroll so all detail rows are reachable */
	.CartSummary.is-expanded .CartSummary__details {
		display: block;
		max-height: calc(100vh - 120px);
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}

	@media (min-width: 768px) {
		.CartSummary__mobile-bar {
			display: none;
		}

		.CartSummary__details {
			display: block;
			position: sticky;
			top: 80px;
			max-height: none;
			overflow-y: visible;
		}
	}

	.CartSummary__section {
		margin-bottom: 28px;
	}

	.CartSummary__heading {
		font-size: 13px;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		margin: 0 0 14px;
	}

	.CartSummary__empty {
		font-size: 13px;
		font-variation-settings: 'wght' 300;
		color: var(--color-text-mute);
		line-height: 1.5;
	}

	/* ── Licences ── */
	.CartSummary__licences {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.CartSummary__licence {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 12px 14px;
		background: var(--color-bg);
		font-size: 13px;
		font-variation-settings: 'wght' 400;
	}

	.CartSummary__licence-label {
		flex: 1;
	}

	.CartSummary__remove {
		background: transparent;
		border: 0;
		font: inherit;
		font-size: 18px;
		line-height: 1;
		color: var(--color-text-mute);
		cursor: pointer;
		padding: 0 4px;
		transition: color 120ms;
	}

	.CartSummary__remove:hover {
		color: var(--color-text);
	}

	/* ── Fonts list ── */
	.CartSummary__fonts {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.CartSummary__font {
		display: flex;
		justify-content: space-between;
		padding: 8px 0;
		font-size: 13px;
		font-variation-settings: 'wght' 400;
	}

	.CartSummary__font-name {
		flex: 1;
	}

	.CartSummary__font-price {
		font-variation-settings: 'wght' 450;
		min-width: 64px;
		text-align: right;
	}

	/* ── Totals ── */
	.CartSummary__totals {
		padding-top: 20px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 20px;
	}

	.CartSummary__row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 12px;
		align-items: baseline;
		font-size: 13px;
		font-variation-settings: 'wght' 400;
	}

	.CartSummary__row-currency {
		font-size: 11px;
		opacity: 0.55;
		font-variation-settings: 'wght' 400;
	}

	.CartSummary__row-amount {
		font-variation-settings: 'wght' 500;
		min-width: 80px;
		text-align: right;
	}

	.CartSummary__row--discount {
		color: #2e7d32;
	}

	.CartSummary__row--total {
		padding-top: 10px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		font-size: 16px;
		font-variation-settings: 'wght' 500;
	}

	.CartSummary__row--total .CartSummary__row-amount {
		font-size: 16px;
		font-variation-settings: 'wght' 550;
	}

	/* ── Checkout ── */
	.CartSummary__checkout-btn {
		display: block;
		width: 100%;
		padding: 16px 16px;
		background: var(--color-text);
		color: var(--color-bg);
		font-family: 'Aether', sans-serif;
		font-size: 14px;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		border: 0;
		cursor: pointer;
		text-align: center;
		transition: opacity 150ms;
	}

	.CartSummary__checkout-btn:hover {
		opacity: 0.86;
	}

	.CartSummary__form {
		margin: 0;
	}
</style>
