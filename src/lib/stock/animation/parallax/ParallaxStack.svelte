<script lang="ts">
	import { onMount } from 'svelte';

	// =========================================================
	// Stock / animation / parallax / ParallaxStack.svelte
	// ---------------------------------------------------------
	// Vertical image-stack parallax modelled after avatr.com's
	// home_para → home_emo → home_sld handoff.
	//
	//   - All layers are pinned in a single ScrollTrigger.
	//   - Previous layer scales slightly (bottom-anchored).
	//   - Next layer is ALREADY full-screen; only its visible
	//     area grows from bottom → top via `clip-path: inset(...)`.
	//
	// Self-contained: depends only on `gsap` + `gsap/ScrollTrigger`
	// (lazy-imported at mount). No project-specific tokens.
	//
	// USAGE
	//   <ParallaxStack
	//     layers={[
	//       { src: '/images/1.jpg', alt: '...' },
	//       { src: '/images/2.jpg', alt: '...' },
	//       { src: '/images/3.jpg', alt: '...' }
	//     ]}
	//   />
	// =========================================================

	export type ParallaxLayer = {
		src: string;
		alt?: string;
	};

	let {
		layers,
		/** How many viewport-heights per transition (scroll distance). */
		transitionDistance = '200%',
		/** How much each previous layer grows (0.18 → 1.0 → 1.18). */
		scaleAmount = 0.18,
		/** Background while images load. */
		background = '#000',
		/** Whether to display debug HUD with progress values. */
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

	onMount(() => {
		if (!containerEl || layerEls.length < 2) return () => {};
		let cleanup: (() => void) | null = null;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			gsap.registerPlugin(ScrollTrigger);

			// Initial states: first layer visible (scale 1), others clipped from top
			layerEls.forEach((el, i) => {
				if (i === 0) {
					gsap.set(el, { scale: 1, transformOrigin: 'bottom center' });
				} else {
					gsap.set(el, { clipPath: 'inset(100% 0 0 0)' });
				}
			});

			const transitions = layers.length - 1;
			const distanceNumeric = parseFloat(transitionDistance);
			const distanceUnit = transitionDistance.replace(/[\d.\s]/g, '') || '%';

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerEl!,
					start: 'top top',
					end: `+=${transitions * distanceNumeric}${distanceUnit}`,
					pin: true,
					scrub: 1,
					anticipatePin: 1,
					onUpdate: (self) => {
						progress = self.progress;
						activeTransition = Math.min(
							transitions - 1,
							Math.floor(self.progress * transitions)
						);
					}
				}
			});

			// Build per-transition tweens
			for (let i = 0; i < transitions; i++) {
				const prevLayer = layerEls[i];
				const nextLayer = layerEls[i + 1];
				if (!prevLayer || !nextLayer) continue;

				tl.to(prevLayer, { scale: 1 + scaleAmount, duration: 1, ease: 'none' }, i);
				tl.to(
					nextLayer,
					{ clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'none' },
					i
				);
			}

			cleanup = () => tl.scrollTrigger?.kill();
		})();

		return () => cleanup?.();
	});
</script>

<section class="ParallaxStack" bind:this={containerEl} style="--bg:{background}">
	<div class="ParallaxStack__stage">
		{#each layers as layer, i (i)}
			<div
				class="ParallaxStack__layer"
				style="z-index: {i + 1}; will-change: {i === 0 ? 'transform' : 'clip-path'};"
				bind:this={layerEls[i]}
			>
				<img src={layer.src} alt={layer.alt ?? ''} />
			</div>
		{/each}

		{#if debug}
			<div class="ParallaxStack__hud">
				<p>progress: {progress.toFixed(3)}</p>
				<p>active transition: {activeTransition} / {layers.length - 2}</p>
				<p>layers: {layers.length}</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.ParallaxStack {
		position: relative;
		width: 100%;
		background: var(--bg, #000);
	}

	.ParallaxStack__stage {
		position: relative;
		height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
	}

	.ParallaxStack__layer {
		position: absolute;
		inset: 0;
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
