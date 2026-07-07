<script lang="ts">
	import { enhance } from '$app/forms';
	import Stepper from '$lib/components/reserve/Stepper.svelte';
	import { formatJpy } from '$lib/time';
	import { TAX_RATE } from '$lib/pricing/calculator';
	import { t, l as lhref, pickLoc, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const L = $derived((data.locale ?? 'ja') as Locale);

	const days = data.quote.rentalDays;
	const baseAmount = data.quote.baseAmount;
	const discountPercent = data.quote.discountPercent;
	const isForeign = data.licenseKind && data.licenseKind !== 'jp';

	let cdw = $state(data.coverage.cdwSelected);
	let noc = $state(data.coverage.nocWaiver);
	let qty = $state<Record<string, number>>(
		Object.fromEntries(
			data.catalog.map((o) => [o.id, data.savedOptions.find((s) => s.optionId === o.id)?.qty ?? 0])
		)
	);

	const coverageAmount = $derived(
		(cdw ? data.classRow.cdw_per_day * days : 0) + (noc ? data.classRow.noc_waiver_per_day * days : 0)
	);
	const optionsAmount = $derived(
		data.catalog.reduce((sum, o) => {
			const q = qty[o.id] ?? 0;
			if (q <= 0) return sum;
			return sum + o.price_amount * (o.pricing_type === 'per_day' ? q * days : q);
		}, 0)
	);
	const discountAmount = $derived(Math.round((baseAmount * discountPercent) / 100));
	const subtotal = $derived(baseAmount + coverageAmount + optionsAmount - discountAmount);
	const taxAmount = $derived(Math.round(subtotal * TAX_RATE));
	const total = $derived(subtotal + taxAmount);
</script>

<svelte:head><title>{t(L, 'cfg.title')} — MILES 158</title></svelte:head>

<main class="Cfg">
	<div class="Cfg__inner">
		<Stepper current={2} />

		<header class="Cfg__head">
			<h1 class="Cfg__title">{t(L, 'cfg.title')}</h1>
			{#if data.vehicle}
				<p class="Cfg__veh">
					{data.vehicle.display_name} ・ {data.search.pickupDate} {data.search.pickupTime} 〜 {data.search.returnDate} {data.search.returnTime}（{t(L, 'cfg.days', { d: days })}）
				</p>
			{/if}
		</header>

		<form method="POST" action="?/confirm" use:enhance class="Cfg__form">
			<div class="Cfg__grid">
				<div class="Cfg__main">
					<!-- Coverage -->
					<section class="Cfg__sec">
						<h2 class="Cfg__h2">{t(L, 'cfg.coverage')} <a class="Cfg__h2-link" href={lhref(L, '/legal/insurance')} target="_blank" rel="noopener">{t(L, 'cfg.coverageLink')}</a></h2>
						<label class="Cfg__opt">
							<input type="checkbox" name="cdw" checked={cdw} onchange={(e) => (cdw = e.currentTarget.checked)} />
							<span>
								<span class="Cfg__opt-name">{t(L, 'cfg.cdw')}</span>
								<span class="Cfg__opt-price">{formatJpy(data.classRow.cdw_per_day)} {t(L, 'cfg.perDaySuffix')}</span>
							</span>
						</label>
						<label class="Cfg__opt">
							<input type="checkbox" name="noc" checked={noc} onchange={(e) => (noc = e.currentTarget.checked)} />
							<span>
								<span class="Cfg__opt-name">{t(L, 'cfg.noc')}</span>
								<span class="Cfg__opt-price">{formatJpy(data.classRow.noc_waiver_per_day)} {t(L, 'cfg.perDaySuffix')}</span>
							</span>
						</label>
					</section>

					<!-- Options -->
					<section class="Cfg__sec">
						<h2 class="Cfg__h2">{t(L, 'cfg.options')}</h2>
						{#each data.catalog as o (o.id)}
							<div class="Cfg__opt">
								<span>
									<span class="Cfg__opt-name">{pickLoc(o, L)}</span>
									<span class="Cfg__opt-price">
										{formatJpy(o.price_amount)} {o.pricing_type === 'per_day' ? t(L, 'cfg.perDaySuffix') : t(L, 'cfg.perRentalSuffix')}
									</span>
								</span>
								<select name={`opt_${o.id}`} bind:value={qty[o.id]} class="Cfg__qty">
									{#each Array(o.max_quantity + 1) as _, n}
										<option value={n}>{n}</option>
									{/each}
								</select>
							</div>
						{/each}
					</section>

					<!-- Customer -->
					<section class="Cfg__sec">
						<h2 class="Cfg__h2">{t(L, 'cfg.customer')}</h2>
						<div class="Cfg__fields">
							<div class="Cfg__field"><label for="nf">{t(L, 'cfg.fFamily')}</label><input id="nf" name="nameFamily" required /></div>
							<div class="Cfg__field"><label for="ng">{t(L, 'cfg.fGiven')}</label><input id="ng" name="nameGiven" required /></div>
							<div class="Cfg__field"><label for="em">{t(L, 'cfg.fEmail')}</label><input id="em" name="email" type="email" required /></div>
							<div class="Cfg__field"><label for="ph">{t(L, 'cfg.fPhone')}</label><input id="ph" name="phone" required /></div>
							<div class="Cfg__field Cfg__field--wide"><label for="ad">{t(L, 'cfg.fAddress')}</label><input id="ad" name="address" required /></div>
							<div class="Cfg__field"><label for="ln">{t(L, 'cfg.fLicense')}</label><input id="ln" name="licenseNumber" required /></div>
							<div class="Cfg__field"><label for="lt">{t(L, 'cfg.fLicenseType')}</label><input id="lt" name="licenseType" placeholder="B" /></div>
							<div class="Cfg__field"><label for="le">{t(L, 'cfg.fLicenseExp')}</label><input id="le" name="licenseExpiry" type="date" /></div>
							<div class="Cfg__field"><label for="pc">{t(L, 'cfg.fPassengers')}</label><input id="pc" name="passengerCount" type="number" min="1" value="1" /></div>
							{#if isForeign}
								<div class="Cfg__field"><label for="na">{t(L, 'cfg.fNationality')}</label><input id="na" name="nationality" /></div>
								<div class="Cfg__field"><label for="pp">{t(L, 'cfg.fPassport')}</label><input id="pp" name="passportNumber" /></div>
								<div class="Cfg__field"><label for="ed">{t(L, 'cfg.fEntry')}</label><input id="ed" name="entryDate" type="date" /></div>
							{/if}
						</div>
					</section>
				</div>

				<!-- Price summary (sticky) -->
				<aside class="Cfg__summary">
					<h2 class="Cfg__sum-title">{t(L, 'cfg.price')}</h2>
					<dl class="Cfg__sum">
						<div><dt>{t(L, 'rsv.cartRental', { d: days })}</dt><dd>{formatJpy(baseAmount)}</dd></div>
						{#if coverageAmount > 0}<div><dt>{t(L, 'cfg.coverageLine')}</dt><dd>{formatJpy(coverageAmount)}</dd></div>{/if}
						{#if optionsAmount > 0}<div><dt>{t(L, 'cfg.optionsLine')}</dt><dd>{formatJpy(optionsAmount)}</dd></div>{/if}
						{#if discountAmount > 0}<div class="is-discount"><dt>{t(L, 'rsv.cartDiscount', { p: discountPercent })}</dt><dd>−{formatJpy(discountAmount)}</dd></div>{/if}
						<div class="Cfg__sum-sub"><dt>{t(L, 'rsv.cartSubtotal')}</dt><dd>{formatJpy(subtotal)}</dd></div>
						<div><dt>{t(L, 'rsv.cartTax')}</dt><dd>{formatJpy(taxAmount)}</dd></div>
						<div class="Cfg__sum-total"><dt>{t(L, 'cfg.total')}</dt><dd>{formatJpy(total)}</dd></div>
					</dl>
					<p class="Cfg__deposit">{t(L, 'cfg.depositNote', { dep: formatJpy(data.depositAmount) })}</p>
					<p class="Cfg__deposit">{t(L, 'cfg.mileageNote')}</p>

					{#if form?.message}<p class="Cfg__error">{form.message}</p>{/if}
					<button type="submit" class="btn-outline Cfg__submit">{t(L, 'cfg.submit')}</button>
					<a class="Cfg__back" href={lhref(L, '/reserve')}>{t(L, 'cfg.back')}</a>
				</aside>
			</div>
		</form>
	</div>
</main>

<style>
	.Cfg {
		padding-top: calc(var(--space-11) + var(--space-5));
		padding-bottom: var(--space-11);
	}
	.Cfg__inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding-inline: var(--padding);
	}
	.Cfg__head {
		margin-bottom: var(--space-7);
	}
	.Cfg__title {
		font-size: var(--fs-h2);
		margin: 0 0 var(--space-2);
	}
	.Cfg__veh {
		font-size: var(--fs-h6);
		opacity: 0.6;
	}
	.Cfg__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-8);
	}
	@media (min-width: 960px) {
		.Cfg__grid {
			grid-template-columns: 1fr 340px;
			align-items: start;
		}
	}
	.Cfg__sec + .Cfg__sec {
		margin-top: var(--space-7);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-line);
	}
	.Cfg__h2 {
		font-size: var(--fs-h4);
		margin: 0 0 var(--space-4);
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.Cfg__h2-link {
		font-size: var(--fs-h6);
		opacity: 0.6;
		text-decoration: underline;
	}
	.Cfg__opt {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) 0;
		border-bottom: 1px solid var(--color-line);
	}
	.Cfg__opt input[type='checkbox'] {
		accent-color: var(--color-accent);
		width: 18px;
		height: 18px;
	}
	.Cfg__opt > span,
	.Cfg__opt label > span {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.Cfg__opt label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}
	.Cfg__opt-name {
		font-size: var(--fs-h5);
	}
	.Cfg__opt-price {
		font-size: var(--fs-h6);
		opacity: 0.6;
	}
	.Cfg__qty {
		border: 1px solid var(--color-line);
		border-radius: 4px;
		padding: var(--space-1) var(--space-3);
	}
	.Cfg__fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-4);
	}
	.Cfg__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.Cfg__field--wide {
		grid-column: 1 / -1;
	}
	.Cfg__field label {
		font-size: var(--fs-h6);
		opacity: 0.6;
	}
	.Cfg__field input {
		border: 1px solid var(--color-line);
		border-radius: 4px;
		padding: var(--space-2) var(--space-3);
		font-size: var(--fs-h5);
	}
	.Cfg__summary {
		border: 1px solid var(--color-line);
		border-radius: 8px;
		padding: var(--space-6);
		position: sticky;
		top: var(--space-8);
	}
	.Cfg__sum-title {
		font-size: var(--fs-h5);
		margin: 0 0 var(--space-4);
	}
	.Cfg__sum > div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-2) 0;
		font-size: var(--fs-h5);
	}
	.Cfg__sum dt {
		opacity: 0.75;
	}
	.Cfg__sum dd {
		margin: 0;
		font-feature-settings: 'tnum';
	}
	.Cfg__sum .is-discount dd {
		color: var(--color-accent);
	}
	.Cfg__sum-sub {
		border-top: 1px solid var(--color-line);
		margin-top: var(--space-2);
	}
	.Cfg__sum-total {
		border-top: 1px solid var(--color-text);
		margin-top: var(--space-2);
		font-size: var(--fs-h4) !important;
	}
	.Cfg__sum-total dd {
		font-weight: 500;
	}
	.Cfg__deposit {
		font-size: var(--fs-h6);
		opacity: 0.6;
		line-height: 1.6;
		margin: var(--space-4) 0;
	}
	.Cfg__error {
		color: var(--color-accent);
		font-size: var(--fs-h6);
		margin-bottom: var(--space-3);
	}
	.Cfg__submit {
		width: 100%;
		justify-content: center;
	}
	.Cfg__back {
		display: block;
		text-align: center;
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin-top: var(--space-4);
	}
</style>
