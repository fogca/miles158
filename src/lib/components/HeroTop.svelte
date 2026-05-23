<script lang="ts">
	import { onMount } from 'svelte';
	import { hero } from '$lib/data/content';
	import LogoMain from './LogoMain.svelte';

	let curtainEl = $state<HTMLElement | null>(null);
	let bgEl = $state<HTMLElement | null>(null);
	let headerEl = $state<HTMLElement | null>(null);
	let bottomEl = $state<HTMLElement | null>(null);

	onMount(() => {
		if (!curtainEl || !bgEl || !headerEl || !bottomEl) return () => {};

		let cleanup: (() => void) | null = null;

		// Lock scroll during the opening animation. Premature scrolling races
		// ScrollTrigger / Lenis calibration → sections appear in the wrong order.
		// We also lock native body scroll for extra safety.
		const lenisInstance = (window as Window & {
			__lenis?: { stop: () => void; start: () => void };
		}).__lenis;

		lenisInstance?.stop();
		const prevOverflow = document.body.style.overflow;
		const prevHtmlOverflow = document.documentElement.style.overflow;
		document.body.style.overflow = 'hidden';
		document.documentElement.style.overflow = 'hidden';

		// Block wheel / touch events that would otherwise queue up while Lenis
		// is stopped, then dump into scroll the instant we unlock.
		const blockEvent = (e: Event) => {
			e.preventDefault();
		};
		window.addEventListener('wheel', blockEvent, { passive: false });
		window.addEventListener('touchmove', blockEvent, { passive: false });

		const unlockScroll = () => {
			window.removeEventListener('wheel', blockEvent);
			window.removeEventListener('touchmove', blockEvent);
			document.body.style.overflow = prevOverflow;
			document.documentElement.style.overflow = prevHtmlOverflow;
			lenisInstance?.start();
		};

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);

			// Initial: white curtain covers everything, bg is slightly over-scaled
			// (Apple-style subtle "Ken Burns" zoom-out reveal), content invisible
			gsap.set(curtainEl, { yPercent: 0 });
			gsap.set(bgEl, { scale: 1.08, opacity: 0, filter: 'blur(6px)' });
			gsap.set([headerEl, bottomEl], { opacity: 0, y: 28 });

			const tl = gsap.timeline({
				delay: 0.2,
				onComplete: () => {
					unlockScroll();
					// Refresh on the *next-next* frame, after Lenis has had a tick
					// to re-sync its internal scroll value. Same-frame refresh
					// races Lenis.start() and yields the wrong scrollTop.
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							ScrollTrigger.refresh(true);
						});
					});
				}
			});

			// 1) Curtain slides upward with expo easing — feels like a stage curtain
			tl.to(curtainEl, { yPercent: -100, duration: 1.4, ease: 'expo.inOut' });

			// 2) Bg image fades in beneath the curtain, then settles from a soft
			//    blurred over-scale to neutral over a longer ease — quietly cinematic
			tl.to(bgEl, { opacity: 1, duration: 0.9, ease: 'power2.out' }, '<0.15');
			tl.to(
				bgEl,
				{ scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'power3.out' },
				'<'
			);

			// 3) Header + bottom rise into place with gentle stagger
			tl.to(
				[headerEl, bottomEl],
				{ opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', stagger: 0.18 },
				'-=1.4'
			);

			cleanup = () => {
				tl.kill();
				// Make sure we don't leave scroll locked if the page is destroyed mid-animation
				unlockScroll();
			};
		})();

		return () => cleanup?.();
	});
</script>

<section class="hero" data-dark-section>
	<div class="hero-curtain" bind:this={curtainEl}></div>

	<div class="hero-bg" bind:this={bgEl}>
		<img src={hero.bgImage} alt="" loading="eager" />
	</div>
	<div class="hero-gradient"></div>

	<header class="hero-header" bind:this={headerEl}>
		<h1 class="hero-brand">
			<LogoMain width="100%" title={hero.brand} />
		</h1>
		<p class="hero-services" lang="ja">{hero.services}</p>
	</header>

	<div class="hero-bottom" bind:this={bottomEl}>
		<h2 class="hero-bigtitle">
			{#each hero.bigTitle as line, i (i)}
				<span class="line">{line}</span>
			{/each}
		</h2>
		<p class="hero-lead" lang="ja">
			{#each hero.leadJa as line, i (i)}
				<span class="line-ja">{line}</span><br />
			{/each}
		</p>
		<button type="button" class="btn-outline btn-outline--sm">{hero.ctaLabel}</button>
	</div>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100vh;
		min-height: 100dvh;
		width: 100%;
		overflow: hidden;
		color: #fff;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: clamp(40px, 8vh, 96px) 0 clamp(40px, 8vh, 72px) 0;
	}

	.hero-curtain {
		position: absolute;
		inset: 0;
		background: #ffffff;
		z-index: 10;
		pointer-events: none;
	}

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
		will-change: opacity;
	}

	.hero-bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.hero-gradient {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			rgba(0, 10, 38, 0) 0%,
			rgba(0, 10, 38, 0) 55%,
			rgba(0, 10, 38, 0.25) 80%,
			rgba(0, 10, 38, 0.6) 100%
		);
		z-index: 1;
	}

	.hero-header,
	.hero-bottom {
		position: relative;
		z-index: 2;
		padding-inline: var(--padding);
	}

	.hero-bottom {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
	}

	.hero-bottom .btn-outline {
		align-self: flex-start;
	}

	.hero-brand {
		display: block;
		width: clamp(280px, 50vw, 560px);
		margin: 0 0 18px 0;
		color: #ffffff;
		line-height: 0;
	}

	.hero-services {
		font-size: var(--fs-h6);
		opacity: 0.92;
		margin: 0;
		color: #e8f4f8;
	}

	.hero-bigtitle {
		font-size: var(--fs-h1);
		font-weight: 400;
		line-height: 1;
		margin: 0 0 var(--space-4) 0;
		text-transform: uppercase;
	}

	.hero-bigtitle .line {
		display: block;
	}

	.hero-lead {
		font-size: var(--fs-h5);
		line-height: 1.75;
		margin: 0 0 2rem 0;
		opacity: 0.95;
		color: #f8f9fa;
	}

	.hero-lead .line-ja {
		display: inline;
	}
</style>
