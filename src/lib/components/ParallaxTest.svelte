<script lang="ts">
	import { onMount } from 'svelte';

	// Analysis of avatr's home_para → home_emo → home_sld handoff:
	//   - prev image stays in place, only scales slightly larger (bottom-anchored)
	//   - next image is ALREADY positioned full-screen, only its VISIBLE area grows
	//     from the bottom up — implemented with a `clip-path: inset(top% 0 0 0)`
	//     reveal, NOT by translating the image.
	//   - The two motions happen during the same pinned segment.

	let {
		prevSrc = '/images/car_10.png',
		nextSrc = '/images/LC500.png'
	}: { prevSrc?: string; nextSrc?: string } = $props();

	let containerEl = $state<HTMLElement | null>(null);
	let prevEl = $state<HTMLElement | null>(null);
	let nextEl = $state<HTMLElement | null>(null);
	let progress = $state(0);

	onMount(() => {
		if (!containerEl || !prevEl || !nextEl) return () => {};
		let cleanup: (() => void) | null = null;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);
			gsap.registerPlugin(ScrollTrigger);

			gsap.set(prevEl!, { scale: 1, transformOrigin: 'bottom center' });
			gsap.set(nextEl!, { clipPath: 'inset(100% 0 0 0)' });

			const trigger = ScrollTrigger.create({
				trigger: containerEl!,
				start: 'top top',
				end: '+=200%',
				pin: true,
				scrub: 1,
				onUpdate: (self) => {
					progress = self.progress;
					gsap.set(prevEl!, { scale: 1 + self.progress * 0.18 });
					gsap.set(nextEl!, {
						clipPath: `inset(${(1 - self.progress) * 100}% 0 0 0)`
					});
				}
			});

			cleanup = () => trigger.kill();
		})();

		return () => cleanup?.();
	});
</script>

<section class="ptest" bind:this={containerEl}>
	<div class="stage">
		<div class="img prev" bind:this={prevEl}>
			<img src={prevSrc} alt="" />
		</div>

		<div class="img next" bind:this={nextEl}>
			<img src={nextSrc} alt="" />
		</div>

		<div class="hud">
			<p>progress: {progress.toFixed(2)}</p>
			<p>prev scale: {(1 + progress * 0.18).toFixed(3)}</p>
			<p>next clip-top: {((1 - progress) * 100).toFixed(0)}%</p>
		</div>
	</div>
</section>

<style>
	.ptest {
		position: relative;
		width: 100%;
		background: #000a26;
	}

	.stage {
		position: relative;
		height: 100vh;
		min-height: 100dvh;
		overflow: hidden;
	}

	.img {
		position: absolute;
		inset: 0;
	}

	.img img {
		width: 100vw;
		height: 100vh;
		object-fit: cover;
		display: block;
	}

	.prev {
		z-index: 1;
		will-change: transform;
	}

	.next {
		z-index: 2;
		will-change: clip-path;
	}

	.hud {
		position: absolute;
		bottom: var(--space-5);
		left: var(--space-5);
		z-index: 10;
		color: var(--c-sky);
		font-family: var(--font-en);
		font-size: var(--fs-h6);
		background: rgba(0, 10, 38, 0.55);
		backdrop-filter: blur(12px);
		padding: var(--space-3) var(--space-4);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-variant-numeric: tabular-nums;
	}

	.hud p {
		margin: 0;
		color: var(--c-sky);
	}
</style>
