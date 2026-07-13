<script lang="ts">
	import { page } from '$app/state';
	import { t, type Locale } from '$lib/i18n';

	// Reservation progress indicator. current is 1..4.
	let { current = 1 }: { current?: number } = $props();
	const L = $derived((page.data.locale ?? 'ja') as Locale);
	const steps = $derived([
		{ n: 1, label: t(L, 'step.1') },
		{ n: 2, label: t(L, 'step.2') },
		{ n: 3, label: t(L, 'step.3') },
		{ n: 4, label: t(L, 'step.4') }
	]);
</script>

<ol class="Stepper" aria-label={t(L, 'rsv.stepperAria')}>
	{#each steps as s (s.n)}
		<li class="Stepper__item" class:is-active={s.n === current} class:is-done={s.n < current}>
			<span class="Stepper__num">{s.n}</span>
			<span class="Stepper__label">{s.label}</span>
		</li>
	{/each}
</ol>

<style>
	.Stepper {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin: 0 0 var(--space-8);
		padding: 0;
	}
	.Stepper__item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--fs-h6);
		opacity: 0.4;
	}
	.Stepper__item.is-active {
		opacity: 1;
	}
	.Stepper__item.is-done {
		opacity: 0.7;
	}
	.Stepper__num {
		display: grid;
		place-items: center;
		width: 1.7em;
		height: 1.7em;
		border-radius: 999px;
		border: 1px solid currentColor;
		font-feature-settings: 'tnum';
	}
	.Stepper__item.is-active .Stepper__num {
		background: var(--color-text);
		color: var(--color-bg);
		border-color: var(--color-text);
	}
	.Stepper__label {
		white-space: nowrap;
	}
	@media (max-width: 640px) {
		.Stepper__item:not(.is-active) .Stepper__label {
			display: none;
		}
	}
</style>
