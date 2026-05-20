<script lang="ts">
	// Currency selector: EUR / JPY / USD
	import type { Currency } from '$lib/data/pricing';

	interface Props {
		value: Currency;
		onchange: (c: Currency) => void;
	}

	let { value, onchange }: Props = $props();

	const OPTIONS: Currency[] = ['EUR', 'JPY', 'USD'];
</script>

<div class="CurrencyToggle" role="group" aria-label="Select display currency">
	{#each OPTIONS as option (option)}
		<button
			type="button"
			class="CurrencyToggle__btn"
			class:is-active={value === option}
			onclick={() => onchange(option)}
			aria-pressed={value === option}
		>
			{option}
		</button>
	{/each}
</div>

<style>
	.CurrencyToggle {
		display: flex;
		gap: 4px;
	}

	.CurrencyToggle__btn {
		padding: 7px 14px;
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
		background: var(--color-bg-gray);
		border: 0;
		cursor: pointer;
		color: var(--color-text);
		transition: background 120ms, color 120ms;
	}

	.CurrencyToggle__btn:hover:not(.is-active) {
		background: #e3e3e3;
	}

	.CurrencyToggle__btn.is-active {
		background: var(--color-text);
		color: var(--color-bg);
	}
</style>
