<script lang="ts">
	import { onMount } from 'svelte';
	import WeightRow from './WeightRow.svelte';
	import ControlPanel from './ControlPanel.svelte';
	import {
		WEIGHTS,
		DEFAULT_TEXT,
		FONT_SIZE_DEFAULT,
		FONT_SIZE_DEFAULT_MOBILE,
		LETTER_SPACING_DEFAULT,
		LINE_HEIGHT_DEFAULT,
		ALIGN_DEFAULT,
		FONT_SIZE_MIN,
		FONT_SIZE_MAX,
		LETTER_SPACING_MIN,
		LETTER_SPACING_MAX,
		LINE_HEIGHT_MIN,
		LINE_HEIGHT_MAX,
		ALIGN_OPTIONS,
		MOBILE_BREAKPOINT_PX
	} from './presets.js';
	import type { AlignValue } from './presets.js';

	// --- State (Svelte 5 runes) ---
	let fontSize = $state(FONT_SIZE_DEFAULT);
	let letterSpacing = $state(LETTER_SPACING_DEFAULT);
	let lineHeight = $state(LINE_HEIGHT_DEFAULT);
	let align = $state<AlignValue>(ALIGN_DEFAULT);
	let text = $state(DEFAULT_TEXT);

	// Whether URL params have been loaded (avoids overwriting on navigation)
	let initialized = $state(false);

	// --- URL param helpers ---

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	function isValidAlign(v: string): v is AlignValue {
		return (ALIGN_OPTIONS as string[]).includes(v);
	}

	// Whether the user has manually changed the font size via the slider.
	// Once true, viewport changes no longer overwrite it.
	let userChangedFontSize = $state(false);

	// Lazy-loaded SvelteKit replaceState (avoids "router not initialized" race
	// and avoids native history API conflict warnings).
	type ReplaceStateFn = (url: string, state: object) => void;
	let replaceStateApi = $state<ReplaceStateFn | null>(null);

	/** Read initial state from URL search params (font size is viewport-derived, not from URL) */
	function initFromUrl(params: URLSearchParams) {
		const ls = Number(params.get('ls'));
		const lh = Number(params.get('lh'));
		const al = params.get('align');
		const tx = params.get('text');

		if (!isNaN(ls) && ls >= LETTER_SPACING_MIN && ls <= LETTER_SPACING_MAX) letterSpacing = ls;
		if (!isNaN(lh) && lh >= LINE_HEIGHT_MIN && lh <= LINE_HEIGHT_MAX) lineHeight = lh;
		if (al && isValidAlign(al)) align = al;
		if (tx !== null) text = decodeURIComponent(tx);
	}

	/** Push current state into URL without adding a history entry.
	 * Skips silently until the SvelteKit router is initialized (replaceStateApi loaded). */
	function syncUrl() {
		if (!replaceStateApi) return;

		const params = new URLSearchParams();
		// Font size only enters the URL once the user has interacted with the slider —
		// otherwise viewport-derived defaults govern.
		if (userChangedFontSize) params.set('fs', String(fontSize));
		params.set('ls', String(letterSpacing));
		params.set('lh', String(lineHeight));
		params.set('align', align);
		params.set('text', encodeURIComponent(text));

		const url = `${window.location.pathname}?${params.toString()}`;
		replaceStateApi(url, {});
	}

	// Apply viewport-driven default font size on mount and on viewport changes
	// (chairman directive 2026-05-07: PC 36px / SP 20px).
	onMount(() => {
		const params = new URL(window.location.href).searchParams;
		const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`);

		const applyViewportDefault = () => {
			if (userChangedFontSize) return;
			fontSize = mql.matches ? FONT_SIZE_DEFAULT_MOBILE : FONT_SIZE_DEFAULT;
		};

		applyViewportDefault();
		mql.addEventListener('change', applyViewportDefault);

		initFromUrl(params);
		initialized = true;

		// Load SvelteKit nav API only after router is ready (post-mount)
		import('$app/navigation').then(({ replaceState }) => {
			replaceStateApi = replaceState as ReplaceStateFn;
		});

		return () => mql.removeEventListener('change', applyViewportDefault);
	});

	// Sync URL whenever state changes (skip before init to avoid double-write)
	$effect(() => {
		// Access all reactive state to register dependencies
		void fontSize;
		void letterSpacing;
		void lineHeight;
		void align;
		void text;

		if (!initialized) return;
		syncUrl();
	});

	// --- Control callbacks ---

	function handleFontSize(v: number) {
		fontSize = clamp(v, FONT_SIZE_MIN, FONT_SIZE_MAX);
		userChangedFontSize = true;
	}

	function handleLetterSpacing(v: number) {
		letterSpacing = clamp(v, LETTER_SPACING_MIN, LETTER_SPACING_MAX);
	}

	function handleLineHeight(v: number) {
		lineHeight = clamp(v, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX);
	}

	function handleAlign(v: AlignValue) {
		align = v;
	}

	function handleText(v: string) {
		text = v;
	}
</script>

<section class="TypeTester" aria-label="Type Tester — Aether">
	<div class="TypeTester__header">
		<h2 class="TypeTester__title">Type Tester</h2>
		<p class="TypeTester__subtitle">
			Aether Book — preview. Full 12-weight Variable Font in development.
		</p>
	</div>

	<!-- Weight rows -->
	<div class="TypeTester__rows" role="list" aria-label="Weight specimens">
		{#each WEIGHTS as weight (weight.id)}
			<WeightRow
				{weight}
				{text}
				{fontSize}
				{letterSpacing}
				{lineHeight}
				{align}
			/>
		{/each}
	</div>

	<!-- Sticky control panel -->
	<ControlPanel
		{fontSize}
		{letterSpacing}
		{lineHeight}
		{align}
		{text}
		onFontSizeChange={handleFontSize}
		onLetterSpacingChange={handleLetterSpacing}
		onLineHeightChange={handleLineHeight}
		onAlignChange={handleAlign}
		onTextChange={handleText}
	/>
</section>

<style>
	.TypeTester {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		padding-top: 60px;
	}

	.TypeTester__header {
		padding-bottom: 40px;
		/* Mobile: no side padding per chairman directive */
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.TypeTester__header {
			padding-inline: var(--padding);
		}
	}

	.TypeTester__title {
		font-family: var(--font-en), sans-serif;
		font-size: var(--fs-h5);
		font-weight: 400;
		color: var(--color-text-mute);
		letter-spacing: 0;
	}

	.TypeTester__subtitle {
		font-family: var(--font-en), sans-serif;
		font-size: var(--fs-h6);
		color: var(--color-text-mute);
		margin-top: 4px;
	}

	.TypeTester__rows {
		flex: 1;
		/* Mobile: no side padding per chairman directive */
		padding-inline: 0;
	}

	@media (min-width: 768px) {
		.TypeTester__rows {
			padding-inline: var(--padding);
		}
	}
</style>
