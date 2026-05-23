<script lang="ts">
	import { services } from '$lib/data/content';
	const service = services.find((s) => s.id === 'community')!;
</script>

<svelte:head>
	<title>Club Community — MILES 158</title>
	<meta
		name="description"
		content="MILES 158 のクラブコミュニティ。車好きが集うプライベートな会員制空間で、共通の情熱を軸に時間・知識・物語を交わす。"
	/>
	<meta property="og:title" content="Club Community — MILES 158" />
	<meta
		property="og:description"
		content="車好きが集うプライベートな会員制クラブコミュニティ。"
	/>
	<meta name="twitter:title" content="Club Community — MILES 158" />
	<meta
		name="twitter:description"
		content="車好きが集うプライベートな会員制クラブコミュニティ。"
	/>
	<link rel="canonical" href="https://miles158.pages.dev/community" />
</svelte:head>

<main class="page">
	<section class="hero section">
		<div class="section-inner">
			<h1 class="section-title">Club Community</h1>
			<p class="lead" lang="ja">{service.description}</p>
		</div>
	</section>

	<section class="placeholder section">
		<div class="section-inner">
			<p lang="ja" class="mute">※ 入会案内 / メンバー特典 / イベント情報 はこのページに追加予定。</p>
		</div>
	</section>
</main>

<style>
	.section-inner {
		padding-inline: var(--padding);
	}

	.hero {
		min-height: 60vh;
		display: flex;
		align-items: center;
		padding-top: calc(var(--space-11) + var(--space-5));
	}

	.hero .lead {
		margin-top: var(--space-7);
	}
</style>
