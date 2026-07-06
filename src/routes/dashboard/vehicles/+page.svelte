<script lang="ts">
	import { enhance } from '$app/forms';
	import { t, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);
	const STATUS = $derived({ active: t(L,'vh.stActive'), maintenance: t(L,'vh.stMaint'), retired: t(L,'vh.stRetired') } as Record<string, string>);
</script>

<svelte:head><title>{t(L, 'vh.title')} — MILES 158 Console</title></svelte:head>

<h1 class="DashTitle">{t(L, 'vh.title')}</h1>

<div class="Grid">
	<div class="Table">
		<table>
			<thead><tr><th>{t(L,'vh.hName')}</th><th>{t(L,'vh.hClass')}</th><th>{t(L,'vh.hReg')}</th><th>{t(L,'vh.hStatus')}</th></tr></thead>
			<tbody>
				{#each data.vehicles as v (v.id)}
					<tr>
						<td>{v.display_name}<br /><span class="sub">{v.subtitle ?? ''}</span></td>
						<td>{v.class_name}</td>
						<td class="mono">{v.registration_number}</td>
						<td>
							<form method="POST" action="?/setStatus" use:enhance class="statusForm">
								<input type="hidden" name="id" value={v.id} />
								<select name="status" onchange={(e) => e.currentTarget.form?.requestSubmit()}>
									{#each Object.entries(STATUS) as [val, label]}
										<option value={val} selected={v.status === val}>{label}</option>
									{/each}
								</select>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<aside class="Add">
		<h2>{t(L, 'vh.addTitle')}</h2>
		<form method="POST" action="?/create" use:enhance class="AddForm">
			<label>{t(L,'vh.fName')}<input name="display_name" required placeholder="Lexus LC500" /></label>
			<label>{t(L,'vh.fSubtitle')}<input name="subtitle" placeholder="Grand Tourer · V8 Coupé" /></label>
			<label>{t(L,'vh.fClass')}<select name="class_id" required>{#each data.classes as c}<option value={c.id}>{c.name_ja}</option>{/each}</select></label>
			<label>{t(L,'vh.fReg')}<input name="registration_number" required placeholder="名古屋 358 わ 00-00" /></label>
			<label>{t(L,'vh.fColor')}<input name="color" placeholder="Sonic Quartz" /></label>
			{#if form?.message}<p class="err">{form.message}</p>{/if}
			{#if form?.ok}<p class="ok">{t(L, 'vh.added')}</p>{/if}
			<button type="submit">{t(L, 'vh.add')}</button>
		</form>
	</aside>
</div>

<style>
	.DashTitle { font-size: var(--fs-h3); margin: 0 0 var(--space-5); }
	.Grid { display: grid; grid-template-columns: 1fr; gap: var(--space-5); }
	@media (min-width: 900px) { .Grid { grid-template-columns: 1fr 300px; align-items: start; } }
	.Table { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; overflow-x: auto; }
	table { border-collapse: collapse; width: 100%; font-size: var(--fs-h6); }
	th, td { padding: var(--space-3); text-align: left; border-bottom: 1px solid var(--color-line); }
	th { font-size: 11px; opacity: 0.6; text-transform: uppercase; }
	.sub { opacity: 0.5; font-size: 11px; }
	.mono { font-feature-settings: 'tnum'; }
	.statusForm select { border: 1px solid var(--color-line); border-radius: 4px; padding: 2px 6px; font-size: var(--fs-h6); }
	.Add { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-5); }
	.Add h2 { font-size: var(--fs-h6); text-transform: uppercase; opacity: 0.6; margin: 0 0 var(--space-4); }
	.AddForm { display: flex; flex-direction: column; gap: var(--space-3); }
	.AddForm label { display: flex; flex-direction: column; gap: 2px; font-size: 11px; opacity: 0.7; }
	.AddForm input, .AddForm select { border: 1px solid var(--color-line); border-radius: 4px; padding: var(--space-2); font-size: var(--fs-h6); }
	.AddForm button { background: var(--c-navy); color: var(--c-sky); border-radius: 6px; padding: var(--space-3); font-size: var(--fs-h6); }
	.err { color: #c0392b; font-size: var(--fs-h6); }
	.ok { color: #2a7; font-size: var(--fs-h6); }
</style>
