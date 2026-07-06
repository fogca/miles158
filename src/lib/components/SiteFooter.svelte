<script lang="ts">
	import { page } from '$app/state';
	import LogoMain from './LogoMain.svelte';
	import { l, t, LOCALES, LOCALE_LABELS, switchLocalePath, type Locale } from '$lib/i18n';

	const L = $derived((page.data.locale ?? 'ja') as Locale);

	type LinkItem = { label: string; href: string; external?: boolean };

	const SITE_NAV: LinkItem[] = [
		{ label: 'About', href: '/about' },
		{ label: 'Car Rental', href: '/rental' },
		{ label: 'Club Community', href: '/community' },
		{ label: 'Club Cafe', href: '/about#cafe' }
	];

	const CONTACT: LinkItem[] = [
		{ label: 'Instagram', href: 'https://instagram.com/', external: true },
		{ label: 'Contact', href: 'mailto:hi@miles158.com' }
	];

	const LEGAL: LinkItem[] = [
		{ label: 'Privacy', href: '/legal/privacy' },
		{ label: 'Imprint', href: '/legal/imprint' }
	];

	const YEAR = new Date().getFullYear();
</script>

<footer class="SiteFooter" data-dark-section aria-labelledby="site-footer-heading">
	<h2 id="site-footer-heading" class="sr-only">MILES 158</h2>

	<div class="SiteFooter__grid">
		<!-- Column 1: brand logo + place line -->
		<div class="SiteFooter__col SiteFooter__col--brand">
			<div class="SiteFooter__logo" aria-hidden="true">
				<LogoMain width="100%" title="MILES 158" />
			</div>
			<p class="SiteFooter__tagline" style="white-space: pre-line">{t(L, 'footer.tagline')}</p>
			<ul class="SiteFooter__langs" aria-label="Language">
				{#each LOCALES as loc (loc)}
					<li><a href={switchLocalePath(page.url.pathname, loc)} class:is-active={loc === L} data-sveltekit-reload>{LOCALE_LABELS[loc]}</a></li>
				{/each}
			</ul>
		</div>

		<!-- Column 2: site nav -->
		<nav class="SiteFooter__col" aria-label="Footer navigation">
			<h3 class="SiteFooter__heading">Site</h3>
			<ul class="SiteFooter__list">
				{#each SITE_NAV as item (item.href)}
					<li><a href={l(L, item.href)}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<!-- Column 3: contact / social -->
		<div class="SiteFooter__col">
			<h3 class="SiteFooter__heading">Get in touch</h3>
			<ul class="SiteFooter__list">
				{#each CONTACT as item (item.href)}
					<li>
						<a
							href={item.href}
							target={item.external ? '_blank' : undefined}
							rel={item.external ? 'noopener noreferrer' : undefined}
						>{item.label}{item.external ? ' ↗' : ''}</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Column 4: reservation CTA -->
		<div class="SiteFooter__col SiteFooter__col--cta">
			<h3 class="SiteFooter__heading">Visit Us</h3>
			<p class="SiteFooter__note">{t(L, 'footer.visitNote')}</p>
			<a href={l(L, '/reserve')} class="btn-outline btn-outline--sm SiteFooter__cta"
				>{t(L, 'common.reserveCta')}</a
			>
		</div>
	</div>

	<div class="SiteFooter__bottom">
		<ul class="SiteFooter__legal">
			{#each LEGAL as item (item.href)}
				<li><a href={l(L, item.href)}>{item.label}</a></li>
			{/each}
		</ul>
		<p class="SiteFooter__copy">© {YEAR} MILES 158 · Nagoya, Japan</p>
	</div>
</footer>

<style>
	.SiteFooter {
		background: #0d152b;
		color: var(--c-sky);
		padding: var(--space-10) 0 var(--space-6);
		margin-top: 80px;
	}

	@media (min-width: 1024px) {
		.SiteFooter {
			margin-top: 120px;
		}
	}

	.SiteFooter :global(*) {
		color: var(--c-sky);
	}

	/* ── Grid (4-col on desktop, stacked on mobile) ─────────── */
	.SiteFooter__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-8);
		padding-inline: var(--padding);
	}

	@media (min-width: 768px) {
		.SiteFooter__grid {
			grid-template-columns: 2fr 1fr 1fr 1.5fr;
			gap: var(--space-7);
			align-items: start;
		}
	}

	.SiteFooter__col {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* Brand column */
	.SiteFooter__col--brand {
		gap: var(--space-5);
	}

	.SiteFooter__logo {
		width: 60%;
		max-width: 260px;
	}

	@media (min-width: 768px) {
		.SiteFooter__logo {
			width: 100%;
			max-width: 240px;
		}
	}

	.SiteFooter__logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.SiteFooter__tagline {
		font-size: var(--fs-h6);
		line-height: 1.6;
		opacity: 0.7;
		max-width: 28ch;
		margin: 0;
	}

	/* Column headings (small caps-feel uppercase eyebrow) */
	.SiteFooter__heading {
		font-size: var(--fs-h6);
		font-weight: 500;
		letter-spacing: 0.04em;
		opacity: 0.55;
		margin: 0;
	}

	/* Nav / contact lists */
	.SiteFooter__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.SiteFooter__list a {
		font-size: var(--fs-h5);
		text-decoration: none;
		opacity: 0.9;
		transition: opacity 0.2s ease;
	}

	.SiteFooter__list a:hover {
		opacity: 0.65;
	}

	/* CTA column */
	.SiteFooter__col--cta {
		gap: var(--space-3);
	}

	.SiteFooter__note {
		font-size: var(--fs-h6);
		line-height: 1.6;
		opacity: 0.7;
		margin: 0;
		max-width: 28ch;
	}

	.SiteFooter__cta {
		align-self: flex-start;
		margin-top: var(--space-2);
	}

	/* ── Bottom row ─────────────────────────────────────────── */
	.SiteFooter__bottom {
		margin-top: var(--space-9);
		padding: var(--space-5) var(--padding) 0;
		border-top: 1px solid rgba(232, 244, 248, 0.15);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		opacity: 0.6;
	}

	@media (min-width: 768px) {
		.SiteFooter__bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	.SiteFooter__langs {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: var(--space-4);
	}
	.SiteFooter__langs a {
		font-size: var(--fs-h6);
		opacity: 0.55;
		letter-spacing: 0.04em;
	}
	.SiteFooter__langs a.is-active {
		opacity: 1;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.SiteFooter__legal {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: var(--space-4);
	}

	.SiteFooter__legal a,
	.SiteFooter__copy {
		font-size: var(--fs-h6);
		text-decoration: none;
		margin: 0;
	}
</style>
