<script lang="ts">
	import { page } from '$app/state';
	import { getServices } from '$lib/i18n/marketing';
	import { t, type Locale } from '$lib/i18n';

	const L = (page.data.locale ?? 'ja') as Locale;
	const services = getServices(L);
</script>

<svelte:head>
	<title>About — MILES 158</title>
	<meta
		name="description"
		content="MILES 158 のブランド概要と 4 つのサービス（Car Rental / Club Community / Club Cafe / Cleaning）、会社概要。"
	/>
	<meta property="og:title" content="About — MILES 158" />
	<meta
		property="og:description"
		content="MILES 158 のブランド概要と 4 つのサービス。名古屋・西区。"
	/>
	<meta name="twitter:title" content="About — MILES 158" />
	<meta
		name="twitter:description"
		content="MILES 158 のブランド概要と 4 つのサービス。"
	/>
	<link rel="canonical" href="https://miles158.pages.dev/about" />
</svelte:head>

<main class="About">
	<div class="About__inner">
		<section class="About__block About__split About__intro section">
			<h1 class="About__lead About__split-title">{@html t(L, 'about.introTitle')}</h1>
			<div class="About__split-body About__body">
				<p>{t(L, 'about.introBody')}</p>
			</div>
		</section>
		<section class="About__block About__logoguide">
			<img
				src="/images/logo-guideline.png"
				alt="MILES 158 logotype guideline — derivation of MILES and the route 158 reference"
				loading="lazy"
			/>
		</section>

		<section class="About__block About__split About__services section">
			<h2 class="section-title About__split-title">4 Services</h2>
			<div class="About__split-body">
				<div class="About__services-grid">
					{#each services as service (service.id)}
						<article class="About__service">
							<header>
								<p class="About__service-num">Service {service.number}</p>
								<h3 class="About__service-name">{service.name}</h3>
							</header>
							<p class="About__service-desc">{service.description}</p>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<section class="About__block About__split About__company section">
			<h2 class="section-title About__split-title" >{t(L, 'about.companyTitle')}</h2>
			<div class="About__split-body">
				<dl class="About__company-list">
					<div class="About__row">
						<dt>{t(L, 'about.coName')}</dt>
						<dd>MILES 158</dd>
					</div>
					<div class="About__row">
						<dt>{t(L, 'about.coAddress')}</dt>
						<dd>{t(L, 'about.coAddressV')}</dd>
					</div>
					<div class="About__row">
						<dt>{t(L, 'about.coBiz')}</dt>
						<dd>{t(L, 'about.coBizV')}</dd>
					</div>
					<div class="About__row">
						<dt>{t(L, 'about.coFounded')}</dt>
						<dd>2026</dd>
					</div>
					<div class="About__row">
						<dt>{t(L, 'about.coContact')}</dt>
						<dd><a href="mailto:hi@miles158.com">hi@miles158.com</a></dd>
					</div>
				</dl>
			</div>
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

	/* PC: each split-section is a two-column grid — title on the LEFT (aligned
	   with the intro), content on the RIGHT. Mobile keeps the title above. */
	.About__split-title {
		font-size: var(--fs-h2);
		line-height: 1.2;
		margin-bottom: var(--space-6);
	}

	@media (min-width: 1024px) {
		.About__split {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-7);
			align-items: start;
		}

		.About__split-title {
			margin-bottom: 0;
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
	}

	.About__body p {
		max-width: 60ch;
		line-height: 1.85;
		opacity: 0.85;
	}

	/* ── Logotype guideline (exported from Figma) ─────────── */
	.About__logoguide img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 4px;
	}

	/* PC: image lives in the right column, aligned with all other split sections. */
	@media (min-width: 1024px) {
		.About__logoguide {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-7);
		}
		.About__logoguide img {
			grid-column: 2 / 3;
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
