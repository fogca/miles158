<script lang="ts">
	// Educational discount toggle.
	// When enabled, all other discounts are suppressed (§11.4-D).
	interface Props {
		checked: boolean;
		onchange: (v: boolean) => void;
	}

	let { checked, onchange }: Props = $props();
</script>

<div class="EducationalToggle">
	<label class="EducationalToggle__label" for="edu-toggle">
		<span class="EducationalToggle__checkbox-wrap">
			<input
				id="edu-toggle"
				type="checkbox"
				class="EducationalToggle__input sr-only"
				checked={checked}
				onchange={(e) => onchange((e.target as HTMLInputElement).checked)}
				aria-describedby="edu-description"
			/>
			<span class="EducationalToggle__box" aria-hidden="true">
				{#if checked}
					<span class="EducationalToggle__check">✓</span>
				{/if}
			</span>
		</span>

		<span class="EducationalToggle__text">
			<span class="EducationalToggle__title">Educational discount (−30%)</span>
			<span class="EducationalToggle__desc" id="edu-description">
				For students and educational institutions. Requires .edu / .ac.jp email or student ID.
				Cannot be combined with other discounts.
			</span>
		</span>
	</label>

	{#if checked}
		<div class="EducationalToggle__badge" role="status" aria-live="polite">
			Educational discount applied — other discounts suppressed
		</div>
	{/if}
</div>

<style>
	.EducationalToggle {
		border-top: 1px solid var(--color-line);
		padding-top: 20px;
		margin-top: 8px;
	}

	.EducationalToggle__label {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		cursor: pointer;
	}

	.EducationalToggle__checkbox-wrap {
		flex-shrink: 0;
		position: relative;
		margin-top: 2px;
	}

	.EducationalToggle__box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border: 1px solid var(--color-text);
		background: transparent;
		transition: background 100ms;
	}

	/* Highlight box when checked */
	.EducationalToggle__input:checked ~ .EducationalToggle__box {
		background: var(--color-text);
	}

	.EducationalToggle__check {
		font-size: 10px;
		color: var(--color-bg);
		line-height: 1;
	}

	.EducationalToggle__text {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.EducationalToggle__title {
		font-family: 'Aether', sans-serif;
		font-size: 13px;
		font-variation-settings: 'wght' 450;
	}

	.EducationalToggle__desc {
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 300;
		color: var(--color-text-mute);
		line-height: 1.55;
	}

	.EducationalToggle__badge {
		margin-top: 10px;
		padding: 8px 12px;
		background: #e8f5e9;
		color: #2e7d32;
		font-family: 'Aether', sans-serif;
		font-size: 11px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
	}
</style>
