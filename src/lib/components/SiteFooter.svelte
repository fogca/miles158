<script lang="ts">
	import LogoMain from './LogoMain.svelte';

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

	<div class="SiteFooter__inner">
		<ul class="SiteFooter__nav">
			{#each SITE_NAV as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>

		<div class="SiteFooter__group">
			<p class="SiteFooter__label">Get in touch?</p>
			<ul class="SiteFooter__nav">
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

		<div class="SiteFooter__group">
			<p class="SiteFooter__label">Visit Us</p>
			<a href="/reserve" class="btn-outline btn-outline--sm" lang="ja">来店予約</a>
		</div>

		<div class="SiteFooter__logo" aria-hidden="true">
			<LogoMain width="100%" title="MILES 158" />
		</div>
	</div>

	<div class="SiteFooter__bottom">
		<ul class="SiteFooter__legal">
			{#each LEGAL as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
		<p class="SiteFooter__copy">© {YEAR} MILES 158 · Nagoya, Japan</p>
	</div>
</footer>

<style>
	.SiteFooter {
		background: var(--c-navy);
		color: var(--c-sky);
		padding: var(--space-10) 0 var(--space-6);
	}

	.SiteFooter :global(*) {
		color: var(--c-sky);
	}

	.SiteFooter__inner {
		display: flex;
		flex-direction: column;
		gap: var(--space-9);
		padding-inline: var(--padding);
	}

	.SiteFooter__nav {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.SiteFooter__nav a {
		font-size: var(--fs-h3);
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.SiteFooter__nav a:hover {
		opacity: 0.7;
	}

	.SiteFooter__group {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.SiteFooter__label {
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin: 0;
	}

	.SiteFooter__group .btn-outline {
		align-self: flex-start;
	}

	.SiteFooter__logo {
		width: 50%;
		max-width: 320px;
	}

	.SiteFooter__logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

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
