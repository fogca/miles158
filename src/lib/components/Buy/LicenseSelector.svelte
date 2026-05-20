<script lang="ts">
	// License type selector — 4 cards (Desktop / Web / App / Books)
	import { LICENSES, formatPrice } from '$lib/data/pricing';
	import type { LicenseType, Currency } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';

	interface Props {
		currency: Currency;
		cartItems: CartItem[];
		onselect: (licenseType: LicenseType) => void;
	}

	let { currency, cartItems, onselect }: Props = $props();

	// Which license types are already in the cart?
	const cartTypes = $derived(new Set(cartItems.map((i) => i.licenseType)));

	// Get the "from" price for each license (first non-null tier)
	function fromPrice(license: (typeof LICENSES)[number]): string {
		const firstTier = license.tiers.find((t) => t.prices[currency] !== null);
		if (!firstTier) return 'Contact';
		return formatPrice(firstTier.prices[currency], currency);
	}
</script>

<div class="LicenseSelector">
	<h2 class="LicenseSelector__title">Choose License Type</h2>
	<p class="LicenseSelector__hint">
		Buy 2 or more license types together and save 17%
	</p>

	<div class="LicenseSelector__grid">
		{#each LICENSES as license (license.id)}
			{@const inCart = cartTypes.has(license.id)}
			<button
				type="button"
				class="LicenseSelector__card"
				class:is-active={inCart}
				onclick={() => onselect(license.id)}
				aria-pressed={inCart}
				aria-label={`${license.label} license, starting from ${fromPrice(license)}`}
			>
				<span class="LicenseSelector__card-label">{license.label}</span>
				<span class="LicenseSelector__card-from">from {fromPrice(license)}</span>
				<span class="LicenseSelector__card-blurb">{license.blurb}</span>
				{#if inCart}
					<span class="LicenseSelector__card-dot" aria-label="Selected"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.LicenseSelector {
		margin-bottom: 40px;
	}

	.LicenseSelector__title {
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		color: var(--color-text-mute);
		margin-bottom: 8px;
	}

	.LicenseSelector__hint {
		font-family: 'Aether', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		margin-bottom: 20px;
	}

	.LicenseSelector__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	@media (min-width: 480px) {
		.LicenseSelector__grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.LicenseSelector__card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 20px 18px;
		border: 0;
		background: var(--color-bg-gray);
		cursor: pointer;
		text-align: left;
		transition: background 150ms, color 150ms;
	}

	.LicenseSelector__card:hover {
		background: #e3e3e3;
	}

	.LicenseSelector__card.is-active {
		background: var(--color-text);
		color: var(--color-bg);
	}

	/* Force nested spans to inherit inverted color (overrides base.css element selectors) */
	.LicenseSelector__card.is-active :global(span) {
		color: var(--color-bg);
	}

	.LicenseSelector__card.is-active:hover {
		background: var(--color-text);
		opacity: 0.92;
	}

	.LicenseSelector__card-label {
		font-family: 'Aether', sans-serif;
		font-size: 18px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
		margin-bottom: 4px;
		display: block;
	}

	.LicenseSelector__card-from {
		font-family: 'Aether', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 350;
		margin-bottom: 10px;
		display: block;
		opacity: 0.65;
	}

	.LicenseSelector__card.is-active .LicenseSelector__card-from {
		opacity: 0.75;
	}

	.LicenseSelector__card-blurb {
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 300;
		line-height: 1.5;
		display: block;
		opacity: 0.55;
	}

	.LicenseSelector__card.is-active .LicenseSelector__card-blurb {
		opacity: 0.7;
	}

	.LicenseSelector__card-dot {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-bg);
	}
</style>
