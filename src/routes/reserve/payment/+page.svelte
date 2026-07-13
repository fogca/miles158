<script lang="ts">
	import { enhance } from '$app/forms';
	import Stepper from '$lib/components/reserve/Stepper.svelte';
	import { formatJpy, formatJst } from '$lib/time';
	import { t, l as lhref, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);

	let method = $state('card');
	const isWallet = $derived(method === 'wechat' || method === 'alipay');

	const intervalLabel = $derived((min: number, max: number | null): string => {
		if (max === null) return t(L, 'pay.iv.7plus');
		if (min === 0) return t(L, 'pay.iv.sameday');
		if (min === 24) return t(L, 'pay.iv.1to2');
		if (min === 72) return t(L, 'pay.iv.3to6');
		return `${min}h`;
	});
</script>

<svelte:head><title>{t(L, 'pay.title')} — MILES 158</title></svelte:head>

<main class="Pay">
	<div class="Pay__inner">
		<Stepper current={3} />
		<header class="Pay__head">
			<h1 class="Pay__title">{t(L, 'pay.title')}</h1>
			{#if data.vehicle}
				<p class="Pay__veh">
					{data.vehicle.display_name}
					{#if data.reservation.pickupAt} ・ {formatJst(data.reservation.pickupAt, L)} 〜 {data.reservation.returnAt ? formatJst(data.reservation.returnAt, L) : ''}{/if}
				</p>
			{/if}
		</header>

		<div class="Pay__mock">{t(L, 'pay.mock')}</div>

		<div class="Pay__grid">
			<div class="Pay__main">
				<!-- Cancellation policy -->
				<section class="Pay__sec">
					<h2 class="Pay__h2">{t(L, 'pay.cancelPolicy')}</h2>
					<table class="Pay__rules">
						<tbody>
							{#each data.rules as r}
								<tr>
									<td>{intervalLabel(r.hoursBeforeMin, r.hoursBeforeMax)}</td>
									<td class="Pay__pct">{r.feePercent}%</td>
								</tr>
							{/each}
							<tr><td>{t(L, 'pay.noShow')}</td><td class="Pay__pct">50%</td></tr>
						</tbody>
					</table>
					<p class="Pay__note">{t(L, 'pay.feeNote')}</p>
				</section>

				<!-- Payment method -->
				<section class="Pay__sec">
					<h2 class="Pay__h2">{t(L, 'pay.method')}</h2>
					<div class="Pay__methods">
						{#each [{ v: 'card', label: t(L, 'pay.card') }, { v: 'wechat', label: 'WeChat Pay' }, { v: 'alipay', label: 'Alipay' }] as m (m.v)}
							<label class="Pay__method" class:is-selected={method === m.v}>
								<input type="radio" name="methodPick" value={m.v} bind:group={method} />
								<span>{m.label}</span>
							</label>
						{/each}
					</div>
					{#if isWallet}
						<p class="Pay__wallet-note">{t(L, 'pay.walletNote')}</p>
					{/if}
				</section>
			</div>

			<!-- Summary + agreement (最終確認: 特商法12条の6 — 車種・期間・支払額・保証金を明示) -->
			<aside class="Pay__summary">
				<dl class="Pay__sum">
					{#if data.vehicle}
						<div><dt>{t(L, 'dt.kVehicle')}</dt><dd>{data.vehicle.display_name}</dd></div>
					{/if}
					{#if data.reservation.pickupAt}
						<div><dt>{t(L, 'done.pickup')}</dt><dd>{formatJst(data.reservation.pickupAt, L)}</dd></div>
					{/if}
					{#if data.reservation.returnAt}
						<div><dt>{t(L, 'done.return')}</dt><dd>{formatJst(data.reservation.returnAt, L)}</dd></div>
					{/if}
					<div class="Pay__sum-total"><dt>{t(L, 'pay.total')}</dt><dd>{formatJpy(data.reservation.total ?? 0, L)}</dd></div>
					<div><dt>{t(L, 'pay.deposit')}</dt><dd>{formatJpy(data.reservation.deposit ?? 0, L)}</dd></div>
				</dl>
				<p class="Pay__deposit-note">{t(L, 'pay.depositNote', { dep: formatJpy(data.reservation.deposit ?? 0, L) })}</p>

				<form method="POST" action="?/pay" use:enhance>
					<input type="hidden" name="method" value={method} />
					<label class="Pay__agree">
						<input type="checkbox" name="agree" required />
						<span>{t(L, 'pay.agreePre')}<a href={lhref(L, '/terms')} target="_blank" rel="noopener">{t(L, 'pay.terms')}</a>{t(L, 'pay.and')}<a href={lhref(L, '/legal/privacy')} target="_blank" rel="noopener">{t(L, 'pay.privacy')}</a>{t(L, 'pay.agreePost')}</span>
					</label>
					<p class="Pay__lang-note">{t(L, 'pay.langNote')}</p>
					{#if form?.message}<p class="Pay__error">{form.message}</p>{/if}
					<button type="submit" class="btn-outline Pay__submit">{t(L, 'pay.submit')}</button>
				</form>
				<a class="Pay__back" href={lhref(L, '/reserve/configure')}>{t(L, 'pay.back')}</a>
			</aside>
		</div>
	</div>
</main>

<style>
	.Pay {
		padding-top: calc(var(--space-11) + var(--space-5));
		padding-bottom: var(--space-11);
	}
	.Pay__inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding-inline: var(--padding);
	}
	.Pay__head { margin-bottom: var(--space-5); }
	.Pay__title { font-size: var(--fs-h2); margin: 0 0 var(--space-2); }
	.Pay__veh { font-size: var(--fs-h6); opacity: 0.6; }
	.Pay__mock {
		font-size: var(--fs-h6);
		padding: var(--space-3) var(--space-4);
		border: 1px dashed var(--color-accent);
		border-radius: 6px;
		color: var(--color-accent);
		margin-bottom: var(--space-7);
	}
	.Pay__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-8);
	}
	@media (min-width: 960px) {
		.Pay__grid { grid-template-columns: 1fr 340px; align-items: start; }
	}
	.Pay__sec + .Pay__sec { margin-top: var(--space-7); padding-top: var(--space-6); border-top: 1px solid var(--color-line); }
	.Pay__h2 { font-size: var(--fs-h4); margin: 0 0 var(--space-4); }
	.Pay__rules { width: 100%; border-collapse: collapse; }
	.Pay__rules td { padding: var(--space-3) 0; border-bottom: 1px solid var(--color-line); font-size: var(--fs-h5); }
	.Pay__pct { text-align: right; font-feature-settings: 'tnum'; }
	.Pay__note { font-size: var(--fs-h6); opacity: 0.6; margin-top: var(--space-3); }
	.Pay__methods { display: grid; gap: var(--space-2); }
	.Pay__method {
		display: flex; align-items: center; gap: var(--space-3);
		padding: var(--space-3) var(--space-4); border: 1px solid var(--color-line); border-radius: 6px; cursor: pointer;
	}
	.Pay__method.is-selected { border-color: var(--color-text); }
	.Pay__method input { accent-color: var(--color-accent); }
	.Pay__wallet-note { font-size: var(--fs-h6); opacity: 0.7; line-height: 1.6; margin-top: var(--space-3); }
	.Pay__summary { border: 1px solid var(--color-line); border-radius: 8px; padding: var(--space-6); position: sticky; top: var(--space-8); }
	.Pay__sum > div { display: flex; justify-content: space-between; padding: var(--space-2) 0; font-size: var(--fs-h5); }
	.Pay__sum dd { margin: 0; font-feature-settings: 'tnum'; }
	.Pay__sum-total { font-size: var(--fs-h4) !important; border-bottom: 1px solid var(--color-line); margin-bottom: var(--space-2); padding-bottom: var(--space-3) !important; }
	.Pay__sum-total dd { font-weight: 500; }
	.Pay__deposit-note { font-size: var(--fs-h6); opacity: 0.6; line-height: 1.6; margin: var(--space-3) 0 0; }
	.Pay__lang-note { font-size: var(--fs-h6); opacity: 0.55; line-height: 1.6; margin: 0 0 var(--space-4); }
	.Pay__agree { display: flex; gap: var(--space-3); align-items: flex-start; margin: var(--space-5) 0 var(--space-2); font-size: var(--fs-h6); line-height: 1.6; }
	.Pay__agree input { margin-top: 3px; accent-color: var(--color-accent); }
	.Pay__agree a { text-decoration: underline; }
	.Pay__error { color: var(--color-accent); font-size: var(--fs-h6); margin-bottom: var(--space-3); }
	.Pay__submit { width: 100%; justify-content: center; }
	.Pay__back { display: block; text-align: center; font-size: var(--fs-h6); opacity: 0.6; margin-top: var(--space-4); }
</style>
