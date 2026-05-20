<script lang="ts">
	import { onMount } from 'svelte';

	let containerEl = $state<HTMLElement | null>(null);
	let bgEl = $state<HTMLElement | null>(null);
	let titleEl = $state<HTMLElement | null>(null);
	let ctaEl = $state<HTMLElement | null>(null);

	onMount(() => {
		if (!containerEl || !bgEl || !titleEl || !ctaEl) return () => {};

		let cleanup: (() => void) | null = null;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			gsap.registerPlugin(ScrollTrigger);

			// Initial: bg image hidden below the viewport, text invisible
			gsap.set(bgEl, { yPercent: 100 });
			gsap.set([titleEl, ctaEl], { opacity: 0, y: 30 });

			// As the section approaches from below, slide the bg image up so it
			// "rises over" the previous section — mirrors avatr's home_para → home_emo
			ScrollTrigger.create({
				trigger: containerEl!,
				start: 'top bottom',
				end: 'top top',
				scrub: true,
				onUpdate: (self) => {
					gsap.set(bgEl!, { yPercent: 100 - self.progress * 100 });
				}
			});

			// Pin the section and reveal text + CTA on scroll
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerEl!,
					start: 'top top',
					end: '+=150%',
					pin: true,
					scrub: 1,
					anticipatePin: 1
				}
			});

			tl.to(titleEl, { opacity: 1, y: 0, duration: 0.6 }, '+=0.3');
			tl.to(ctaEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
			tl.to({}, { duration: 0.4 });

			// Exit parallax — bg scales upward (bottom-anchored) so the next
			// section's image visually "rises over" this one (emo → sld style)
			const exitTrigger = ScrollTrigger.create({
				trigger: containerEl!,
				start: 'bottom bottom',
				end: 'bottom top',
				scrub: true,
				onUpdate: (self) => {
					gsap.set(bgEl!, { scale: 1 + self.progress * 0.18 });
				}
			});

			cleanup = () => {
				tl.scrollTrigger?.kill();
				exitTrigger.kill();
			};
		})();

		return () => cleanup?.();
	});
</script>

<section class="cv2" data-dark-section bind:this={containerEl}>
	<div class="cv2__bg" bind:this={bgEl}>
		<img src="/images/LC500.png" alt="" loading="lazy" />
	</div>
	<div class="cv2__overlay"></div>
	<div class="cv2__inner">
		<h2 class="cv2__title" lang="ja" bind:this={titleEl}>
			さぁ、カーレンタルで<br class="sp-br" />旅にでよう。
		</h2>
		<a href="/rental" class="btn-outline" bind:this={ctaEl}>詳しく見る</a>
	</div>
</section>

<style>
	.cv2 {
		position: relative;
		width: 100%;
		height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
		color: var(--c-sky);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cv2__bg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transform-origin: bottom center;
		will-change: transform;
	}

	.cv2__bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.cv2__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(0, 10, 38, 0.2) 0%, rgba(0, 10, 38, 0.55) 100%);
		z-index: 1;
	}

	.cv2__inner {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-5);
		padding: 0 var(--padding);
		text-align: center;
	}

	.cv2__title {
		font-size: var(--fs-h2);
		margin: 0;
		color: var(--c-sky);
		max-width: 22ch;
		line-height: 1.5;
	}

	.cv2__title :global(br.sp-br) {
		display: none;
	}
	@media (max-width: 767px) {
		.cv2__title :global(br.sp-br) {
			display: inline;
		}
	}
</style>
