<script lang="ts">
	import { onMount } from 'svelte';
	import { conceptParallax } from '$lib/data/content';

	// Pinned section — single ScrollTrigger spanning:
	//   Vis1 (image1 rises + grows)
	//   → Vis2 (image2 clip-path reveals + text/CTA fade in)
	// The handoff into StorySlider is performed by StorySlider's own entry
	// trigger, which is keyed off THIS section's bottom — so there is no gap
	// and no extra image layer required.

	let containerEl = $state<HTMLElement | null>(null);
	let textEls = $state<HTMLElement[]>([]);
	let image1El = $state<HTMLElement | null>(null);
	let image2El = $state<HTMLElement | null>(null);
	let titleEl = $state<HTMLElement | null>(null);
	let ctaEl = $state<HTMLElement | null>(null);
	let isImagePhase = $state(false);

	const texts = conceptParallax.texts;
	const vis2Image = conceptParallax.vis2Image;

	onMount(() => {
		if (!containerEl) return () => {};

		let cleanup: (() => void) | null = null;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			gsap.registerPlugin(ScrollTrigger);

			// Initial states
			gsap.set(textEls, { opacity: 0, y: 40 });
			gsap.set(image1El, {
				yPercent: 100,
				scale: 0.32,
				opacity: 0,
				transformOrigin: 'bottom center'
			});
			gsap.set(image2El, {
				clipPath: 'inset(100% 0 0 0)',
				transformOrigin: 'bottom center'
			});
			gsap.set([titleEl, ctaEl], { opacity: 0, y: 30 });

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerEl!,
					start: 'top top',
					end: '+=' + (texts.length + 5) * 100 + '%',
					pin: true,
					scrub: 1,
					anticipatePin: 1,
					onUpdate: (self) => {
						// Texts occupy roughly the first 55% of the pin; switch
						// the header to "light on dark" mode once we're past them.
						const next = self.progress > 0.55;
						if (next !== isImagePhase) isImagePhase = next;
					}
				}
			});

			// 1) Texts fade in / out
			texts.forEach((_, i) => {
				tl.to(textEls[i], { opacity: 1, y: 0, duration: 0.6 }, '+=0.1');
				tl.to(textEls[i], { opacity: 0, y: -30, duration: 0.5 }, '+=0.5');
			});

			// 2) Vis1: image-1 rises from below while growing to 100vw × 100vh
			tl.to(image1El, { opacity: 1, duration: 0.2 }, '-=0.2');
			tl.to(
				image1El,
				{ yPercent: 0, scale: 1, duration: 1.6, ease: 'power2.out' },
				'-=0.15'
			);

			// 3) Vis1 → Vis2: image-1 scales up, image-2 clip-path reveals
			tl.to(image1El, { scale: 1.18, duration: 1.0, ease: 'none' });
			tl.to(image2El, { clipPath: 'inset(0% 0 0 0)', duration: 1.0, ease: 'none' }, '<');

			// 4) Vis2 content fades in (title + CTA)
			tl.to(titleEl, { opacity: 1, y: 0, duration: 0.6 }, '+=0.3');
			tl.to(ctaEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');

			// 5) Hold while Vis2 is on screen. Pin then releases — StorySlider's
			//    own entry trigger (keyed off this section's bottom) takes over.
			tl.to({}, { duration: 0.6 });

			cleanup = () => tl.scrollTrigger?.kill();
		})();

		return () => cleanup?.();
	});
</script>

<section
	class="cpara"
	data-dark-section={isImagePhase ? '' : undefined}
	bind:this={containerEl}
>
	<div class="stage">
		<div class="texts" lang="ja">
			{#each texts as text, i (i)}
				<h3 class="text" bind:this={textEls[i]}>{@html text}</h3>
			{/each}
		</div>

		<div class="layer layer-1" bind:this={image1El}>
			<img src={conceptParallax.image} alt="" loading="lazy" />
		</div>

		<div class="layer layer-2" bind:this={image2El}>
			<img src={vis2Image} alt="" loading="lazy" />
			<div class="layer-2__overlay"></div>
		</div>

		<div class="cta">
			<h2 class="cta__title" lang="ja" bind:this={titleEl}>
				さぁ、カーレンタルで<br class="sp-br" />旅にでよう。
			</h2>
			<a href="/rental" class="btn-outline" bind:this={ctaEl}>詳しく見る</a>
		</div>
	</div>
</section>

<style>
	.cpara {
		position: relative;
		width: 100%;
		background: #ffffff;
		color: #000a26;
	}

	.stage {
		position: relative;
		height: 100vh;
		min-height: 100dvh;
		width: 100%;
		overflow: hidden;
	}

	.texts {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 0 6vw;
		z-index: 6;
		pointer-events: none;
	}

	.text {
		position: absolute;
		font-size: clamp(1.2rem, 2.2vw, 2rem);
		font-weight: 400;
		line-height: 1.7;
		max-width: 32ch;
		margin: 0;
		color: #000a26;
	}

	.text :global(br.sp-br) {
		display: none;
	}
	@media (max-width: 767px) {
		.text :global(br.sp-br) {
			display: inline;
		}
	}

	.layer {
		position: absolute;
		inset: 0;
		will-change: transform, clip-path;
	}

	.layer img {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		display: block;
	}

	.layer-1 {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		z-index: 1;
	}

	.layer-2 {
		z-index: 2;
	}

	.layer-2__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(0, 10, 38, 0.2) 0%, rgba(0, 10, 38, 0.55) 100%);
		pointer-events: none;
	}

	.cta {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: var(--space-5);
		padding: 0 var(--padding);
		z-index: 5;
		color: var(--c-sky);
		pointer-events: none;
	}

	.cta :global(*) {
		pointer-events: auto;
	}

	.cta__title {
		font-size: var(--fs-h2);
		margin: 0;
		color: var(--c-sky);
		max-width: 22ch;
		line-height: 1.5;
	}

	.cta__title :global(br.sp-br) {
		display: none;
	}
	@media (max-width: 767px) {
		.cta__title :global(br.sp-br) {
			display: inline;
		}
	}
</style>
