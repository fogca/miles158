<script lang="ts">
	// Placeholder page so the header / footer "来店予約" CTAs stop hitting 404
	// in production. Real reservation flow (LINE 公式 / form / 予約 SaaS) is
	// still being decided — once direction is chosen, replace this scaffold.
</script>

<svelte:head>
	<title>来店予約 — MILES 158</title>
	<meta
		name="description"
		content="MILES 158 への来店予約。受付方法は現在準備中です。お問い合わせはメールにて承ります。"
	/>
	<meta property="og:title" content="来店予約 — MILES 158" />
	<meta
		property="og:description"
		content="MILES 158 への来店予約。受付方法は現在準備中です。"
	/>
	<meta name="twitter:title" content="来店予約 — MILES 158" />
	<meta
		name="twitter:description"
		content="MILES 158 への来店予約は現在準備中です。"
	/>
	<link rel="canonical" href="https://miles158.pages.dev/reserve" />
</svelte:head>

<main class="Reserve">
	<div class="Reserve__inner">
		<section class="Reserve__block Reserve__hero section">
			<h1 class="section-title">Reservation</h1>
			<p class="Reserve__lead" lang="ja">
				MILES 158
				への来店予約ページです。車両のご相談・試乗・ラウンジ見学など、ご希望の内容を伺ったうえでご案内いたします。
			</p>
		</section>

		<section class="Reserve__block Reserve__placeholder section">
			<div class="Reserve__notice">
				<p class="Reserve__notice-eyebrow" lang="en">Coming Soon</p>
				<h2 class="section-title Reserve__notice-title" lang="ja">
					オンライン予約は現在準備中です
				</h2>
				<p class="Reserve__notice-body" lang="ja">
					予約システムの正式公開までの間、来店をご希望の方は下記メールアドレスまでご連絡ください。ご希望日時・人数・ご相談内容（車両・コミュニティ・カフェなど）をお知らせいただけますとスムーズです。
				</p>

				<div class="Reserve__cta">
					<a class="btn-outline" href="mailto:info@miles158.jp?subject=来店予約のご相談" lang="ja"
						>メールで相談する</a
					>
				</div>
			</div>
		</section>
	</div>
</main>

<style>
	.Reserve {
		padding-top: calc(var(--space-11) + var(--space-5));
	}

	.Reserve__inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	@media (min-width: 1024px) {
		.Reserve__inner {
			margin-left: auto;
			margin-right: 0;
			max-width: 50%;
			padding-right: var(--padding);
			padding-left: var(--space-7);
		}
	}

	.Reserve__block + .Reserve__block {
		margin-top: var(--space-10);
	}

	.Reserve__block.section {
		padding-top: 0;
		padding-bottom: 0;
	}

	.Reserve__lead {
		font-size: var(--fs-h5);
		line-height: 1.85;
		opacity: 0.85;
		margin: var(--space-5) 0 0;
		max-width: 60ch;
	}

	.Reserve__notice {
		border: 1px solid var(--color-line);
		border-radius: 6px;
		padding: var(--space-7) var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.Reserve__notice-eyebrow {
		font-size: var(--fs-h6);
		letter-spacing: 0.08em;
		opacity: 0.55;
		margin: 0;
	}

	.Reserve__notice-title {
		font-size: var(--fs-h2);
		line-height: 1.3;
		margin: 0;
	}

	.Reserve__notice-body {
		font-size: var(--fs-h5);
		line-height: 1.85;
		opacity: 0.82;
		margin: 0;
		max-width: 60ch;
	}

	.Reserve__cta {
		margin-top: var(--space-5);
	}
</style>
