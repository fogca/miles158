<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	// =========================================================
	// Stock / animation / page-transition / PageTransition.svelte
	// ---------------------------------------------------------
	// Per-route overlay reveal modelled after jasminegunarto.com
	// (Taxi.js style transitions):
	//
	//   - Before navigation: full-screen overlay clip-reveals down → up
	//     while the route's label letters stagger into view
	//   - After navigation:  overlay clip-collapses up → off, letters
	//     stagger out
	//
	// USAGE
	//   <PageTransition
	//     types={{
	//       home:      { label: 'MILES 158', bg: '#000a26', fg: '#e8f4f8' },
	//       about:     { label: 'ABOUT' },
	//       rental:    { label: 'CAR RENTAL' },
	//       community: { label: 'CLUB COMMUNITY' }
	//     }}
	//   />
	//
	// Drop it once in +layout.svelte, after the main content.
	// =========================================================

	export type TransitionConfig = {
		label: string;
		bg?: string;
		fg?: string;
	};

	let {
		types = {},
		defaultBg = '#000a26',
		defaultFg = '#e8f4f8',
		duration = 0.7
	}: {
		types?: Record<string, TransitionConfig>;
		defaultBg?: string;
		defaultFg?: string;
		duration?: number;
	} = $props();

	let overlayEl = $state<HTMLElement | null>(null);
	let labelEl = $state<HTMLElement | null>(null);
	let currentLabel = $state('');
	let currentBg = $state(defaultBg);
	let currentFg = $state(defaultFg);
	let gsapModule: typeof import('gsap') | null = null;

	function pathToType(path: string): string {
		if (path === '/' || path === '') return 'home';
		const first = path.replace(/^\/+/, '').split('/')[0] || 'home';
		return first;
	}

	function configFor(path: string): TransitionConfig {
		const type = pathToType(path);
		return (
			types[type] ?? {
				label: type.toUpperCase(),
				bg: defaultBg,
				fg: defaultFg
			}
		);
	}

	async function ensureGsap() {
		if (!gsapModule) {
			gsapModule = await import('gsap');
		}
		return gsapModule!.gsap;
	}

	beforeNavigate(async (nav) => {
		if (!nav.to || typeof window === 'undefined') return;
		const cfg = configFor(nav.to.url.pathname);
		currentLabel = cfg.label;
		currentBg = cfg.bg ?? defaultBg;
		currentFg = cfg.fg ?? defaultFg;
		await tick();

		const gsap = await ensureGsap();
		if (!overlayEl || !labelEl) return;

		gsap.set(overlayEl, { clipPath: 'inset(0 0 100% 0)', pointerEvents: 'auto' });
		gsap.set(labelEl, { y: 60, opacity: 0 });

		gsap.to(overlayEl, {
			clipPath: 'inset(0 0 0 0)',
			duration,
			ease: 'expo.inOut'
		});
		gsap.to(labelEl, {
			y: 0,
			opacity: 1,
			duration: duration * 0.7,
			delay: duration * 0.3,
			ease: 'power3.out'
		});
	});

	afterNavigate(async () => {
		if (typeof window === 'undefined') return;
		const gsap = await ensureGsap();
		if (!overlayEl || !labelEl) return;

		gsap.to(labelEl, {
			y: -60,
			opacity: 0,
			duration: duration * 0.5,
			ease: 'power3.in'
		});
		gsap.to(overlayEl, {
			clipPath: 'inset(100% 0 0 0)',
			duration,
			delay: duration * 0.25,
			ease: 'expo.inOut',
			onComplete: () => {
				if (overlayEl) overlayEl.style.pointerEvents = 'none';
			}
		});
	});

	onMount(() => {
		if (overlayEl) {
			overlayEl.style.clipPath = 'inset(100% 0 0 0)';
			overlayEl.style.pointerEvents = 'none';
		}
	});
</script>

<div
	class="PageTransition"
	style="--pt-bg:{currentBg};--pt-fg:{currentFg};"
	bind:this={overlayEl}
	aria-hidden="true"
>
	<span class="PageTransition__label" bind:this={labelEl}>{currentLabel}</span>
</div>

<style>
	.PageTransition {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: var(--pt-bg, #000);
		color: var(--pt-fg, #fff);
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		will-change: clip-path;
	}

	.PageTransition__label {
		font-size: clamp(2.2rem, 9vw, 6.5rem);
		font-weight: 400;
		letter-spacing: 0;
		line-height: 1;
		color: var(--pt-fg, #fff);
		font-family: inherit;
		will-change: transform, opacity;
	}
</style>
