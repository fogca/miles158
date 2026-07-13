<script lang="ts">
	import { page } from '$app/state';
	import { getServices } from '$lib/i18n/marketing';
	import { t, type Locale } from '$lib/i18n';

	const L = (page.data.locale ?? 'ja') as Locale;
	const service = getServices(L).find((s) => s.id === 'community')!;
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
</svelte:head>

<main class="page">
	<section class="hero section">
		<div class="section-inner">
			<h1 class="section-title">Club Community</h1>
			<p class="lead">{service.description}</p>
		</div>
	</section>

	<section class="placeholder section">
		<div class="section-inner">
			<p class="mute">{t(L, 'community.placeholder')}</p>
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
