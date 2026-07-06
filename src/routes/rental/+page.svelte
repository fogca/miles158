<script lang="ts">
	import { page } from '$app/state';
	import { cars, rentalPricing } from '$lib/data/content';
	import { getServices, getRentalFlow, getRentalConditions, localizeRate } from '$lib/i18n/marketing';
	import { t, type Locale } from '$lib/i18n';

	const L = (page.data.locale ?? 'ja') as Locale;
	const rentalFlow2 = getRentalFlow(L);
	const rentalConditions2 = getRentalConditions(L);
	const service = getServices(L).find((s) => s.id === 'rental')!;

	// Join cars[] with rentalPricing[] so the template can render in car-order
	// while pulling rates from the pricing registry.
	const lineup = cars.map((car) => {
		const pricing = rentalPricing.find((p) => p.carId === car.id);
		return {
			...car,
			status: pricing?.status ?? 'coming-soon',
			rates: pricing?.rates ?? []
		};
	});
</script>

<svelte:head>
	<title>Car Rental — MILES 158</title>
	<meta
		name="description"
		content="MILES 158 のカーレンタル。Lexus LC500 / LM500 の料金（日額・週末・マンスリー）、ご利用フロー、必要書類・条件をご案内。"
	/>
	<meta property="og:title" content="Car Rental — MILES 158" />
	<meta
		property="og:description"
		content="Lexus LC500 / LM500 の高級カーレンタル。料金・ご利用方法・必要書類のご案内。"
	/>
	<meta name="twitter:title" content="Car Rental — MILES 158" />
	<meta
		name="twitter:description"
		content="Lexus LC500 / LM500 の高級カーレンタル。料金・ご利用方法のご案内。"
	/>
	<link rel="canonical" href="https://miles158.pages.dev/rental" />
</svelte:head>

<main class="Rental">
	<div class="Rental__inner">
		<!-- Hero: title LEFT, lead RIGHT on PC (same split pattern as below). -->
		<section class="Rental__block Rental__split Rental__hero section">
			<h1 class="section-title Rental__split-title">Car Rental</h1>
			<div class="Rental__split-body">
				<p class="Rental__lead">{service.description}</p>
			</div>
		</section>
		<!-- Lineup + pricing -->
		<section class="Rental__block Rental__split Rental__lineup section">
			<header class="Rental__section-head">
				<p class="Rental__eyebrow">Lineup &amp; Pricing</p>
				<h2 class="section-title Rental__split-title" >{t(L, 'rental.lineup')}</h2>
			</header>

			<div class="Rental__split-body">
				<div class="Rental__cars">
				{#each lineup as car (car.id)}
					<article class="Rental__car" data-status={car.status}>
						<div class="Rental__car-media">
							<img src={car.image} alt={car.name} loading="lazy" />
						</div>

						<div class="Rental__car-body">
							<header class="Rental__car-head">
								<h3 class="Rental__car-name">{car.name}</h3>
								<p class="Rental__car-sub">{car.subtitle}</p>
							</header>

							{#if car.status === 'available'}
								<dl class="Rental__rates">
									{#each car.rates as rate (rate.tier)}
										<div class="Rental__rate">
											<dt class="Rental__rate-label">
												<span class="Rental__rate-en" lang="en">{rate.label}</span>
												<span class="Rental__rate-ja" >{localizeRate(L, rate).labelJa}</span>
											</dt>
											<dd class="Rental__rate-value">
												<span class="Rental__rate-price">{rate.price}</span>
												{#if localizeRate(L, rate).note}
													<span class="Rental__rate-note">{localizeRate(L, rate).note}</span>
												{/if}
											</dd>
										</div>
									{/each}
								</dl>
							{:else}
								<p class="Rental__coming-soon">
									<span class="Rental__coming-badge">Coming Soon</span>
									{t(L, 'rental.comingSoon')}
								</p>
							{/if}
						</div>
					</article>
				{/each}
				</div>
			</div>
		</section>

		<!-- Flow -->
		<section class="Rental__block Rental__split Rental__flow section">
			<header class="Rental__section-head">
				<p class="Rental__eyebrow">How to Rent</p>
				<h2 class="section-title Rental__split-title" >{t(L, 'rental.flow')}</h2>
			</header>

			<div class="Rental__split-body">
				<ol class="Rental__steps">
					{#each rentalFlow2 as step (step.number)}
						<li class="Rental__step">
							<p class="Rental__step-num" lang="en">{step.number}</p>
							<div class="Rental__step-body">
								<h3 class="Rental__step-title">
									<span lang="en">{step.title}</span>
									<span class="Rental__step-title-ja">／ {step.titleJa}</span>
								</h3>
								<p class="Rental__step-text">{step.body}</p>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</section>

		<!-- Conditions -->
		<section class="Rental__block Rental__split Rental__conditions section">
			<header class="Rental__section-head">
				<p class="Rental__eyebrow">Requirements</p>
				<h2 class="section-title Rental__split-title" >{t(L, 'rental.conditions')}</h2>
			</header>

			<div class="Rental__split-body">
				<div class="Rental__cond-grid">
					<div class="Rental__cond">
						<h3 class="Rental__cond-title" >{t(L, 'rental.docs')}</h3>
						<ul class="Rental__cond-list">
							{#each rentalConditions2.documents as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>

					<div class="Rental__cond">
						<h3 class="Rental__cond-title" >{t(L, 'rental.reqs')}</h3>
						<ul class="Rental__cond-list">
							{#each rentalConditions2.requirements as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				</div>

				<ul class="Rental__notes">
					{#each rentalConditions2.notes as note}
						<li>※ {note}</li>
					{/each}
				</ul>
			</div>
		</section>
	</div>
</main>

<style>
	.Rental {
		padding-top: calc(var(--space-11) + var(--space-5));
	}

	.Rental__inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding-inline: var(--padding);
	}

	.Rental__block + .Rental__block {
		margin-top: var(--space-10);
	}

	.Rental__block.section {
		padding-top: 0;
		padding-bottom: 0;
	}

	/* PC: each split-section is a two-column grid — section header on the LEFT,
	   body on the RIGHT. Mobile keeps the header above. */
	@media (min-width: 1024px) {
		.Rental__split {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-7);
			align-items: start;
		}

		.Rental__split .Rental__section-head {
			margin-bottom: 0;
		}
	}

	/* Hero h1 sits directly in the split (no section-head wrapper).
	   Match the H2 step used by the other split titles. */
	.Rental__hero .Rental__split-title {
		font-size: var(--fs-h2);
		line-height: 1.2;
		margin-bottom: var(--space-5);
	}

	@media (min-width: 1024px) {
		.Rental__hero .Rental__split-title {
			margin-bottom: 0;
		}
	}

	.Rental__lead {
		font-size: var(--fs-h5);
		line-height: 1.85;
		opacity: 0.85;
		margin: 0;
		max-width: 60ch;
	}

	.Rental__section-head {
		margin-bottom: var(--space-6);
	}

	/* Override the global .section-title (clamp 2rem–3.5rem) on this page —
	   the rental layout reads better at the smaller --fs-h2 step. */
	.Rental__section-head .section-title {
		font-size: var(--fs-h2);
		line-height: 1.2;
		margin-bottom: 0;
	}

	.Rental__eyebrow {
		font-size: var(--fs-h6);
		opacity: 0.55;
		margin: 0 0 var(--space-2);
		letter-spacing: 0.06em;
	}

	/* ── Lineup ─────────────────────────────────────────────── */
	.Rental__cars {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-9);
	}

	.Rental__car {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-5);
	}

	.Rental__car-media {
		background: var(--color-line, rgba(0, 0, 0, 0.05));
		border-radius: 6px;
		overflow: hidden;
		aspect-ratio: 16 / 10;
	}

	.Rental__car-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.Rental__car-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin-bottom: var(--space-5);
	}

	.Rental__car-name {
		font-size: var(--fs-h3);
		margin: 0;
	}

	.Rental__car-sub {
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin: 0;
	}

	.Rental__rates {
		display: flex;
		flex-direction: column;
		gap: 0;
		margin: 0;
	}

	.Rental__rate {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-1);
		padding: var(--space-4) 0;
		border-top: 1px solid var(--color-line);
	}

	.Rental__rate:last-child {
		border-bottom: 1px solid var(--color-line);
	}

	@media (min-width: 640px) {
		.Rental__rate {
			grid-template-columns: 10em 1fr;
			gap: var(--space-4);
			align-items: baseline;
		}
	}

	.Rental__rate-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.Rental__rate-en {
		font-size: var(--fs-h6);
		opacity: 0.55;
		letter-spacing: 0.04em;
	}

	.Rental__rate-ja {
		font-size: var(--fs-h5);
	}

	.Rental__rate-value {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		margin: 0;
	}

	.Rental__rate-price {
		font-size: var(--fs-h4);
		font-feature-settings: 'tnum';
	}

	.Rental__rate-note {
		font-size: var(--fs-h6);
		opacity: 0.6;
		line-height: 1.5;
	}

	.Rental__coming-soon {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		font-size: var(--fs-h5);
		opacity: 0.75;
		margin: 0;
	}

	.Rental__coming-badge {
		align-self: flex-start;
		font-size: var(--fs-h6);
		letter-spacing: 0.08em;
		padding: 4px 10px;
		border: 1px solid currentColor;
		border-radius: 999px;
		opacity: 0.7;
	}

	.Rental__car[data-status='coming-soon'] .Rental__car-media {
		opacity: 0.55;
	}

	/* ── Flow ───────────────────────────────────────────────── */
	.Rental__steps {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.Rental__step {
		display: grid;
		grid-template-columns: 3em 1fr;
		gap: var(--space-4);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--color-line);
	}

	.Rental__step:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.Rental__step-num {
		font-size: var(--fs-h3);
		opacity: 0.4;
		margin: 0;
		line-height: 1;
		font-feature-settings: 'tnum';
	}

	.Rental__step-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.Rental__step-title {
		font-size: var(--fs-h4);
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: baseline;
	}

	.Rental__step-title-ja {
		font-size: var(--fs-h5);
		opacity: 0.7;
	}

	.Rental__step-text {
		font-size: var(--fs-h5);
		line-height: 1.85;
		opacity: 0.82;
		margin: 0;
		max-width: 60ch;
	}

	/* ── Conditions ─────────────────────────────────────────── */
	.Rental__cond-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-7);
	}

	@media (min-width: 768px) {
		.Rental__cond-grid {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-9) var(--space-7);
		}
	}

	.Rental__cond-title {
		font-size: var(--fs-h5);
		margin: 0 0 var(--space-3);
	}

	.Rental__cond-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.Rental__cond-list li {
		font-size: var(--fs-h6);
		line-height: 1.7;
		opacity: 0.85;
		padding-left: 1.2em;
		position: relative;
	}

	.Rental__cond-list li::before {
		content: '·';
		position: absolute;
		left: 0;
		font-size: 1.2em;
		line-height: 1;
	}

	.Rental__notes {
		list-style: none;
		padding: 0;
		margin: var(--space-7) 0 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.Rental__notes li {
		font-size: var(--fs-h6);
		line-height: 1.7;
		opacity: 0.6;
		max-width: 70ch;
	}
</style>
