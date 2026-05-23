<script lang="ts">
	import { onMount } from 'svelte';
	import ConceptParallax from '$lib/components/ConceptParallax.svelte';
	import StorySlider from '$lib/components/StorySlider.svelte';
	import ScrollVideo from '$lib/stock/animation/scroll-video/ScrollVideo.svelte';
	import LogoMain from '$lib/components/LogoMain.svelte';
	import { hero, serviceSlides, cars, place } from '$lib/data/content';

	// Initial fade-in for the center logo on first paint.
	// After this finishes we hand opacity control over to scroll progress.
	let introFade = $state(0);
	let introDone = $state(false);

	onMount(() => {
		const start = performance.now();
		const duration = 2200;
		const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
		const tick = () => {
			const elapsed = performance.now() - start;
			const t = Math.min(1, elapsed / duration);
			introFade = easeOut(t);
			if (t < 1) requestAnimationFrame(tick);
			else introDone = true;
		};
		requestAnimationFrame(tick);
	});
</script>

<svelte:head>
	<title>MILES 158 — Car Service Brand · Nagoya</title>
</svelte:head>

<main class="home">
	<ScrollVideo
		src="/images/hero_1_scrub.mp4"
		poster="/images/hero_1_poster.jpg"
		scrollDistance="300%"
		overlay
	>
		{#snippet children({ progress })}
			{@const centerOpacity = introDone
				? Math.max(0, 1 - progress * 12)
				: introFade}

			<div
				class="hero-center"
				style="opacity: {centerOpacity};"
			>
				<LogoMain width="100%" title={hero.brand} />
			</div>

			{@const enter = Math.max(0, Math.min(1, (progress - 0.15) * 2))}
			<div
				class="hero-content"
				style="opacity: {enter}; transform: translateY({(1 - enter) * 30}px);"
			>
				<div class="hero-content__bottom">
					<h2 class="hero-content__bigtitle">
						{#each hero.bigTitle as line, i (i)}
							<span class="line">{line}</span>
						{/each}
					</h2>
					<p class="hero-content__lead" lang="ja">
						{#each hero.leadJa as line, i (i)}
							<span>{line}</span><br />
						{/each}
					</p>
					<a href="/about" class="btn-outline btn-outline--sm">{hero.ctaLabel}</a>
				</div>
			</div>
		{/snippet}
	</ScrollVideo>

	<ConceptParallax />

	<StorySlider slides={serviceSlides} />

	<section class="cars section">
		<div class="section-inner">
			<h2 class="section-title">Cars</h2>
			<p class="cars-lead" lang="ja">
				厳選された Lexus を中心に、走る喜びを最大化する2台をご用意しています。
			</p>
			<div class="cars-grid">
				{#each cars as car (car.id)}
					<article class="car-card">
						<div class="car-image">
							<img src={car.image} alt={car.name} loading="lazy" />
						</div>
						<div class="car-meta">
							<h3>{car.name}</h3>
							<p>{car.subtitle}</p>
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="place section">
		<div class="section-inner">
			<h2 class="section-title">Place</h2>
			<p class="place-address" lang="ja">
				{place.address}<br />
				{place.roadHint}
			</p>
			<div class="place-map">
				<img src={place.mapImage} alt="MILES 158 location map" loading="lazy" />
			</div>
		</div>
	</section>
</main>

<style>
	.section-inner {
		padding-inline: var(--padding);
	}

	/* Center logo — first thing visible, scroll-driven fade-out.
	   Mobile keeps its assertive size; PC ceiling tightened so the logo no
	   longer overpowers the hero video on wide screens. */
	.hero-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: clamp(260px, 36vw, 340px);
		color: #fff;
		line-height: 0;
		will-change: opacity;
		pointer-events: none;
	}

	/* Hero overlay rendered on top of ScrollVideo */
	.hero-content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: clamp(40px, 8vh, 96px) var(--padding) clamp(40px, 8vh, 72px);
		color: #fff;
		will-change: opacity, transform;
	}

	.hero-content__bottom {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		text-align: left;
		gap: var(--space-4);
	}

	.hero-content__bigtitle {
		font-size: var(--fs-h1);
		font-weight: 400;
		line-height: 1;
		margin: 0;
		text-transform: uppercase;
	}

	.hero-content__bigtitle .line {
		display: block;
	}

	.hero-content__lead {
		font-size: var(--fs-h5);
		line-height: 1.75;
		margin: 0;
		opacity: 0.95;
	}

	.cars,
	.place {
		background: var(--c-white);
	}

	.cars-lead {
		max-width: 60ch;
		opacity: 0.8;
		margin-bottom: var(--space-7);
	}

	.cars-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--space-7);
	}

	.car-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.car-image {
		aspect-ratio: 1 / 1;
		border-radius: 4px;
		overflow: hidden;
	}

	.car-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.car-meta h3 {
		margin: 0 0 0.4em 0;
	}

	.car-meta p {
		opacity: 0.65;
		margin: 0;
	}

	.place-address {
		font-size: var(--fs-h3);
		margin-bottom: var(--space-7);
		opacity: 0.85;
	}

	.place-map {
		aspect-ratio: 21 / 9;
		background: rgba(0, 10, 38, 0.05);
		border-radius: 4px;
		overflow: hidden;
	}

	.place-map img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
