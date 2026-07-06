<script lang="ts">
	import { formatJpy, formatJst } from '$lib/time';
	import { statusLabel } from '$lib/booking/labels';
	import { t, type Locale } from '$lib/i18n';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);
</script>

<svelte:head><title>{t(L, 'bk.title')} — MILES 158 Console</title></svelte:head>

<div class="Head">
	<h1 class="DashTitle">{t(L, 'bk.title')}</h1>
	<form method="GET" class="Filter">
		<input name="code" placeholder={t(L, 'bk.search')} value={data.filter.code} />
		<select name="status">
			<option value="">{t(L, 'bk.allStatus')}</option>
			{#each data.statuses as s (s)}
				<option value={s} selected={data.filter.status === s}>{statusLabel(s, L)}</option>
			{/each}
		</select>
		<button type="submit">{t(L, 'bk.filter')}</button>
	</form>
</div>

<div class="Table">
	<table>
		<thead>
			<tr>
				<th>{t(L,'bk.hCode')}</th><th>{t(L,'bk.hStatus')}</th><th>{t(L,'bk.hVehicle')}</th><th>{t(L,'bk.hCustomer')}</th><th>{t(L,'bk.hPickup')}</th><th>{t(L,'bk.hReturn')}</th><th class="r">{t(L,'bk.hTotal')}</th>
			</tr>
		</thead>
		<tbody>
			{#each data.rows as r (r.id)}
				<tr onclick={() => (window.location.href = `/dashboard/bookings/${r.id}`)}>
					<td class="mono">{r.code}</td>
					<td><span class="Badge Badge--{r.status}">{statusLabel(r.status, L)}</span></td>
					<td>{r.vehicle ?? '—'}</td>
					<td>{r.customer ?? '—'}</td>
					<td>{r.pickup_scheduled_at ? formatJst(r.pickup_scheduled_at, L) : '—'}</td>
					<td>{r.return_scheduled_at ? formatJst(r.return_scheduled_at, L) : '—'}</td>
					<td class="r mono">{r.total_amount != null ? formatJpy(r.total_amount) : '—'}</td>
				</tr>
			{:else}
				<tr><td colspan="7" class="empty">{t(L, 'bk.empty')}</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.Head {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-4);
		flex-wrap: wrap;
		margin-bottom: var(--space-5);
	}
	.DashTitle {
		font-size: var(--fs-h3);
		margin: 0;
	}
	.Filter {
		display: flex;
		gap: var(--space-2);
	}
	.Filter input,
	.Filter select,
	.Filter button {
		border: 1px solid var(--color-line);
		border-radius: 6px;
		padding: var(--space-2) var(--space-3);
		font-size: var(--fs-h6);
		background: #fff;
	}
	.Filter button {
		background: var(--c-navy);
		color: var(--c-sky);
	}
	.Table {
		background: #fff;
		border: 1px solid var(--color-line);
		border-radius: 8px;
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
		font-size: var(--fs-h6);
	}
	th,
	td {
		padding: var(--space-3);
		text-align: left;
		border-bottom: 1px solid var(--color-line);
		white-space: nowrap;
	}
	th {
		font-size: 11px;
		opacity: 0.6;
		text-transform: uppercase;
	}
	tbody tr {
		cursor: pointer;
	}
	tbody tr:hover {
		background: #f6f7f9;
	}
	.mono {
		font-feature-settings: 'tnum';
	}
	.r {
		text-align: right;
	}
	.empty {
		text-align: center;
		opacity: 0.5;
		padding: var(--space-7);
	}
	.Badge {
		font-size: 10px;
		padding: 2px 8px;
		border-radius: 999px;
		background: #e8ecf0;
	}
	.Badge--confirmed {
		background: #d6e8d6;
	}
	.Badge--held,
	.Badge--pending_payment {
		background: #f3e4c4;
	}
	.Badge--cancelled,
	.Badge--no_show {
		background: #f0d6d2;
	}
	.Badge--active,
	.Badge--checked_out {
		background: #d2e0f0;
	}
</style>
