<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import LogoSub from './LogoSub.svelte';
	import { l, t, LOCALES, LOCALE_LABELS, switchLocalePath, type Locale } from '$lib/i18n';

	let menuOpen = $state(false);
	let langOpen = $state(false);
	let mode = $state<'light' | 'dark'>('light');
	let atTop = $state(true);

	const L = $derived((page.data.locale ?? 'ja') as Locale);

	// On the home page, while the user is at the very top, the big Hero logo
	// is visible — hide the fixed header so it doesn't compete with it.
	let hidden = $derived(atTop && page.url.pathname === '/');

	type Item = { label: string; href: string };
	// Nav labels stay in brand English across locales by design.
	const NAV: Item[] = [
		{ label: 'Home', href: '/' },
		{ label: 'About', href: '/about' },
		{ label: 'Car Rental', href: '/rental' },
		{ label: 'Club Community', href: '/community' }
	];

	function close() {
		menuOpen = false;
	}

	function toggle() {
		menuOpen = !menuOpen;
	}

	// Watch [data-dark-section] elements; when one overlaps the header band,
	// switch header text to light (sky); otherwise dark (navy).
	onMount(() => {
		let cleanup: (() => void) | null = null;

		(async () => {
			const { gsap } = await import('gsap');

			const tick = () => {
				const sections = document.querySelectorAll<HTMLElement>('[data-dark-section]');
				const headerBand = 90;
				let onDark = false;
				sections.forEach((el) => {
					const rect = el.getBoundingClientRect();
					if (rect.top <= headerBand && rect.bottom > 0) onDark = true;
				});
				const next = onDark ? 'light' : 'dark';
				if (next !== mode) mode = next;

				// On home, keep the header hidden while the ScrollVideo hero is
				// playing (~300vh), only revealing it near the end of the hero.
				// On home, bottom hero content starts fading in at scroll progress 0.15
				// (= 30vh given the 300vh scrollDistance / 200vh sticky range).
				// Reveal the header at the same scroll point so they appear together.
				const isHome = page.url.pathname === '/';
				const threshold = isHome ? window.innerHeight * 0.3 : 60;
				const top = window.scrollY < threshold;
				if (top !== atTop) atTop = top;
			};

			gsap.ticker.add(tick);
			cleanup = () => gsap.ticker.remove(tick);
		})();

		return () => cleanup?.();
	});
</script>

<header class="SiteHeader" class:hidden data-mode={mode}>
	<a href={l(L, '/')} class="SiteHeader__logo" aria-label="Home" onclick={close}>
		<LogoSub width={120} title="MILES 158" />
	</a>

	<!-- Desktop nav: inline links, no hamburger. -->
	<nav class="SiteHeader__nav SiteHeader__nav--desktop" aria-label="Primary">
		<ul class="SiteHeader__links">
			{#each NAV.filter((n) => n.href !== '/') as item (item.href)}
				<li><a href={l(L, item.href)}>{item.label}</a></li>
			{/each}
		</ul>
		<div class="LangDD" onmouseleave={() => (langOpen = false)}>
			<button type="button" class="LangDD__btn" aria-expanded={langOpen} aria-label="Language" onclick={() => (langOpen = !langOpen)}>
				{LOCALE_LABELS[L]}
				<svg class="LangDD__chev" class:is-open={langOpen} viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</button>
			{#if langOpen}
				<div class="LangDD__menu">
					<div class="LangDD__panel">
						{#each LOCALES as loc (loc)}
							<a href={switchLocalePath(page.url.pathname, loc)} class:is-active={loc === L} data-sveltekit-reload onclick={() => (langOpen = false)}>{LOCALE_LABELS[loc]}</a>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<a href={l(L, '/reserve')} class="btn-outline btn-outline--sm">{t(L, 'common.reserveCta')}</a>
	</nav>

	<!-- Mobile nav: hamburger only. Desktop hides this entire group. -->
	<nav class="SiteHeader__nav SiteHeader__nav--mobile" aria-label="Primary">
		<a href={l(L, '/reserve')} class="btn-outline btn-outline--sm">{t(L, 'common.reserveCta')}</a>

		<button
			type="button"
			class="hamburger"
			aria-label="Open menu"
			aria-expanded={menuOpen}
			onclick={toggle}
		>
			<span></span>
			<span></span>
		</button>
	</nav>
</header>

{#if menuOpen}
	<div
		class="MenuOverlay"
		role="dialog"
		aria-modal="true"
		aria-label="Site menu"
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
	>
		<aside class="MenuPanel" onclick={(e) => e.stopPropagation()}>
			<a href={l(L, '/')} class="MenuPanel__logo" aria-label="Home" onclick={close}>
				<LogoSub width={120} title="MILES 158" />
			</a>

			<button
				type="button"
				class="MenuPanel__close"
				aria-label="Close menu"
				onclick={close}
			>
				<span></span>
				<span></span>
			</button>

			<nav class="MenuPanel__nav" aria-label="Site">
				<ul>
					{#each NAV as item (item.href)}
						<li><a href={l(L, item.href)} onclick={close}>{item.label}</a></li>
					{/each}
				</ul>
			</nav>

			<ul class="MenuPanel__langs" aria-label="Language">
				{#each LOCALES as loc (loc)}
					<li>
						<a href={switchLocalePath(page.url.pathname, loc)} class:is-active={loc === L} data-sveltekit-reload onclick={close}>{LOCALE_LABELS[loc]}</a>
					</li>
				{/each}
			</ul>

			<a href={l(L, '/reserve')} class="btn-outline" onclick={close}>{t(L, 'common.reserveCta')}</a>
		</aside>
	</div>
{/if}

<style>
	.SiteHeader {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--padding);
		z-index: var(--z-header);
		pointer-events: none;
		transform: translateY(0);
		transition:
			color 0.3s var(--ease-default),
			transform 0.45s var(--ease-default);
	}

	.SiteHeader.hidden {
		transform: translateY(-110%);
	}

	.SiteHeader[data-mode='light'] {
		color: var(--c-sky);
	}
	.SiteHeader[data-mode='dark'] {
		color: var(--c-navy);
	}

	/* Pin btn-outline's color to data-mode explicitly. If we relied on
	   `color: inherit`, the parent's animated color would propagate as a
	   continuously changing used value and the button's own `transition: color`
	   would lag behind logo / hamburger (which inherit directly without their
	   own transition). */
	.SiteHeader[data-mode='light'] :global(.btn-outline) {
		color: var(--c-sky);
	}
	.SiteHeader[data-mode='dark'] :global(.btn-outline) {
		color: var(--c-navy);
	}

	/* On light-mode header, the global :hover sets text and bg both to navy
	   → invisible. Override: invert text in light mode so hover stays legible. */
	.SiteHeader[data-mode='light'] :global(.btn-outline:hover),
	.SiteHeader[data-mode='light'] :global(.btn-outline:hover *) {
		color: var(--c-sky);
	}

	.SiteHeader > * {
		pointer-events: auto;
	}

	.SiteHeader__logo {
		display: flex;
		align-items: center;
		line-height: 0;
		color: inherit;
	}

	/* PC: bumped up so the header logo reads cleanly alongside the inline nav. */
	@media (min-width: 768px) {
		.SiteHeader__logo :global(svg) {
			width: 140px;
			height: auto;
		}
	}

	.SiteHeader__nav {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	/* Desktop inline nav links */
	.SiteHeader__links {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-5);
	}

	.SiteHeader__links a {
		font-size: var(--fs-h6);
		letter-spacing: 0.02em;
		color: inherit;
		text-decoration: none;
		transition: opacity 0.2s ease;
	}

	.SiteHeader__links a:hover {
		opacity: 0.7;
	}

	/* Language dropdown (desktop) */
	.LangDD { position: relative; }
	.LangDD__btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: var(--fs-h6);
		color: inherit;
		letter-spacing: 0.04em;
	}
	.LangDD__chev { width: 10px; height: 6px; transition: transform 0.25s var(--ease-default); }
	.LangDD__chev.is-open { transform: rotate(180deg); }
	/* padding-top keeps the 8px gap INSIDE the hover area so the menu
	   doesn't close while the cursor crosses from button to panel */
	.LangDD__menu { position: absolute; top: 100%; right: 0; padding-top: 8px; }
	.LangDD__panel {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--color-bg);
		color: var(--c-navy);
		border: 1px solid var(--color-line);
		border-radius: 8px;
		padding: 8px 14px;
		min-width: 52px;
	}
	.LangDD__panel a { font-size: var(--fs-h6); color: var(--c-navy); opacity: 0.8; letter-spacing: 0.04em; }
	.LangDD__panel a:hover { opacity: 1; }
	.LangDD__panel a.is-active { opacity: 0.3; pointer-events: none; }

	/* Language row (mobile menu panel) */
	.MenuPanel__langs {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.MenuPanel__langs a {
		font-size: var(--fs-h6);
		opacity: 0.5;
		transition: opacity 0.2s ease;
	}
	.MenuPanel__langs a.is-active {
		opacity: 1;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.MenuPanel__langs a:hover {
		opacity: 0.85;
	}

	/* Show desktop nav ≥ 768px, mobile nav below */
	.SiteHeader__nav--desktop {
		display: none;
	}

	@media (min-width: 768px) {
		.SiteHeader__nav--desktop {
			display: flex;
			gap: var(--space-5);
		}
		.SiteHeader__nav--mobile {
			display: none;
		}
	}

	.hamburger {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		align-items: stretch;
		gap: 7px;
		width: 25px;
		height: 25px;
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		color: inherit;
	}

	.hamburger span {
		display: block;
		width: 25px;
		height: 1px;
		background: currentColor;
	}

	.MenuOverlay {
		position: fixed;
		inset: 0;
		z-index: var(--z-overlay);
		display: flex;
		justify-content: stretch;
		/* Circle expanding from the exact top-right corner, opening toward bottom-left */
		clip-path: circle(0% at 100% 0%);
		animation: circleExpand 0.85s cubic-bezier(0.76, 0, 0.24, 1) forwards;
	}

	@keyframes circleExpand {
		to {
			clip-path: circle(160% at 100% 0%);
		}
	}

	.MenuPanel {
		position: relative;
		width: 100%;
		height: 100vh;
		padding: 96px var(--padding) var(--space-7);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-7);
		background: var(--c-navy);
		color: var(--c-sky);
	}

	/* Children fade in only after the circle has expanded — soft, airy easing */
	.MenuPanel > *,
	.MenuPanel__logo,
	.MenuPanel__close {
		opacity: 0;
		animation: itemFadeIn 1.05s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	.MenuPanel__logo {
		animation-delay: 0.78s;
	}
	.MenuPanel__close {
		animation-delay: 0.88s;
	}
	.MenuPanel__nav {
		animation-delay: 0.98s;
	}
	.MenuPanel > .btn-outline {
		animation-delay: 1.12s;
	}

	@keyframes itemFadeIn {
		from {
			opacity: 0;
			transform: translateY(22px);
			filter: blur(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	.MenuPanel__close {
		position: absolute;
		top: var(--space-4);
		right: var(--padding);
		width: 32px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--c-sky);
	}

	.MenuPanel__close span {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 22px;
		height: 1px;
		background: currentColor;
	}

	.MenuPanel__close span:nth-child(1) {
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.MenuPanel__close span:nth-child(2) {
		transform: translate(-50%, -50%) rotate(-45deg);
	}

	.MenuPanel__logo {
		position: absolute;
		top: var(--space-4);
		left: var(--padding);
		display: flex;
		align-items: center;
		line-height: 0;
		color: var(--c-sky);
	}

	.MenuPanel__nav ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.MenuPanel__nav a {
		font-size: var(--fs-h2);
		color: var(--c-sky);
		transition: opacity 0.2s;
	}

	.MenuPanel__nav a:hover {
		opacity: 0.7;
	}
</style>
