<!--
  PageTransition.svelte
  ─────────────────────────────────────────────────────────────
  SvelteKit 用の汎用ページ遷移ラッパー。
  - 旧ページ: scale down + darken overlay + 白パネル slide up
  - 新ページ: 白パネル上にフェードイン
  - Awwwards 系の silky ease を採用 (CustomEase 'panelSilk')

  USAGE
  -------------------------------------------------------------
  1) gsap と CustomEase を install
     npm i gsap

  2) +layout.svelte で本コンポーネントを root に配置
     <PageTransition
       onPanelUp={() => { /* Lenis stop など */ }}
       onFadeInStart={() => { /* Header 表示 */ }}
       onComplete={() => { /* Lenis start など */ }}
     >
       <Header />
       {@render children()}
       <Footer />
     </PageTransition>

  3) Lenis を併用する場合: 親で lenis.stop() / lenis.start()
     を onPanelUp / onComplete に渡す

  CUSTOMIZATION
  -------------------------------------------------------------
  - panelColor: 白パネルの色 (default '#ffffff'). 黒系遷移は '#121212' 等
  - skipFadeIn: ローダーや専用イントロが直後に走るルートでは
                true にしてフェードインをスキップ
-->

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$app/environment';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { CustomEase } from 'gsap/CustomEase';

	gsap.registerPlugin(CustomEase);
	// Awwwards-style silk ease for the white panel
	if (!CustomEase.get('panelSilk')) CustomEase.create('panelSilk', 'M0,0 C0.76,0 0.24,1 1,1');
	// Soft, slow-landing ease for content fade-in
	if (!CustomEase.get('contentFade'))
		CustomEase.create('contentFade', 'M0,0 C0.22,1 0.36,1 1,1');

	type Props = {
		children: Snippet;
		// Per-route override: pass true on routes that hand off to a
		// custom intro/loader so we skip the fade-in step.
		skipFadeIn?: boolean;
		// Panel background — supports per-route theming.
		panelColor?: string;
		// Lifecycle hooks
		onPanelUp?: () => void; // called when the outgoing animation starts (good for lenis.stop())
		onFadeInStart?: () => void; // called as the new page begins to fade in (good for Header reveal)
		onComplete?: () => void; // called when the entire transition ends
		// Tunable timings (seconds)
		outDuration?: number;
		fadeInDelay?: number;
		fadeInDuration?: number;
		pageScale?: number;
		darkenOpacity?: number;
		darkenDelayRatio?: number;
		darkenDurationRatio?: number;
		panelDelayRatio?: number;
		panelDuration?: number;
	};

	let {
		children,
		skipFadeIn = false,
		panelColor = '#ffffff',
		onPanelUp,
		onFadeInStart,
		onComplete,
		outDuration = 1.0,
		fadeInDelay = 0.3,
		fadeInDuration = 0.9,
		pageScale = 0.85,
		darkenOpacity = 0.35,
		darkenDelayRatio = 0.25,
		darkenDurationRatio = 0.75,
		panelDelayRatio = 0.45,
		panelDuration = 0.95
	}: Props = $props();

	let needsEntryAnim = false;
	let activeSkipFadeIn = false;

	onNavigate((navigation) => {
		if (!navigation.from) return;
		if (navigation.from.url.pathname === navigation.to?.url.pathname) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) return;

		needsEntryAnim = true;
		activeSkipFadeIn = skipFadeIn;
		onPanelUp?.();

		// Anchor scale origin to the visible viewport center
		const scrollY = window.scrollY;
		const vhCenter = scrollY + window.innerHeight / 2;
		gsap.set('.page-wrapper', {
			transformOrigin: `50% ${vhCenter}px`
		});
		gsap.set('.transition-panel', { backgroundColor: panelColor });

		return new Promise<void>((resolve) => {
			const tl = gsap.timeline({
				onComplete: () => {
					if (activeSkipFadeIn) {
						gsap.set('.page-wrapper', {
							scale: 1,
							transformOrigin: 'center center'
						});
					} else {
						gsap.set('.page-wrapper', {
							scale: 1,
							opacity: 0,
							zIndex: 1100,
							transformOrigin: 'center center'
						});
					}
					resolve();
				}
			});

			tl.to(
				'.page-wrapper',
				{ scale: pageScale, duration: outDuration, ease: 'power2.inOut' },
				0
			);

			tl.to(
				'.darken-overlay',
				{
					opacity: darkenOpacity,
					duration: outDuration * darkenDurationRatio,
					ease: 'power2.inOut'
				},
				outDuration * darkenDelayRatio
			);

			tl.to(
				'.transition-panel',
				{ y: '0%', duration: panelDuration, ease: 'panelSilk' },
				outDuration * panelDelayRatio
			);
		});
	});

	afterNavigate(() => {
		if (!needsEntryAnim) return;
		needsEntryAnim = false;
		if (!browser) return;

		if (activeSkipFadeIn) {
			// Hand off to a custom intro/loader on the new page.
			gsap.set('.page-wrapper', { clearProps: 'all' });
			gsap.set('.transition-panel', { y: '100%', clearProps: 'backgroundColor' });
			gsap.set('.darken-overlay', { opacity: 0 });
			activeSkipFadeIn = false;
			onComplete?.();
			return;
		}

		gsap.to('.page-wrapper', {
			opacity: 1,
			duration: fadeInDuration,
			delay: fadeInDelay,
			ease: 'contentFade',
			onStart: () => {
				onFadeInStart?.();
			},
			onComplete: () => {
				gsap.set('.page-wrapper', { clearProps: 'all' });
				gsap.set('.transition-panel', { y: '100%', clearProps: 'backgroundColor' });
				gsap.set('.darken-overlay', { opacity: 0 });
				onComplete?.();
			}
		});
	});
</script>

<div class="transition-bg">
	<div class="page-wrapper">
		{@render children()}
	</div>
</div>

<div class="darken-overlay" aria-hidden="true"></div>
<div class="transition-panel" aria-hidden="true"></div>

<style>
	:global(body) {
		background: black;
	}

	.transition-bg {
		background: black;
		min-height: 100vh;
	}

	.page-wrapper {
		background: var(--color-bg, white);
		min-height: 100vh;
		position: relative;
		will-change: transform, opacity;
	}

	.darken-overlay {
		position: fixed;
		inset: 0;
		background: black;
		opacity: 0;
		z-index: 998;
		pointer-events: none;
		will-change: opacity;
	}

	.transition-panel {
		position: fixed;
		inset: 0;
		background: white;
		transform: translateY(100%);
		z-index: 1000;
		pointer-events: none;
		will-change: transform;
	}
</style>
