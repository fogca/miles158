<script lang="ts">
	import { enhance } from '$app/forms';
	import { t, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);
</script>

<svelte:head><title>{data.needsBootstrap ? t(L, 'lg.setupTitle') : t(L, 'lg.loginTitle')} — MILES 158 Console</title></svelte:head>

<div class="Login">
	<div class="Login__card">
		<p class="Login__brand">MILES 158 <span>Console</span></p>
		{#if data.needsBootstrap}
			<h1 class="Login__title">{t(L, 'lg.setupTitle')}</h1>
			<p class="Login__lead">{t(L, 'lg.setupLead')}</p>
			<form method="POST" action="?/bootstrap" use:enhance class="Login__form">
				<label>{t(L,'lg.name')}<input name="name" /></label>
				<label>{t(L,'lg.email')}<input name="email" type="email" required /></label>
				<label>{t(L,'lg.password8')}<input name="password" type="password" required minlength="8" /></label>
				{#if form?.message}<p class="Login__error">{form.message}</p>{/if}
				<button type="submit" class="Login__btn">{t(L, 'lg.createBtn')}</button>
			</form>
		{:else}
			<h1 class="Login__title">{t(L, 'lg.loginTitle')}</h1>
			<form method="POST" action="?/login" use:enhance class="Login__form">
				<label>{t(L,'lg.email')}<input name="email" type="email" required /></label>
				<label>{t(L,'lg.password')}<input name="password" type="password" required /></label>
				{#if form?.message}<p class="Login__error">{form.message}</p>{/if}
				<button type="submit" class="Login__btn">{t(L, 'lg.loginBtn')}</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.Login {
		min-height: 100vh;
		display: grid;
		place-items: center;
		background: #f6f7f9;
		padding: var(--space-6);
	}
	.Login__card {
		width: 100%;
		max-width: 380px;
		background: #fff;
		border: 1px solid var(--color-line);
		border-radius: 10px;
		padding: var(--space-8) var(--space-7);
	}
	.Login__brand {
		font-size: var(--fs-h5);
		letter-spacing: 0.04em;
		margin-bottom: var(--space-6);
	}
	.Login__brand span {
		opacity: 0.5;
		font-size: var(--fs-h6);
	}
	.Login__title {
		font-size: var(--fs-h3);
		margin: 0 0 var(--space-2);
	}
	.Login__lead {
		font-size: var(--fs-h6);
		opacity: 0.65;
		margin-bottom: var(--space-5);
	}
	.Login__form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}
	.Login__form label {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--fs-h6);
		opacity: 0.75;
	}
	.Login__form input {
		border: 1px solid var(--color-line);
		border-radius: 6px;
		padding: var(--space-3);
		font-size: var(--fs-h5);
		opacity: 1;
	}
	.Login__error {
		color: #c0392b;
		font-size: var(--fs-h6);
	}
	.Login__btn {
		margin-top: var(--space-2);
		background: var(--c-navy);
		color: var(--c-sky);
		border-radius: 6px;
		padding: var(--space-3);
		font-size: var(--fs-h5);
	}
</style>
