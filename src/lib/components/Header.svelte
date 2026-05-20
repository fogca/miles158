<script lang="ts">
	// Mischen site header.
	// Mobile (<768px): "Menu" / "Close" toggle on the left, fullscreen overlay nav.
	// Desktop (≥768px): inline nav links on the left, no toggle.
	// Right: Mischen wordmark (always visible).

	let open = $state(false);

	type NavItem = { label: string; href: string };

	const NAV: NavItem[] = [
		{ label: 'Aether', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Buy', href: '/buy' }
	];

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	// Escape closes the mobile overlay
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) close();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="Header">
	<!-- Mobile-only Menu/Close toggle -->
	<button
		class="Header__toggle"
		type="button"
		onclick={toggle}
		aria-expanded={open}
		aria-controls="primary-nav"
	>
		{open ? 'Close' : 'Menu'}
	</button>

	<!-- Desktop-only inline nav -->
	<nav class="Header__nav" aria-label="Primary navigation">
		{#each NAV as item (item.href)}
			<a class="Header__nav-link" href={item.href}>{item.label}</a>
		{/each}
	</nav>

	<a class="Header__logo" href="/" onclick={close}>Mischen</a>
</header>

{#if open}
	<nav class="MenuOverlay" id="primary-nav" aria-label="Primary">
		<ul class="MenuOverlay__list">
			{#each NAV as item (item.href)}
				<li class="MenuOverlay__item">
					<a href={item.href} onclick={close}>{item.label}</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.Header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* Chairman directive 2026-05-09: align Header horizontal padding with the
		   fixed-px columns (Footer / Buy / Contact use --gutter), not the wider
		   --padding (7.5vw on tablet) which made the nav read as too inset. */
		padding-block: 5px;
		padding-inline: var(--gutter);
		z-index: 100;
		font-family: 'Aether', sans-serif;
		mix-blend-mode: difference;
		color: #fff;
		pointer-events: none;
	}

	.Header > * {
		pointer-events: auto;
	}

	.Header__toggle {
		background: transparent;
		border: 0;
		cursor: pointer;
		font: inherit;
		font-size: 14px;
		font-variation-settings: 'wght' 450;
		color: inherit;
		letter-spacing: 0;
		padding: 4px 8px;
	}

	/* Inline nav: hidden on mobile, shown on desktop */
	.Header__nav {
		display: none;
		gap: 20px;
		align-items: center;
	}

	.Header__nav-link {
		font-size: 16px;
		font-variation-settings: 'wght' 450;
		color: inherit;
		text-decoration: none;
		letter-spacing: 0;
		padding: 4px 0;
	}

	.Header__logo {
		font-size: 20px;
		font-variation-settings: 'wght' 450;
		text-decoration: none;
		color: inherit;
		letter-spacing: 0;
		padding: 4px 8px;
	}

	@media (min-width: 768px) {
		.Header__toggle {
			display: none;
		}

		.Header__nav {
			display: flex;
		}

		.Header__logo {
			font-size: 22px;
			padding: 4px 0;
		}
	}

	/* Mobile fullscreen overlay — left-aligned per chairman directive 2026-05-07 */
	.MenuOverlay {
		position: fixed;
		inset: 0;
		background: var(--color-bg, #ffffff);
		z-index: 90;
		padding: 64px 16px 24px;
	}

	.MenuOverlay__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
		text-align: left;
	}

	.MenuOverlay__item a {
		font-family: 'Aether', sans-serif;
		font-variation-settings: 'wght' 450;
		font-size: clamp(36px, 9vw, 64px);
		line-height: 1.05;
		letter-spacing: 0;
		text-decoration: none;
		color: inherit;
		display: inline-block;
		padding: 4px 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.MenuOverlay {
			transition: none;
		}
	}
</style>
