<script lang="ts">
	import LogoMain from '$lib/components/LogoMain.svelte';
	import { services } from '$lib/data/content';
</script>

<svelte:head>
	<title>About — MILES 158</title>
</svelte:head>

<main class="About">
	<div class="About__inner">
		<section class="About__block About__intro section">
			<h1 class="About__lead" lang="ja">
				MILES 158 は、名古屋・西区に生まれた車好きのためのカーラウンジ。
			</h1>
			<div class="About__body" lang="ja">
				<p>
					「車と走る喜びをもっと身近に」 ―
					私たちが見つめているのは、距離や所有の量ではなく、車と共に流れる時間の質です。
					カーレンタル、クラブコミュニティ、カフェラウンジ、メンテナンスという4つのサービスを通じて、車と過ごすあらゆる時間を豊かにしていきたいと考えています。
				</p>
			</div>
		</section>

		<section class="About__block About__logo">
			<LogoMain width="100%" title="MILES 158" />
		</section>

		<section class="About__block About__services section">
			<h2 class="section-title">4 Services</h2>
			<div class="About__services-grid">
				{#each services as service (service.id)}
					<article class="About__service">
						<header>
							<p class="About__service-num">Service {service.number}</p>
							<h3 class="About__service-name">{service.name}</h3>
						</header>
						<p class="About__service-desc" lang="ja">{service.description}</p>
					</article>
				{/each}
			</div>
		</section>

		<section class="About__block About__company section">
			<h2 class="section-title">会社概要</h2>
			<dl class="About__company-list" lang="ja">
				<div class="About__row">
					<dt>商号</dt>
					<dd>MILES 158</dd>
				</div>
				<div class="About__row">
					<dt>所在地</dt>
					<dd>愛知県名古屋市西区 国道158号沿い</dd>
				</div>
				<div class="About__row">
					<dt>事業内容</dt>
					<dd>カーレンタル / クラブコミュニティ / カフェラウンジ / メンテナンス</dd>
				</div>
				<div class="About__row">
					<dt>設立</dt>
					<dd>2026年</dd>
				</div>
				<div class="About__row">
					<dt>お問い合わせ</dt>
					<dd><a href="mailto:hi@miles158.com">hi@miles158.com</a></dd>
				</div>
			</dl>
		</section>
	</div>
</main>

<style>
	.About {
		min-height: 100vh;
		padding-top: calc(var(--space-11) + var(--space-5));
	}

	.About__inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	@media (min-width: 1024px) {
		.About__inner {
			margin-left: auto;
			margin-right: 0;
			max-width: 50%;
			padding-right: var(--padding);
			padding-left: var(--space-7);
		}
	}

	.About__block + .About__block {
		margin-top: var(--space-9);
	}

	.About__block.section {
		padding-top: 0;
		padding-bottom: 0;
	}

	.About__lead {
		font-size: var(--fs-h2);
		line-height: 1.5;
		margin: 0 0 var(--space-6) 0;
		max-width: 24ch;
	}

	.About__body p {
		max-width: 60ch;
		line-height: 1.85;
		opacity: 0.85;
	}

	.About__logo {
		max-width: 360px;
		margin: 0 auto;
		padding-block: var(--space-9);
		color: var(--c-navy);
	}

	@media (min-width: 1024px) {
		.About__logo {
			margin-left: 0;
		}
	}

	.About__services-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-8);
	}

	@media (min-width: 768px) {
		.About__services-grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-9) var(--space-7);
		}
	}

	.About__service {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.About__service-num {
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin: 0;
	}

	.About__service-name {
		font-size: var(--fs-h3);
		margin: 0;
	}

	.About__service-desc {
		font-size: var(--fs-h5);
		line-height: 1.85;
		opacity: 0.82;
		margin: 0;
	}

	.About__company-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
	}

	.About__row {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-1);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-line);
	}

	@media (min-width: 640px) {
		.About__row {
			grid-template-columns: 8em 1fr;
			gap: var(--space-4);
			align-items: baseline;
		}
	}

	.About__row dt {
		font-size: var(--fs-h6);
		opacity: 0.6;
	}

	.About__row dd {
		font-size: var(--fs-h5);
		margin: 0;
		line-height: 1.7;
	}

	.About__row dd a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
