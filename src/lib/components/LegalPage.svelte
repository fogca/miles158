<script lang="ts">
	import { page } from '$app/state';
	import { t, type Locale } from '$lib/i18n';

	const L = $derived((page.data.locale ?? 'ja') as Locale);
	let {
		title,
		eyebrow = 'Legal',
		updated = '2026-06-23',
		children
	}: {
		title: string;
		eyebrow?: string;
		updated?: string;
		children: import('svelte').Snippet;
	} = $props();
</script>

<main class="Legal">
	<div class="Legal__inner">
		<p class="Legal__eyebrow" lang="en">{eyebrow}</p>
		<h1 class="Legal__title" lang="ja">{title}</h1>
		<p class="Legal__updated" lang="ja">最終更新日：{updated}</p>
		{#if L !== 'ja'}<p class="Legal__notice">{t(L, 'legal.nonJaNotice')}</p>{/if}
		<div class="Legal__body" lang="ja">
			{@render children()}
		</div>
	</div>
</main>

<style>
	.Legal {
		padding-top: calc(var(--space-11) + var(--space-5));
		padding-bottom: var(--space-11);
	}
	.Legal__inner {
		max-width: 760px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}
	.Legal__eyebrow {
		font-size: var(--fs-h6);
		letter-spacing: 0.08em;
		opacity: 0.55;
		margin: 0 0 var(--space-2);
	}
	.Legal__title {
		font-size: var(--fs-h2);
		margin: 0 0 var(--space-2);
	}
	.Legal__notice { font-size: var(--fs-h6); padding: var(--space-3) var(--space-4); border: 1px solid var(--color-line); border-radius: 6px; opacity: .75; margin-bottom: var(--space-6); }
	.Legal__updated {
		font-size: var(--fs-h6);
		opacity: 0.5;
		margin-bottom: var(--space-7);
	}
	.Legal__body :global(h2) {
		font-size: var(--fs-h4);
		margin: var(--space-7) 0 var(--space-3);
	}
	.Legal__body :global(h3) {
		font-size: var(--fs-h5);
		margin: var(--space-5) 0 var(--space-2);
	}
	.Legal__body :global(p),
	.Legal__body :global(li) {
		font-size: var(--fs-h5);
		line-height: 1.9;
		opacity: 0.85;
	}
	.Legal__body :global(ul),
	.Legal__body :global(ol) {
		margin: var(--space-2) 0 var(--space-4);
		padding-left: 1.4em;
	}
	.Legal__body :global(li) {
		list-style: disc;
		margin-bottom: var(--space-1);
	}
	.Legal__body :global(dl) {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-3);
		margin: var(--space-4) 0;
	}
	.Legal__body :global(dt) {
		font-size: var(--fs-h6);
		opacity: 0.55;
	}
	.Legal__body :global(dd) {
		margin: 0 0 var(--space-3);
		font-size: var(--fs-h5);
	}
	.Legal__body :global(.placeholder) {
		background: rgba(51, 121, 230, 0.08);
		border-radius: 3px;
		padding: 0 4px;
	}
</style>
