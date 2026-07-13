<script lang="ts">
	import { enhance } from '$app/forms';
	import { t, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';
	let { data, form }: { data: PageData; form: ActionData } = $props();

	const L = $derived((data.locale ?? 'ja') as Locale);
	const WD = $derived(L === 'en' ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] : L === 'zh' ? ['日','一','二','三','四','五','六'] : ['日','月','火','水','木','金','土']);
	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
	const ymd = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

	const cells = $derived.by(() => {
		const lead = new Date(`${data.year}-${pad(data.month + 1)}-01T00:00:00+09:00`).getDay();
		const dim = new Date(data.year, data.month + 1, 0).getDate();
		const out: (string | null)[] = [];
		for (let b = 0; b < lead; b++) out.push(null);
		for (let d = 1; d <= dim; d++) out.push(ymd(data.year, data.month, d));
		return out;
	});

	// ---- staged blackout editing ----
	const originalBlackouts = $derived(
		new Set(
			Object.entries(data.dayMap)
				.filter(([, v]) => v.type === 'blackout')
				.map(([d]) => d)
		)
	);
	const dataSig = $derived(`${data.vehicleId}|${data.offset}|${[...originalBlackouts].sort().join(',')}`);
	let blackoutSet = $state(new Set<string>());
	let sig = $state('');
	$effect(() => {
		// Re-sync staged set whenever the loaded month/vehicle (or saved data) changes.
		if (dataSig !== sig) {
			blackoutSet = new Set(originalBlackouts);
			sig = dataSig;
		}
	});

	const dirty = $derived(
		blackoutSet.size !== originalBlackouts.size ||
			[...blackoutSet].some((d) => !originalBlackouts.has(d))
	);
	const pendingCount = $derived(
		[...new Set([...blackoutSet, ...originalBlackouts])].filter(
			(d) => blackoutSet.has(d) !== originalBlackouts.has(d)
		).length
	);
	const desiredCsv = $derived([...blackoutSet].join(','));

	function toggle(d: string) {
		const s = new Set(blackoutSet);
		if (s.has(d)) s.delete(d);
		else s.add(d);
		blackoutSet = s;
	}
	function reset() {
		blackoutSet = new Set(originalBlackouts);
	}
	function navGuard(e: MouseEvent) {
		if (dirty && !confirm(t(L, 'dash.navGuard'))) {
			e.preventDefault();
		}
	}

	const navUrl = (off: number) => `?vehicle=${data.vehicleId}&m=${off}`;
	const vehUrl = (id: string) => `?vehicle=${id}&m=${data.offset}`;
	const summaryCards = $derived([
		{ key: 'held', label: t(L, 'dash.sumHeld') },
		{ key: 'confirmed', label: t(L, 'dash.sumConfirmed') },
		{ key: 'checked_out', label: t(L, 'dash.sumCheckedOut') },
		{ key: 'active', label: t(L, 'dash.sumActive') },
		{ key: 'returned', label: t(L, 'dash.sumReturned') },
		{ key: 'completed', label: t(L, 'dash.sumCompleted') }
	]);
</script>

<svelte:head><title>{t(L, 'dash.title')} — MILES 158 Console</title></svelte:head>

<div class="Head">
	<h1 class="DashTitle">{t(L, 'dash.title')}</h1>
	<a class="cta" href="/dashboard/bookings/new" onclick={navGuard}>{t(L, 'dash.manualCta')}</a>
</div>

<div class="Cards">
	{#each summaryCards as c (c.key)}
		<div class="Card"><span class="Card__num">{data.summary[c.key] ?? 0}</span><span class="Card__label">{c.label}</span></div>
	{/each}
</div>

<div class="Vehicles">
	{#each data.vehicles as v (v.id)}
		<a href={vehUrl(v.id)} onclick={navGuard} class="Veh" class:is-active={v.id === data.vehicleId}>
			<span class="Veh__name">{v.display_name}</span>
			<span class="Veh__class">{v.class_name}</span>
		</a>
	{/each}
</div>

<div class="CalCard">
	<div class="CalBar">
		<a class="nav" href={navUrl(data.offset - 1)} onclick={navGuard} aria-label={t(L, 'cal.prev')}>‹</a>
		<span class="CalBar__title">{data.monthLabel}</span>
		<a class="nav" href={navUrl(data.offset + 1)} onclick={navGuard} aria-label={t(L, 'cal.next')}>›</a>
	</div>

	<div class="Legend">
		<span><i class="sw sw--rental"></i> {t(L, 'dash.legRental')}</span>
		<span><i class="sw sw--buffer"></i> {t(L, 'dash.legBuffer')}</span>
		<span><i class="sw sw--blackout"></i> {t(L, 'dash.legBlackout')}</span>
		<span class="Legend__hint">{t(L, 'dash.legHint')}</span>
	</div>

	{#if form?.conflicts?.length}
		<p class="err">{t(L, 'dash.conflictMsg', { days: form.conflicts.join(', ') })}</p>
	{:else if form?.ok}
		<p class="ok">{t(L, 'dash.savedMsg', { a: form.added ?? 0, r: form.removed ?? 0 })}</p>
	{/if}

	<div class="Wd">{#each WD as w, i (i)}<span class:we={i === 0 || i === 6}>{w}</span>{/each}</div>
	<div class="Grid">
		{#each cells as d, i (i)}
			{#if !d}
				<div class="cell cell--blank"></div>
			{:else}
				{@const slot = data.dayMap[d]}
				{@const past = d < data.today}
				{@const day = Number(d.slice(8))}
				{#if slot && slot.type === 'rental'}
					<a class="cell cell--rental" href={`/dashboard/bookings/${slot.resId}`} onclick={navGuard} title={slot.code}>
						<span class="cell__d">{day}</span><span class="cell__tag">{slot.code.slice(5)}</span>
					</a>
				{:else if slot && slot.type === 'buffer'}
					<div class="cell cell--buffer"><span class="cell__d">{day}</span><span class="cell__tag">{t(L, 'dash.cellMaint')}</span></div>
				{:else if slot && slot.type === 'maintenance'}
					<div class="cell cell--blackout"><span class="cell__d">{day}</span><span class="cell__tag">{t(L, 'dash.cellMaint')}</span></div>
				{:else}
					{@const isBlk = blackoutSet.has(d)}
					{@const pend = isBlk !== originalBlackouts.has(d)}
					{#if past}
						<div class="cell {isBlk ? 'cell--blackout' : 'cell--past'}">
							<span class="cell__d">{day}</span>{#if isBlk}<span class="cell__tag">{t(L, 'dash.cellBlocked')}</span>{/if}
						</div>
					{:else}
						<button
							type="button"
							class="cell {isBlk ? 'cell--blackout' : 'cell--open'}"
							class:is-pending={pend}
							onclick={() => toggle(d)}
							title={isBlk ? t(L, 'dash.tipUnblock') : t(L, 'dash.tipBlock')}
						>
							<span class="cell__d">{day}</span>
							{#if isBlk}<span class="cell__tag">{t(L, 'dash.cellBlocked')}</span>{:else}<span class="cell__add">{t(L, 'dash.cellAdd')}</span>{/if}
							{#if pend}<span class="cell__pend" aria-label={t(L, 'dash.pending')}></span>{/if}
						</button>
					{/if}
				{/if}
			{/if}
		{/each}
	</div>
</div>

<!-- Sticky save bar -->
<div class="SaveBar" class:is-dirty={dirty}>
	<span class="SaveBar__status">{dirty ? t(L, 'dash.unsaved', { n: pendingCount }) : t(L, 'dash.allSaved')}</span>
	<div class="SaveBar__actions">
		<button type="button" class="SaveBar__reset" onclick={reset} disabled={!dirty}>{t(L, 'dash.reset')}</button>
		<form method="POST" action="?/saveBlackouts" use:enhance>
			<input type="hidden" name="vehicleId" value={data.vehicleId} />
			<input type="hidden" name="monthStart" value={data.monthStart} />
			<input type="hidden" name="monthEnd" value={data.monthEnd} />
			<input type="hidden" name="dates" value={desiredCsv} />
			<button type="submit" class="SaveBar__save" disabled={!dirty}>{t(L, 'dash.save')}</button>
		</form>
	</div>
</div>

<style>
	.Head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); }
	.DashTitle { font-size: var(--fs-h3); margin: 0; }
	.cta { background: var(--c-navy); color: var(--c-sky); border-radius: 8px; padding: var(--space-3) var(--space-5); font-size: var(--fs-h6); }
	.Cards { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-5); }
	.Card { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-3) var(--space-5); display: flex; flex-direction: column; min-width: 84px; }
	.Card__num { font-size: var(--fs-h2); font-feature-settings: 'tnum'; line-height: 1; }
	.Card__label { font-size: var(--fs-h6); opacity: 0.6; margin-top: var(--space-1); }
	.Vehicles { display: flex; gap: var(--space-3); margin-bottom: var(--space-5); flex-wrap: wrap; }
	.Veh { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-3) var(--space-5); display: flex; flex-direction: column; }
	.Veh.is-active { border-color: var(--c-navy); box-shadow: inset 0 0 0 1px var(--c-navy); }
	.Veh__name { font-size: var(--fs-h5); }
	.Veh__class { font-size: 11px; opacity: 0.55; }
	.CalCard { background: #fff; border: 1px solid var(--color-line); border-radius: 10px; padding: var(--space-6); }
	.CalBar { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4); }
	.CalBar__title { font-size: var(--fs-h3); font-feature-settings: 'tnum'; }
	.nav { width: 40px; height: 40px; border: 1px solid var(--color-line); border-radius: 999px; display: grid; place-items: center; font-size: var(--fs-h3); }
	.Legend { display: flex; flex-wrap: wrap; gap: var(--space-4); font-size: var(--fs-h6); opacity: 0.75; margin-bottom: var(--space-4); align-items: center; }
	.Legend__hint { opacity: 0.6; }
	.sw { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: -1px; margin-right: 4px; }
	.sw--rental { background: var(--c-navy); }
	.sw--buffer { background: repeating-linear-gradient(45deg, #c8d2dc, #c8d2dc 3px, #dfe5ea 3px, #dfe5ea 6px); }
	.sw--blackout { background: #c0392b; }
	.err { color: #c0392b; font-size: var(--fs-h6); margin-bottom: var(--space-3); }
	.ok { color: #2a7d52; font-size: var(--fs-h6); margin-bottom: var(--space-3); }
	.Wd { display: grid; grid-template-columns: repeat(7, 1fr); font-size: var(--fs-h6); opacity: 0.5; margin-bottom: 2px; }
	.Wd span { text-align: center; }
	.Wd .we { opacity: 0.8; }
	.Grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--space-2); }
	.cell { position: relative; min-height: 64px; border: 1px solid var(--color-line); border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; background: #fff; padding: var(--space-2); width: 100%; }
	.cell__d { font-size: var(--fs-h5); font-feature-settings: 'tnum'; line-height: 1; }
	.cell__tag { font-size: 9px; }
	.cell--blank { border: none; background: transparent; }
	.cell--past { opacity: 0.3; }
	.cell--rental { background: var(--c-navy); color: var(--c-sky); border-color: var(--c-navy); }
	.cell--buffer { background: repeating-linear-gradient(45deg, #eef1f4, #eef1f4 4px, #f7f9fb 4px, #f7f9fb 8px); color: #9aa3ad; }
	.cell--blackout { background: #faf0ee; color: #c0392b; border-color: #e7b9b2; cursor: pointer; }
	.cell--open { cursor: pointer; transition: border-color var(--duration-fast) var(--ease-default); }
	.cell--open .cell__add { font-size: 9px; opacity: 0; }
	.cell--open:hover { border-color: var(--c-navy); }
	.cell--open:hover .cell__add { opacity: 0.55; }
	.cell.is-pending { box-shadow: 0 0 0 2px var(--color-accent); }
	.cell__pend { position: absolute; top: 4px; right: 4px; width: 7px; height: 7px; border-radius: 999px; background: var(--color-accent); }
	.SaveBar {
		position: sticky;
		bottom: var(--space-4);
		margin-top: var(--space-5);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		background: #fff;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		padding: var(--space-2) var(--space-3) var(--space-2) var(--space-5);
		box-shadow: 0 8px 28px rgba(0, 10, 38, 0.12);
	}
	.SaveBar.is-dirty { border-color: var(--color-accent); }
	.SaveBar__status { font-size: var(--fs-h6); opacity: 0.7; }
	.SaveBar__actions { display: flex; align-items: center; gap: var(--space-2); }
	.SaveBar__reset { font-size: var(--fs-h6); padding: var(--space-2) var(--space-4); border-radius: 999px; border: 1px solid var(--color-line); }
	.SaveBar__reset:disabled { opacity: 0.35; }
	.SaveBar__save { font-size: var(--fs-h6); padding: var(--space-3) var(--space-7); border-radius: 999px; background: var(--c-navy); color: var(--c-sky); }
	.SaveBar__save:disabled { opacity: 0.35; }
</style>
