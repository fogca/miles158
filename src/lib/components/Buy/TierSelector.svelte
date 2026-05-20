<script lang="ts">
	// Tier selector for a single license type.
	// Shows all tiers; Contact tier redirects to /contact instead of adding to cart.
	import { getLicense, formatPrice } from '$lib/data/pricing';
	import type { LicenseType, Currency } from '$lib/data/pricing';
	import type { CartItem } from '$lib/data/discounts';

	interface Props {
		licenseType: LicenseType;
		currency: Currency;
		selectedTierId: string | null;
		onselect: (item: CartItem) => void;
		onremove: (licenseType: LicenseType) => void;
	}

	let { licenseType, currency, selectedTierId, onselect, onremove }: Props = $props();

	const license = $derived(getLicense(licenseType));

	// Anchoring: show single-weight × 12 → family bundle pricing
	const SINGLE_WEIGHT_EUR = 40;
	const FAMILY_COUNT = 12;
	const FAMILY_RATE = 0.25;

	// Compute anchoring values in selected currency (ratio from EUR)
	function anchorValues(
		tierId: string
	): { single: number; gross: number; saving: number } | null {
		const tier = license.tiers.find((t) => t.id === tierId);
		if (!tier) return null;
		const tierEUR = tier.prices['EUR'];
		if (tierEUR === null) return null;
		// gross = family bundle price / (1 - FAMILY_RATE) → single-weight × count
		const grossEUR = tierEUR / (1 - FAMILY_RATE);
		const ratio = tier.prices[currency] !== null ? (tier.prices[currency] as number) / tierEUR : 1;
		return {
			single: Math.round((SINGLE_WEIGHT_EUR * ratio * 10) / 10),
			gross: Math.round(grossEUR * ratio),
			saving: Math.round(grossEUR * ratio - (tier.prices[currency] as number))
		};
	}

	function handleSelect(tierId: string) {
		const tier = license.tiers.find((t) => t.id === tierId)!;
		const price = tier.prices[currency];
		if (price === null) {
			// Contact tier — navigate
			window.location.href = '/contact';
			return;
		}
		onselect({ licenseType, tierId, basePrice: price });
	}
</script>

<div class="TierSelector">
	<!-- Header row -->
	<div class="TierSelector__header">
		<span class="TierSelector__license-name">{license.label} License</span>
		<button
			type="button"
			class="TierSelector__remove"
			onclick={() => onremove(licenseType)}
			aria-label={`Remove ${license.label} license`}
		>
			Remove
		</button>
	</div>

	<p class="TierSelector__blurb">{license.blurb}</p>

	<!-- Family anchoring display (only for desktop tier on first selected tier) -->
	<div class="TierSelector__anchor" aria-label="Family bundle pricing breakdown">
		<span>Single weight × {FAMILY_COUNT}</span>
		<span class="TierSelector__anchor-mute">— Family bundle (−25%)</span>
	</div>

	<!-- Tier list -->
	<ul class="TierSelector__list" role="listbox" aria-label={`${license.label} tier options`}>
		{#each license.tiers as tier (tier.id)}
			{@const price = tier.prices[currency]}
			{@const isContact = price === null}
			{@const isSelected = selectedTierId === tier.id}
			<li class="TierSelector__tier" role="option" aria-selected={isSelected}>
				<button
					type="button"
					class="TierSelector__tier-btn"
					class:is-selected={isSelected}
					class:is-contact={isContact}
					onclick={() => handleSelect(tier.id)}
					aria-label={`${tier.label}: ${isContact ? 'Contact us' : formatPrice(price, currency)}`}
				>
					<span class="TierSelector__tier-radio" aria-hidden="true">
						{#if isSelected}
							<span class="TierSelector__tier-dot"></span>
						{/if}
					</span>
					<span class="TierSelector__tier-label">{tier.label}</span>
					<span class="TierSelector__tier-price">
						{#if isContact}
							<a href="/contact" class="TierSelector__contact-link">Contact us</a>
						{:else}
							{formatPrice(price, currency)}
						{/if}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.TierSelector {
		padding: 20px 18px;
		margin-bottom: 12px;
		background: var(--color-bg-gray);
	}

	.TierSelector__header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 6px;
	}

	.TierSelector__license-name {
		font-family: 'Aether', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
	}

	.TierSelector__remove {
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.TierSelector__remove:hover {
		color: var(--color-text);
	}

	.TierSelector__blurb {
		font-family: 'Aether', sans-serif;
		font-size: 12px;
		font-variation-settings: 'wght' 300;
		color: var(--color-text-mute);
		margin-bottom: 16px;
		line-height: 1.55;
	}

	.TierSelector__anchor {
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
		margin-bottom: 12px;
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.TierSelector__anchor-mute {
		opacity: 0.6;
	}

	.TierSelector__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.TierSelector__tier {
		margin-bottom: 4px;
	}

	.TierSelector__tier:last-child {
		margin-bottom: 0;
	}

	.TierSelector__tier-btn {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 14px;
		background: var(--color-bg);
		border: 0;
		cursor: pointer;
		text-align: left;
		transition: background 120ms, color 120ms;
	}

	.TierSelector__tier-btn:hover {
		background: #e3e3e3;
	}

	.TierSelector__tier-btn.is-selected {
		background: var(--color-text);
		color: var(--color-bg);
	}

	/* Force nested spans to inherit the inverted color (overrides base.css element selectors) */
	.TierSelector__tier-btn.is-selected :global(span) {
		color: var(--color-bg);
	}

	.TierSelector__tier-btn.is-selected:hover {
		background: var(--color-text);
		opacity: 0.92;
	}

	.TierSelector__tier-btn.is-contact {
		cursor: default;
	}

	/* Radio indicator */
	.TierSelector__tier-radio {
		width: 14px;
		height: 14px;
		border: 1px solid currentColor;
		border-radius: 50%;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.TierSelector__tier-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}

	.TierSelector__tier-label {
		font-family: 'Aether', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 350;
		flex: 1;
	}

	.TierSelector__tier-price {
		font-family: 'Aether', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 450;
		text-align: right;
		min-width: 80px;
	}

	.TierSelector__contact-link {
		color: var(--color-text-mute);
		text-decoration: underline;
		text-underline-offset: 2px;
		font-variation-settings: 'wght' 350;
		font-size: 12px;
	}
</style>
