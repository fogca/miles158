<script lang="ts">
	import { hero } from '$lib/data/content';
	import LogoMain from './LogoMain.svelte';
</script>

<section class="hero" data-dark-section>
	<div class="hero-bg">
		<img src={hero.bgImage} alt="" loading="eager" />
	</div>
	<div class="hero-gradient"></div>

	<header class="hero-header container">
		<h1 class="hero-brand">
			<LogoMain width="100%" title={hero.brand} />
		</h1>
		<p class="hero-services" lang="ja">{hero.services}</p>
	</header>

	<div class="hero-bottom container">
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
		<button type="button" class="btn-glass btn-glass--lg">{hero.ctaLabel}</button>
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

	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: 0;
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
			rgba(0, 10, 38, 0.35) 0%,
			rgba(0, 10, 38, 0) 35%,
			rgba(0, 10, 38, 0.55) 80%,
			rgba(0, 10, 38, 0.9) 100%
		);
		z-index: 1;
	}

	.hero-header,
	.hero-bottom {
		position: relative;
		z-index: 2;
	}

	.hero-brand {
		display: block;
		width: clamp(280px, 60vw, 540px);
		margin: 0 0 18px 0;
		color: #ffffff;
		line-height: 0;
	}

	.hero-services {
		font-size: clamp(10px, 0.9vw, 12px);
		opacity: 0.92;
		margin: 0;
		color: #e8f4f8;
	}

	.hero-bigtitle {
		font-size: clamp(2.4rem, 6vw, 4.5rem);
		font-weight: 400;
		line-height: 1.0;
		margin: 0 0 1rem 0;
		text-transform: uppercase;
	}

	.hero-bigtitle .line {
		display: block;
	}

	.hero-lead {
		font-size: clamp(13px, 1vw, 16px);
		line-height: 1.75;
		margin: 0 0 2rem 0;
		opacity: 0.95;
		color: #f8f9fa;
	}

	.hero-lead .line-ja {
		display: inline;
	}

	.hero-cta {
		display: none;
	}
</style>
