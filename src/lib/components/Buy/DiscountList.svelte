<script lang="ts">
	// Renders the list of applied discounts with label and amount.
	import { formatPrice } from '$lib/data/pricing';
	import type { Currency } from '$lib/data/pricing';
	import type { AppliedDiscount } from '$lib/data/discounts';

	interface Props {
		discounts: AppliedDiscount[];
		currency: Currency;
	}

	let { discounts, currency }: Props = $props();
</script>

{#if discounts.length > 0}
	<ul class="DiscountList" aria-label="Applied discounts">
		{#each discounts as d (d.id)}
			<li class="DiscountList__item">
				<span class="DiscountList__label">{d.label}</span>
				<span class="DiscountList__amount">−{formatPrice(d.amount, currency)}</span>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.DiscountList {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.DiscountList__item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-family: 'Aether', sans-serif;
		font-size: 12px;
	}

	.DiscountList__label {
		font-variation-settings: 'wght' 350;
		color: var(--color-text-mute);
	}

	.DiscountList__amount {
		font-variation-settings: 'wght' 450;
		color: var(--color-text);
	}
</style>
