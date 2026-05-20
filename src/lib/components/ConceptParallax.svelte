<script lang="ts">
	import { onMount } from 'svelte';
	import { conceptParallax } from '$lib/data/content';

	// Mirrors avatr.com's `.home_para` — sequential text reveal followed by image scaling up.

	let containerEl = $state<HTMLElement | null>(null);
	let textEls = $state<HTMLElement[]>([]);
	let imageWrapEl = $state<HTMLElement | null>(null);

	const texts = [...conceptParallax.texts, conceptParallax.finalText];

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
			gsap.set(imageWrapEl, { scale: 0.35, opacity: 0 });

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerEl,
					start: 'top top',
					end: '+=' + (texts.length + 2) * 100 + '%',
					pin: true,
					scrub: 1,
					anticipatePin: 1
				}
			});

			// Each text fades in then out, with overlap on the next
			texts.forEach((_, i) => {
				const isLast = i === texts.length - 1;
				tl.to(textEls[i], { opacity: 1, y: 0, duration: 0.6 }, '+=0.1');
				if (!isLast) {
					tl.to(textEls[i], { opacity: 0, y: -30, duration: 0.5 }, '+=0.5');
				} else {
					// Last text stays a bit longer
					tl.to({}, { duration: 0.3 });
				}
			});

			// Final image: scale up dramatically
			tl.to(imageWrapEl, { opacity: 1, duration: 0.4 }, '-=0.3');
			tl.to(imageWrapEl, { scale: 1.0, duration: 1.2, ease: 'power2.inOut' }, '-=0.2');
			// Push further to overshoot before transitioning to next section
			tl.to(imageWrapEl, { scale: 1.15, duration: 0.6, ease: 'power1.in' });

			cleanup = () => tl.scrollTrigger?.kill();
		})();

		return () => cleanup?.();
	});
</script>

<section class="cpara" bind:this={containerEl}>
	<div class="stage">
		<div class="texts" lang="ja">
			{#each texts as text, i (i)}
				<h3 class="text" bind:this={textEls[i]}>{text}</h3>
			{/each}
		</div>

		<div class="image-wrap" bind:this={imageWrapEl}>
			<img src={conceptParallax.image} alt="" loading="lazy" />
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
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
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
		z-index: 2;
		pointer-events: none;
	}

	.text {
		position: absolute;
		font-size: clamp(1.2rem, 2.2vw, 2rem);
		font-weight: 400;
		line-height: 1.7;
		max-width: 24ch;
		margin: 0;
		color: #000a26;
	}

	.image-wrap {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
		transform-origin: center center;
	}

	.image-wrap img {
		width: min(80%, 800px);
		aspect-ratio: 16 / 10;
		object-fit: cover;
		display: block;
	}
</style>
