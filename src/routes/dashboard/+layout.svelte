<script lang="ts">
	import { page } from '$app/state';
	import { t, LOCALES, LOCALE_LABELS, type Locale } from '$lib/i18n';
	import type { LayoutData } from './$types';
	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const L = $derived((data.locale ?? 'ja') as Locale);
	const nav = $derived([
		{ href: '/dashboard', label: t(L, 'dash.navTimeline'), exact: true },
		{ href: '/dashboard/bookings', label: t(L, 'dash.navBookings'), exact: false },
		{ href: '/dashboard/vehicles', label: t(L, 'dash.navVehicles'), exact: false }
	]);
	const isActive = (href: string, exact: boolean) =>
		exact ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<div class="Admin">
	{#if data.staff}
		<header class="Admin__bar">
			<a class="Admin__brand" href="/dashboard">MILES 158 <span>Console</span></a>
			<nav class="Admin__nav">
				{#each nav as n (n.href)}
					<a href={n.href} class:is-active={isActive(n.href, n.exact)}>{n.label}</a>
				{/each}
			</nav>
			<div class="Admin__user">
				<span class="Admin__name">{data.staff.name}</span>
				<span class="Admin__role">{data.staff.role}</span>
				<span class="Admin__langs">{#each LOCALES as loc (loc)}<a href="/dashboard/lang?to={loc}" class:is-active={loc === L} data-sveltekit-reload>{LOCALE_LABELS[loc]}</a>{/each}</span>
				<form method="POST" action="/dashboard/logout">
					<button type="submit" class="Admin__logout">{t(L, 'dash.logout')}</button>
				</form>
			</div>
		</header>
		<main class="Admin__main">
			{@render children()}
		</main>
	{:else}
		{@render children()}
	{/if}
</div>

<style>
	.Admin {
		min-height: 100vh;
		background: #f6f7f9;
		color: var(--c-navy);
	}
	.Admin__bar {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		padding: var(--space-3) var(--space-6);
		background: var(--c-navy);
		color: var(--c-sky);
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.Admin__brand {
		font-size: var(--fs-h5);
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.Admin__brand span {
		opacity: 0.5;
		font-size: var(--fs-h6);
	}
	.Admin__nav {
		display: flex;
		gap: var(--space-2);
		flex: 1;
	}
	.Admin__nav a {
		font-size: var(--fs-h6);
		padding: var(--space-2) var(--space-3);
		border-radius: 6px;
		opacity: 0.7;
	}
	.Admin__nav a.is-active {
		background: rgba(255, 255, 255, 0.12);
		opacity: 1;
	}
	.Admin__user {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--fs-h6);
	}
	.Admin__role {
		opacity: 0.5;
		text-transform: uppercase;
		font-size: 10px;
		border: 1px solid currentColor;
		padding: 1px 6px;
		border-radius: 999px;
	}
	.Admin__langs { display: inline-flex; gap: 8px; margin-right: 4px; }
	.Admin__langs a { opacity: 0.5; font-size: var(--fs-h6); }
	.Admin__langs a.is-active { opacity: 1; text-decoration: underline; text-underline-offset: 3px; }
	.Admin__logout {
		font-size: var(--fs-h6);
		opacity: 0.7;
		text-decoration: underline;
	}
	.Admin__main {
		padding: var(--space-6);
		max-width: 1400px;
		margin: 0 auto;
	}
	@media (max-width: 640px) {
		.Admin__bar {
			flex-wrap: wrap;
			gap: var(--space-3);
		}
		.Admin__nav {
			order: 3;
			width: 100%;
		}
	}
</style>
