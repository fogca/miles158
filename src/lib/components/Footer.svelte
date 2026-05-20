<script lang="ts">
	// Mischen site footer.
	// Holds newsletter signup, contact info, site nav and legal links.

	let email = $state('');
	let submitted = $state(false);

	type LinkItem = { label: string; href: string };

	const SITE_NAV: LinkItem[] = [
		{ label: 'Aether', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Buy', href: '/buy' },
		{ label: 'Contact', href: '/contact' }
	];

	const SOCIAL: LinkItem[] = [
		{ label: 'Instagram', href: 'https://instagram.com/' },
		{ label: 'Twitter', href: 'https://twitter.com/' }
	];

	const LEGAL: LinkItem[] = [
		{ label: 'EULA', href: '/legal/eula' },
		{ label: 'Privacy', href: '/legal/privacy' },
		{ label: 'Imprint', href: '/legal/imprint' }
	];

	const YEAR = new Date().getFullYear();

	function handleSubscribe(e: SubmitEvent) {
		e.preventDefault();
		// Newsletter signup is a placeholder — wire up to ESP (Resend / Mailchimp) in Phase 4
		if (!email.trim()) return;
		submitted = true;
		setTimeout(() => {
			submitted = false;
			email = '';
		}, 2400);
	}
</script>

<footer class="Footer" aria-labelledby="footer-heading">
	<h2 id="footer-heading" class="Footer__sr">Mischen Typefoundry</h2>

	<div class="Footer__grid">
		<!-- Column 1: brand + ethos -->
		<section class="Footer__col Footer__col--brand">
			<a href="/" class="Footer__logo">Mischen</a>
			<p class="Footer__tagline">
				A type foundry from Tokyo.<br />
				Aether — released 2026.
			</p>
		</section>

		<!-- Column 2: site nav (no heading, direct links) -->
		<nav class="Footer__col" aria-label="Footer navigation">
			<ul class="Footer__list">
				{#each SITE_NAV as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<!-- Column 3: social / contact -->
		<section class="Footer__col">
			<h3 class="Footer__heading">Find us</h3>
			<ul class="Footer__list">
				{#each SOCIAL as item (item.href)}
					<li>
						<a href={item.href} target="_blank" rel="noopener noreferrer">
							{item.label} ↗
						</a>
					</li>
				{/each}
				<li>
					<a href="mailto:hello@mischen.tf">hello@mischen.tf</a>
				</li>
			</ul>
		</section>

		<!-- Column 4: newsletter -->
		<section class="Footer__col Footer__col--newsletter">
			<h3 class="Footer__heading">Newsletter</h3>
			<p class="Footer__note">New releases, in-progress weights, foundry updates.</p>
			<form class="Footer__form" onsubmit={handleSubscribe}>
				<label class="Footer__sr" for="footer-email">Email address</label>
				<input
					id="footer-email"
					type="email"
					required
					placeholder="you@example.com"
					autocomplete="email"
					bind:value={email}
					class="Footer__input"
				/>
				<button type="submit" class="Footer__submit">
					{submitted ? 'Thank you' : 'Subscribe →'}
				</button>
			</form>
		</section>
	</div>

	<div class="Footer__bottom">
		<ul class="Footer__legal">
			{#each LEGAL as item (item.href)}
				<li><a href={item.href}>{item.label}</a></li>
			{/each}
		</ul>
		<p class="Footer__copy">© {YEAR} Mischen Typefoundry · Tokyo, Japan</p>
	</div>
</footer>

<style>
	.Footer {
		font-family: 'Aether', sans-serif;
		font-variation-settings: 'wght' 450;
		background: #000;
		color: #fff;
		padding: 64px 0 24px;
		margin-top: 120px;
	}

	/* Force all child elements to inherit white text color, overriding base.css tokens */
	.Footer :global(*) {
		color: #fff;
	}

	.Footer :global(a) {
		color: #fff;
	}

	.Footer :global(input::placeholder) {
		color: rgba(255, 255, 255, 0.4);
	}

	.Footer__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.Footer__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 48px;
		padding-inline: 16px;
	}

	@media (min-width: 768px) {
		.Footer__grid {
			grid-template-columns: 2fr 1fr 1fr 2fr;
			gap: 32px;
			padding-inline: 32px;
		}
	}

	.Footer__col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.Footer__logo {
		font-size: 32px;
		font-variation-settings: 'wght' 450;
		letter-spacing: 0;
		text-decoration: none;
		color: inherit;
		line-height: 1;
	}

	.Footer__tagline {
		font-size: 13px;
		line-height: 1.5;
		opacity: 0.7;
		max-width: 28ch;
	}

	.Footer__heading {
		font-size: 12px;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
		opacity: 0.6;
		margin: 0;
	}

	.Footer__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.Footer__list a,
	.Footer__legal a {
		color: inherit;
		text-decoration: none;
		font-size: 14px;
		opacity: 0.85;
		transition: opacity 0.15s ease;
	}

	.Footer__list a:hover,
	.Footer__legal a:hover {
		opacity: 1;
	}

	.Footer__note {
		font-size: 12px;
		line-height: 1.5;
		opacity: 0.7;
		margin: 0;
	}

	.Footer__form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	@media (min-width: 480px) {
		.Footer__form {
			flex-direction: row;
		}
	}

	.Footer__input {
		flex: 1;
		background: transparent;
		border: 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		color: inherit;
		font: inherit;
		font-size: 14px;
		padding: 8px 0;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.Footer__input::placeholder {
		color: rgba(255, 255, 255, 0.4);
	}

	.Footer__input:focus {
		border-bottom-color: #fff;
	}

	.Footer__submit {
		background: transparent;
		border: 0;
		color: inherit;
		font: inherit;
		font-size: 14px;
		font-variation-settings: 'wght' 500;
		cursor: pointer;
		padding: 8px 0;
		text-align: left;
		transition: opacity 0.15s ease;
	}

	@media (min-width: 480px) {
		.Footer__submit {
			padding: 8px 16px;
			text-align: center;
			border-bottom: 1px solid transparent;
		}
	}

	.Footer__submit:hover {
		opacity: 0.7;
	}

	.Footer__bottom {
		margin-top: 56px;
		padding: 24px 16px 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		display: flex;
		flex-direction: column;
		gap: 16px;
		font-size: 12px;
		opacity: 0.6;
	}

	@media (min-width: 768px) {
		.Footer__bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			padding-inline: 32px;
		}
	}

	.Footer__legal {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: 16px;
	}

	.Footer__legal a {
		font-size: 12px;
	}

	.Footer__copy {
		margin: 0;
		font-size: 12px;
	}
</style>
