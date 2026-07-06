<script lang="ts">
	import { enhance } from '$app/forms';
	import { t, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);
</script>

<svelte:head><title>{t(L, 'nb.title')} — MILES 158 Console</title></svelte:head>

<a class="Back" href="/dashboard">{t(L, 'nb.back')}</a>
<h1 class="DashTitle">{t(L, 'nb.title')}</h1>
<p class="lead">{t(L, 'nb.lead')}</p>

<form method="POST" use:enhance class="MForm">
	<div class="row">
		<label>{t(L,'nb.vehicle')}<select name="vehicleId" required>
			<option value="">{t(L, 'nb.select')}</option>
			{#each data.vehicles as v (v.id)}<option value={v.id}>{v.display_name}（{v.class_name}）</option>{/each}
		</select></label>
	</div>
	<div class="row">
		<label>{t(L,'nb.pickupDate')}<input name="pickupDate" type="date" required /></label>
		<label>{t(L,'nb.time')}<input name="pickupTime" type="time" value="10:00" /></label>
		<label>{t(L,'nb.returnDate')}<input name="returnDate" type="date" required /></label>
		<label>{t(L,'nb.time')}<input name="returnTime" type="time" value="20:00" /></label>
	</div>
	<div class="row">
		<label>{t(L,'nb.family')}<input name="nameFamily" required /></label>
		<label>{t(L,'nb.given')}<input name="nameGiven" /></label>
		<label>{t(L,'nb.phone')}<input name="phone" /></label>
		<label>{t(L,'nb.email')}<input name="email" type="email" /></label>
	</div>
	<label class="cdw"><input type="checkbox" name="cdw" checked /> {t(L, 'nb.cdw')}</label>
	{#if form?.message}<p class="err">{form.message}</p>{/if}
	<button type="submit">{t(L, 'nb.submit')}</button>
</form>

<style>
	.Back { font-size: var(--fs-h6); opacity: 0.6; display: inline-block; margin-bottom: var(--space-3); }
	.DashTitle { font-size: var(--fs-h3); margin: 0 0 var(--space-2); }
	.lead { font-size: var(--fs-h6); opacity: 0.7; margin-bottom: var(--space-5); max-width: 60ch; }
	.MForm { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-6); max-width: 720px; display: flex; flex-direction: column; gap: var(--space-4); }
	.row { display: flex; flex-wrap: wrap; gap: var(--space-3); }
	label { display: flex; flex-direction: column; gap: 2px; font-size: 11px; opacity: 0.75; }
	input, select { border: 1px solid var(--color-line); border-radius: 4px; padding: var(--space-2) var(--space-3); font-size: var(--fs-h6); }
	.cdw { flex-direction: row; align-items: center; gap: var(--space-2); font-size: var(--fs-h6); opacity: 1; }
	.err { color: #c0392b; font-size: var(--fs-h6); }
	.MForm button { background: var(--c-navy); color: var(--c-sky); border-radius: 6px; padding: var(--space-3); font-size: var(--fs-h5); align-self: flex-start; padding-inline: var(--space-7); }
</style>
