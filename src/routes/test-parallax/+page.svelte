<script lang="ts">
	import ParallaxStack from '$lib/stock/animation/parallax/ParallaxStack.svelte';
</script>

<svelte:head>
	<title>Parallax Test — MILES 158</title>
</svelte:head>

<main class="ptest-page">
	<section class="intro section">
		<div class="container">
			<h1 class="section-title">Parallax Test</h1>
			<p lang="ja" class="lead">
				prev は固定で少し大きくなる。next は最初からそこにあり、見えている部分（clip-path）が下から上へ広がる。3層で vis1 → vis2 → vis3 (story slider) の引き渡しを確認。
			</p>
			<p class="scroll-cue">Scroll ↓</p>
		</div>
	</section>

	<ParallaxStack
		layers={[
			{ src: '/images/car_10.png', alt: 'vis 1' },
			{ src: '/images/LC500.png', alt: 'vis 2' },
			{ src: '/images/car_10.png', alt: 'vis 3 (story slider entry)' }
		]}
		transitionDistance="200%"
		scaleAmount={0.18}
		background="#000a26"
		debug
	/>

	<section class="after section">
		<div class="container">
			<p lang="ja">↑ pin 解除後（次セクション相当）</p>
		</div>
	</section>
</main>

<style>
	.ptest-page {
		min-height: 200vh;
	}

	.intro {
		min-height: 100vh;
		display: flex;
		align-items: center;
	}

	.lead {
		max-width: 60ch;
		margin-top: var(--space-5);
		opacity: 0.85;
	}

	.scroll-cue {
		margin-top: var(--space-7);
		opacity: 0.55;
		font-size: var(--fs-h6);
	}

	.after {
		min-height: 80vh;
		display: flex;
		align-items: center;
	}
</style>
