<script lang="ts">
	import { services } from '$lib/data/content';
	const service = services.find((s) => s.id === 'rental')!;
</script>

<svelte:head>
	<title>Car Rental — MILES 158</title>
</svelte:head>

<main class="page">
	<section class="hero section">
		<div class="container">
			<h1 class="section-title">Car Rental</h1>
			<p class="lead" lang="ja">{service.description}</p>
		</div>
	</section>

	<section class="placeholder section">
		<div class="container">
			<p lang="ja">※ 取扱車両 / 料金 / 利用フロー の詳細はこのページに追加予定。</p>
		</div>
	</section>
</main>

<style>
	.hero {
		min-height: 60vh;
		display: flex;
		align-items: center;
		padding-top: calc(var(--space-11) + var(--space-5));
	}
	.lead {
		max-width: 60ch;
		font-size: clamp(1rem, 1.3vw, 1.15rem);
		line-height: 1.85;
		opacity: 0.85;
		margin-top: 2rem;
	}
	.placeholder p {
		opacity: 0.5;
		font-size: 13px;
	}
</style>
