<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import LogoSub from './LogoSub.svelte';

	let menuOpen = $state(false);
	let mode = $state<'light' | 'dark'>('light');
	let atTop = $state(true);

	// On the home page, while the user is at the very top, the big Hero logo
	// is visible — hide the fixed header so it doesn't compete with it.
	let hidden = $derived(atTop && page.url.pathname === '/');

	type Item = { label: string; href: string };
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

				const top = window.scrollY < 60;
				if (top !== atTop) atTop = top;
			};

			gsap.ticker.add(tick);
			cleanup = () => gsap.ticker.remove(tick);
		})();

		return () => cleanup?.();
	});
</script>

<header class="SiteHeader" class:hidden data-mode={mode}>
	<a href="/" class="SiteHeader__logo" aria-label="Home" onclick={close}>
		<LogoSub width={120} title="MILES 158" />
	</a>

	<nav class="SiteHeader__nav" aria-label="Primary">
		<a
			href="/reserve"
			class="btn-glass btn-glass--sm {mode === 'dark' ? 'btn-glass--dark' : ''}"
			lang="ja"
		>来店予約</a>

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
			<a href="/" class="MenuPanel__logo" aria-label="Home" onclick={close}>
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
						<li><a href={item.href} onclick={close}>{item.label}</a></li>
					{/each}
				</ul>
			</nav>

			<a href="/reserve" class="btn-glass" onclick={close} lang="ja">来店予約</a>
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

	.SiteHeader > * {
		pointer-events: auto;
	}

	.SiteHeader__logo {
		display: flex;
		align-items: center;
		line-height: 0;
		color: inherit;
	}

	.SiteHeader__nav {
		display: flex;
		align-items: center;
		gap: var(--space-3);
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
		background: rgba(0, 10, 38, 0.45);
		backdrop-filter: blur(18px);
		-webkit-backdrop-filter: blur(18px);
		z-index: var(--z-overlay);
		display: flex;
		justify-content: flex-end;
		animation: fadeIn 0.3s var(--ease-default);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.MenuPanel {
		position: relative;
		width: min(420px, 100vw);
		height: 100vh;
		padding: 96px var(--padding) var(--space-7);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-7);
		background: var(--c-navy);
		color: var(--c-sky);
		animation: slideIn 0.4s var(--ease-default);
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

	@keyframes slideIn {
		from {
			transform: translateX(40px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
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
