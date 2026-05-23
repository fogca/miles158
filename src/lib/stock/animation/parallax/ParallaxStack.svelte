<script lang="ts">
	import { onMount } from 'svelte';

	// =========================================================
	// Stock / animation / parallax / ParallaxStack.svelte
	// ---------------------------------------------------------
	// Vertical image-stack parallax modelled after avatr.com's
	// home_para → home_emo → home_sld handoff.
	//
	//   - Native Lenis-style implementation: `position: sticky`
	//     stage + self-computed scroll progress + manual transforms.
	//   - No GSAP ScrollTrigger pin (avoids the well-documented
	//     Lenis × ScrollTrigger race conditions on hard reload).
	//   - Same-tick rect → progress → transform in a single
	//     synchronous handler keeps every layer in sync.
	//
	//   For each transition between consecutive layers:
	//     - Previous layer scales 1 → 1 + scaleAmount (bottom-anchored)
	//     - Next layer clip-reveals inset(100% → 0)
	//
	// USAGE
	//   <ParallaxStack
	//     layers={[
	//       { src: '/images/1.jpg' },
	//       { src: '/images/2.jpg' },
	//       { src: '/images/3.jpg' }
	//     ]}
	//   />
	// =========================================================

	export type ParallaxLayer = {
		src: string;
		alt?: string;
	};

	let {
		layers,
		/** Viewport-heights per transition. e.g. '200%' = 2 viewport heights of scroll per transition. */
		transitionDistance = '200%',
		/** How much the previous layer grows during its transition. */
		scaleAmount = 0.18,
		/** Background color while images load. */
		background = '#000',
		/** HUD with progress values for debugging. */
		debug = false
	}: {
		layers: ParallaxLayer[];
		transitionDistance?: string;
		scaleAmount?: number;
		background?: string;
		debug?: boolean;
	} = $props();

	let containerEl = $state<HTMLElement | null>(null);
	let layerEls = $state<HTMLElement[]>([]);
	let progress = $state(0);
	let activeTransition = $state(0);

	const transitionVh = parseFloat(transitionDistance) || 200;
	const transitions = Math.max(1, layers.length - 1);
	const totalHeightVh = transitions * transitionVh + 100;

	function update() {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const vh = window.innerHeight;
		const total = containerEl.offsetHeight - vh;
		const scrolled = Math.max(0, Math.min(total, -rect.top));
		const p = total > 0 ? scrolled / total : 0;
		progress = p;

		const segmentSize = 1 / transitions;
		const idx = Math.min(transitions - 1, Math.floor(p * transitions));
		const localProgress = (p - idx * segmentSize) / segmentSize;
		activeTransition = idx;

		// Apply transforms to each layer
		layerEls.forEach((el, i) => {
			if (!el) return;

			// "prev" layer = i; "next" layer = i + 1 in current transition (idx)
			if (i < idx) {
				// Already fully transitioned (clip open, scale at max)
				el.style.clipPath = i === 0 ? '' : 'inset(0 0 0 0)';
				el.style.transform = `scale(${1 + scaleAmount})`;
			} else if (i === idx) {
				// Active "prev": scaling up
				el.style.clipPath = i === 0 ? '' : 'inset(0 0 0 0)';
				el.style.transform = `scale(${1 + localProgress * scaleAmount})`;
			} else if (i === idx + 1) {
				// Active "next": clip revealing
				el.style.clipPath = `inset(${(1 - localProgress) * 100}% 0 0 0)`;
				el.style.transform = 'scale(1)';
			} else {
				// Not yet revealed
				el.style.clipPath = 'inset(100% 0 0 0)';
				el.style.transform = 'scale(1)';
			}
		});
	}

	onMount(() => {
		if (!containerEl || layerEls.length < 2) return () => {};

		// Initial state
		layerEls.forEach((el, i) => {
			if (!el) return;
			if (i === 0) {
				el.style.transform = 'scale(1)';
				el.style.clipPath = '';
			} else {
				el.style.clipPath = 'inset(100% 0 0 0)';
				el.style.transform = 'scale(1)';
			}
		});

		type LenisLike = {
			on: (event: string, fn: (...args: unknown[]) => void) => void;
			off: (event: string, fn: (...args: unknown[]) => void) => void;
		};
		const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;

		if (lenis) {
			lenis.on('scroll', update);
		} else {
			window.addEventListener('scroll', update, { passive: true });
		}
		window.addEventListener('resize', update);
		update();

		return () => {
			if (lenis) lenis.off('scroll', update);
			else window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});
</script>

<section
	class="ParallaxStack"
	bind:this={containerEl}
	style="--bg:{background}; height: {totalHeightVh}vh;"
>
	<div class="ParallaxStack__sticky">
		<div class="ParallaxStack__stage">
			{#each layers as layer, i (i)}
				<div
					class="ParallaxStack__layer"
					style="z-index: {i + 1};"
					bind:this={layerEls[i]}
				>
					<img src={layer.src} alt={layer.alt ?? ''} />
				</div>
			{/each}

			{#if debug}
				<div class="ParallaxStack__hud">
					<p>progress: {progress.toFixed(3)}</p>
					<p>active transition: {activeTransition} / {transitions - 1}</p>
					<p>layers: {layers.length}</p>
					<p>total: {totalHeightVh}vh</p>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.ParallaxStack {
		position: relative;
		width: 100%;
		background: var(--bg, #000);
	}

	.ParallaxStack__sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		min-height: 100dvh;
	}

	.ParallaxStack__stage {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.ParallaxStack__layer {
		position: absolute;
		inset: 0;
		transform-origin: bottom center;
		will-change: transform, clip-path;
	}

	.ParallaxStack__layer img {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		display: block;
	}

	.ParallaxStack__hud {
		position: absolute;
		bottom: 24px;
		left: 24px;
		z-index: 999;
		color: #fff;
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 12px;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(12px);
		padding: 12px 16px;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}

	.ParallaxStack__hud p {
		margin: 0;
		color: #fff;
	}
</style>
