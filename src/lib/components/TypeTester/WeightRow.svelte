<script lang="ts">
	import type { WeightDef } from './presets.js';
	import type { AlignValue } from './presets.js';

	interface Props {
		weight: WeightDef;
		text: string;
		fontSize: number; // px
		letterSpacing: number; // em
		lineHeight: number; // unitless
		align: AlignValue;
	}

	let { weight, text, fontSize, letterSpacing, lineHeight, align }: Props = $props();
</script>

<div class="WeightRow" role="listitem">
	<!-- Mobile: label stacks above text; desktop: inline via grid -->
	<div class="WeightRow__label" aria-label="{weight.name}, weight axis {weight.axisValue}">
		<span class="label-name">{weight.name}</span>
		<span class="label-axis">wght {weight.axisValue}</span>
	</div>

	<div
		class="WeightRow__text"
		style="
      font-family: 'Aether', sans-serif;
      font-variation-settings: 'wght' {weight.axisValue};
      font-size: {fontSize}px;
      letter-spacing: {letterSpacing}em;
      line-height: {lineHeight};
      text-align: {align};
    "
		aria-label="{weight.name} weight preview"
	>
		{text}
	</div>
</div>

<style>
	.WeightRow {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding-block: 16px;
		border-top: 1px solid var(--color-line);
		width: 100%;
	}

	.WeightRow:last-child {
		border-bottom: 1px solid var(--color-line);
	}

	.WeightRow__label {
		display: flex;
		gap: 8px;
		align-items: baseline;
		color: var(--color-text-mute);
		font-family: var(--font-en), sans-serif;
		font-size: 10px;
		font-variation-settings: normal;
		letter-spacing: 0;
		line-height: 1.4;
		user-select: none;
	}

	.label-name {
		font-weight: 500;
	}

	.label-axis {
		font-weight: 400;
		opacity: 0.7;
	}

	.WeightRow__text {
		display: block;
		width: 100%;
		word-break: break-word;
		/* Prevent layout shift when font loads */
		min-height: 1em;
	}

	/* Desktop: single-row grid — name | text | wght value */
	@media (min-width: 768px) {
		.WeightRow {
			display: grid;
			grid-template-columns: 110px 1fr;
			align-items: baseline;
			gap: 0 24px;
			flex-direction: unset;
		}

		.WeightRow__label {
			flex-direction: column;
			gap: 2px;
			padding-top: 0;
		}
	}
</style>
