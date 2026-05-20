<script lang="ts">
	import HeroTop from '$lib/components/HeroTop.svelte';
	import ConceptParallax from '$lib/components/ConceptParallax.svelte';
	import StorySlider from '$lib/components/StorySlider.svelte';
	import { serviceSlides, cars, place } from '$lib/data/content';
</script>

<main class="home">
	<HeroTop />

	<ConceptParallax />

	<StorySlider slides={serviceSlides} />

	<section class="cars section">
		<div class="container">
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
		<div class="container">
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
		aspect-ratio: 16 / 10;
		background: rgba(0, 10, 38, 0.05);
		border-radius: 4px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.car-image img {
		width: 100%;
		height: 100%;
		object-fit: contain;
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
