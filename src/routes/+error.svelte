<script lang="ts">
	import { page } from '$app/state';
	import { t, l as lhref, type Locale } from '$lib/i18n';

	const L = $derived((page.data.locale ?? 'ja') as Locale);
	const is404 = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{page.status} — MILES 158</title>
</svelte:head>

<main class="Err">
	<div class="Err__inner">
		<p class="Err__code" lang="en">{page.status}</p>
		<h1 class="Err__title">{t(L, is404 ? 'err.404Title' : 'err.500Title')}</h1>
		<p class="Err__body">{t(L, is404 ? 'err.404Body' : 'err.500Body')}</p>
		<a class="btn-outline" href={lhref(L, '/')}>{t(L, 'done.home')}</a>
	</div>
</main>

<style>
	.Err {
		min-height: 70vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: calc(var(--space-11) + var(--space-5)) var(--padding) var(--space-11);
	}
	.Err__inner {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}
	.Err__code {
		font-size: var(--fs-h1);
		line-height: 1;
		opacity: 0.25;
		margin: 0;
		font-feature-settings: 'tnum';
	}
	.Err__title {
		font-size: var(--fs-h3);
		margin: 0;
	}
	.Err__body {
		font-size: var(--fs-h5);
		opacity: 0.7;
		line-height: 1.8;
		margin: 0 0 var(--space-3);
		max-width: 40ch;
	}
</style>
