<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatJpy, formatJst } from '$lib/time';
	import { statusLabel } from '$lib/booking/labels';
	import { t, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);
	const r = $derived(data.detail.reservation);
	const c = $derived(data.detail.customer);
	const v = $derived(data.detail.vehicle);

	const advanceStates = $derived(data.next.filter((s) => s !== 'cancelled'));
	const canCancel = $derived(data.next.includes('cancelled'));
</script>

<svelte:head><title>{r.code} — MILES 158 Console</title></svelte:head>

<a class="Back" href="/dashboard/bookings">{t(L, 'dt.back')}</a>

<div class="Detail">
	<div class="Detail__main">
		<header class="Detail__head">
			<div>
				<h1 class="Detail__code">{r.code}</h1>
				<span class="Badge Badge--{r.status}">{statusLabel(r.status, L)}</span>
			</div>
		</header>

		{#if form?.message}<p class="Detail__error">{form.message}</p>{/if}

		<section class="Box">
			<h2>{t(L, 'dt.vehiclePeriod')}</h2>
			<dl class="KV">
				<div><dt>{t(L,'dt.kVehicle')}</dt><dd>{v?.display_name ?? '—'}</dd></div>
				<div><dt>{t(L,'dt.kPickup')}</dt><dd>{r.pickup_scheduled_at ? formatJst(r.pickup_scheduled_at, L) : '—'}</dd></div>
				<div><dt>{t(L,'dt.kReturn')}</dt><dd>{r.return_scheduled_at ? formatJst(r.return_scheduled_at, L) : '—'}</dd></div>
				<div><dt>{t(L,'dt.kMileage')}</dt><dd>{r.mileage_start_km ?? '—'} → {r.mileage_end_km ?? '—'} km</dd></div>
			</dl>
		</section>

		<section class="Box">
			<h2>{t(L, 'dt.customer')}</h2>
			{#if c}
				<dl class="KV">
					<div><dt>{t(L,'dt.kName')}</dt><dd>{c.name_family} {c.name_given}</dd></div>
					<div><dt>{t(L,'dt.kContact')}</dt><dd>{c.email ?? ''} / {c.phone ?? ''}</dd></div>
					<div><dt>{t(L,'dt.kAddress')}</dt><dd>{c.address ?? '—'}</dd></div>
					<div><dt>{t(L,'dt.kLicense')}</dt><dd>{c.license_kind ?? ''} {c.license_number ?? ''}</dd></div>
				</dl>
			{:else}<p class="muted">{t(L, 'dt.unregistered')}</p>{/if}
		</section>

		<section class="Box">
			<h2>{t(L, 'dt.price')}</h2>
			<dl class="KV">
				<div><dt>{t(L,'dt.kBase')}</dt><dd>{formatJpy(r.base_amount ?? 0)}</dd></div>
				<div><dt>{t(L,'dt.kOptions')}</dt><dd>{formatJpy(r.options_amount ?? 0)}</dd></div>
				<div><dt>{t(L,'dt.kTax')}</dt><dd>{formatJpy(r.tax_amount ?? 0)}</dd></div>
				<div class="KV__total"><dt>{t(L,'dt.kTotal')}</dt><dd>{formatJpy(r.total_amount ?? 0)}</dd></div>
				<div><dt>{t(L,'dt.kDeposit')}</dt><dd>{formatJpy(r.deposit_amount ?? 0)}</dd></div>
				{#if (r.cancellation_fee ?? 0) > 0}<div><dt>{t(L,'dt.kCancelFee')}</dt><dd>{formatJpy(r.cancellation_fee ?? 0)}</dd></div>{/if}
				{#if r.mileage_overage_amount != null}<div><dt>{t(L,'dt.kMileageOverage')}</dt><dd>{r.mileage_overage_km} km / {formatJpy(r.mileage_overage_amount)}</dd></div>{/if}
			</dl>
			{#if data.detail.options.length}
				<ul class="Opts">
					{#each data.detail.options as o}
						<li>{o.name_ja} ×{o.quantity} — {formatJpy(o.line_amount)}</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="Box">
			<h2>{t(L, 'dt.payments')}</h2>
			{#each data.detail.payments as p}
				<div class="Pay-row">
					<span>{p.provider}/{p.method} ({p.kind})</span>
					<span>{p.status}</span>
					<span class="mono">{formatJpy(Number(p.authorized_amount ?? 0))}</span>
				</div>
			{:else}<p class="muted">{t(L, 'dt.none')}</p>{/each}
		</section>

		<section class="Box">
			<h2>{t(L, 'dt.history')}</h2>
			<ul class="Hist">
				{#each data.detail.history as h}
					<li>
						<span class="mono">{formatJst(h.created_at, L)}</span>
						<span>{h.from_status ?? '—'} → <b>{statusLabel(h.to_status)}</b></span>
						<span class="muted">{h.triggered_by}{h.reason ? ` · ${h.reason}` : ''}</span>
					</li>
				{/each}
			</ul>
		</section>
	</div>

	<!-- Actions -->
	<aside class="Detail__actions">
		<h2>{t(L, 'dt.actions')}</h2>
		{#if advanceStates.length === 0 && !canCancel}
			<p class="muted">{t(L, 'dt.noActions')}</p>
		{/if}
		{#each advanceStates as to (to)}
			<form method="POST" action="?/advance" use:enhance class="Act">
				<input type="hidden" name="to" value={to} />
				{#if to === 'checked_out'}
					<label>{t(L,'dt.mOutKm')}<input name="mileage_start_km" type="number" /></label>
					<label>{t(L,'dt.mOutFuel')}<input name="fuel_start" type="number" min="0" max="8" /></label>
				{:else if to === 'returned'}
					<label>{t(L,'dt.mInKm')}<input name="mileage_end_km" type="number" /></label>
					<label>{t(L,'dt.mInFuel')}<input name="fuel_end" type="number" min="0" max="8" /></label>
				{/if}
				<button type="submit" class="Act__btn">{t(L, ('tr.' + to) as any) ?? to}</button>
			</form>
		{/each}

		{#if canCancel}
			<form method="POST" action="?/cancel" use:enhance class="Act Act--danger" onsubmit={(e) => { if (!confirm(t(L, 'dt.cancelConfirm'))) e.preventDefault(); }}>
				<button type="submit" class="Act__btn Act__btn--danger">{t(L, 'dt.cancelBtn')}</button>
			</form>
		{/if}
	</aside>
</div>

<style>
	.Back { font-size: var(--fs-h6); opacity: 0.6; display: inline-block; margin-bottom: var(--space-4); }
	.Detail { display: grid; grid-template-columns: 1fr; gap: var(--space-6); }
	@media (min-width: 900px) { .Detail { grid-template-columns: 1fr 280px; align-items: start; } }
	.Detail__head { display: flex; justify-content: space-between; margin-bottom: var(--space-4); }
	.Detail__code { font-size: var(--fs-h3); margin: 0 0 var(--space-2); font-feature-settings: 'tnum'; }
	.Detail__error { color: #c0392b; font-size: var(--fs-h6); margin-bottom: var(--space-3); }
	.Box { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-5); margin-bottom: var(--space-4); }
	.Box h2 { font-size: var(--fs-h6); text-transform: uppercase; opacity: 0.6; margin: 0 0 var(--space-3); letter-spacing: 0.04em; }
	.KV > div { display: flex; justify-content: space-between; gap: var(--space-4); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-line); font-size: var(--fs-h6); }
	.KV dt { opacity: 0.6; }
	.KV dd { margin: 0; text-align: right; }
	.KV__total { font-size: var(--fs-h5) !important; font-weight: 500; }
	.Opts { margin-top: var(--space-3); font-size: var(--fs-h6); opacity: 0.8; display: flex; flex-direction: column; gap: var(--space-1); }
	.Pay-row { display: flex; justify-content: space-between; gap: var(--space-3); font-size: var(--fs-h6); padding: var(--space-2) 0; border-bottom: 1px solid var(--color-line); }
	.Hist { display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--fs-h6); }
	.Hist li { display: flex; flex-direction: column; gap: 2px; padding-bottom: var(--space-2); border-bottom: 1px solid var(--color-line); }
	.mono { font-feature-settings: 'tnum'; }
	.muted { opacity: 0.5; font-size: var(--fs-h6); }
	.Detail__actions { background: #fff; border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-5); position: sticky; top: var(--space-6); }
	.Detail__actions h2 { font-size: var(--fs-h6); text-transform: uppercase; opacity: 0.6; margin: 0 0 var(--space-4); }
	.Act { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
	.Act label { font-size: 11px; opacity: 0.7; display: flex; flex-direction: column; gap: 2px; }
	.Act input { border: 1px solid var(--color-line); border-radius: 4px; padding: var(--space-2); font-size: var(--fs-h6); }
	.Act__btn { background: var(--c-navy); color: var(--c-sky); border-radius: 6px; padding: var(--space-3); font-size: var(--fs-h6); }
	.Act__btn--danger { background: #c0392b; }
	.Badge { font-size: 10px; padding: 2px 8px; border-radius: 999px; background: #e8ecf0; display: inline-block; }
	.Badge--confirmed { background: #d6e8d6; }
	.Badge--held, .Badge--pending_payment { background: #f3e4c4; }
	.Badge--cancelled, .Badge--no_show { background: #f0d6d2; }
	.Badge--active, .Badge--checked_out { background: #d2e0f0; }
</style>
