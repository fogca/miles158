<script lang="ts">
	import { enhance } from '$app/forms';
	import Stepper from '$lib/components/reserve/Stepper.svelte';
	import AvailabilityCalendar from '$lib/components/reserve/AvailabilityCalendar.svelte';
	import { LICENSE_OPTIONS, getLicenseOption, blockMessage, licenseLabel, localizedDocs } from '$lib/reserve/eligibility';
	import { formatJpy, addDaysStr } from '$lib/time';
	import { t, l as lhref, type Locale } from '$lib/i18n';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const L = $derived((data.locale ?? 'ja') as Locale);

	let licenseKind = $state(data.license ?? '');
	const selectedLicense = $derived(getLicenseOption(licenseKind));
	const blocked = $derived(licenseKind === 'china_mainland');
	const eligible = $derived(selectedLicense?.eligible ?? false);

	type Vehicle = PageData['vehicles'][number];
	let selected = $state<Vehicle | null>(null);
	let pickup = $state('');
	let returnDate = $state('');
	let pickupTime = $state('10:00');
	let returnTime = $state('20:00');

	const bookedDates = $derived(selected ? (data.bookedByVehicle[selected.id] ?? []) : []);
	const classInfo = $derived(selected ? data.classInfo[selected.class_id] : null);

	// Daily guide rate (base × season multiplier) for every day in the window.
	const priceByDate = $derived.by(() => {
		const out: Record<string, number> = {};
		if (!classInfo) return out;
		for (const [d, m] of Object.entries(classInfo.multByDate)) {
			out[d] = Math.round(classInfo.base24h * m);
		}
		return out;
	});

	function chooseVehicle(v: Vehicle) {
		if (selected?.id !== v.id) {
			selected = v;
			pickup = '';
			returnDate = '';
		}
	}

	// Live cart — billed days = 24h blocks (matches the server-side price). First
	// day uses base24h, later days extra24h, each × that day's season multiplier.
	const cart = $derived.by(() => {
		if (!selected || !classInfo || !pickup || !returnDate) return null;
		const a = new Date(`${pickup}T${pickupTime}:00+09:00`).getTime();
		const b = new Date(`${returnDate}T${returnTime}:00+09:00`).getTime();
		const hours = (b - a) / 3_600_000;
		const days = hours <= 0 ? 1 : Math.max(1, Math.ceil(hours / 24));
		let base = 0;
		let cursor = pickup;
		for (let i = 0; i < days; i++) {
			const mult = classInfo.multByDate[cursor] ?? 1;
			base += Math.round((i === 0 ? classInfo.base24h : classInfo.extra24h) * mult);
			cursor = addDaysStr(cursor, 1);
		}
		const discountPercent = data.durationDiscounts
			.filter((d) => days >= d.minDays)
			.reduce((mx, d) => Math.max(mx, d.ratePercent), 0);
		const discount = Math.round((base * discountPercent) / 100);
		const subtotal = base - discount;
		const tax = Math.round(subtotal * 0.1);
		return { days, base, discountPercent, discount, tax, total: subtotal + tax };
	});
</script>

<svelte:head>
	<title>{t(L, 'rsv.title')} — MILES 158</title>
	<meta name="description" content="MILES 158 のオンライン予約。Land Cruiser FJ VX / Alphard Hybrid Z の空き状況確認・ご予約。" />
</svelte:head>

<main class="Reserve">
	<div class="Reserve__inner">
		<Stepper current={1} />

		<header class="Reserve__head">
			<p class="Reserve__eyebrow" lang="en">Reservation</p>
			<h1 class="Reserve__title">{t(L, 'rsv.title')}</h1>
		</header>

		{#if data.expired}
			<div class="Reserve__expired" role="status">{t(L, 'rsv.expired')}</div>
		{/if}

		<!-- Step 01: license eligibility -->
		<section class="Reserve__block">
			<h2 class="Reserve__h2"><span class="Reserve__step">01</span> {t(L, 'rsv.s1')}</h2>
			<p class="Reserve__lead">{t(L, 'rsv.s1Lead')}</p>
			<div class="Reserve__licenses" role="radiogroup" aria-label={t(L, 'rsv.s1')}>
				{#each LICENSE_OPTIONS as opt (opt.kind)}
					<label class="Reserve__license" class:is-selected={licenseKind === opt.kind}>
						<input type="radio" name="license-pick" value={opt.kind} bind:group={licenseKind} />
						<span class="Reserve__license-label">{licenseLabel(opt, L)}</span>
					</label>
				{/each}
			</div>

			{#if blocked}
				<div class="Reserve__notice Reserve__notice--block">
					<p>{blockMessage(L)}</p>
				</div>
			{:else if eligible && selectedLicense}
				<div class="Reserve__notice">
					<p class="Reserve__docs-title">{t(L, 'rsv.docsTitle')}</p>
					<ul class="Reserve__docs">
						{#each localizedDocs(selectedLicense, L) as doc}<li>{doc}</li>{/each}
					</ul>
				</div>
			{/if}
		</section>

		<!-- Step 02: choose vehicle first -->
		{#if eligible}
			<section class="Reserve__block">
				<h2 class="Reserve__h2"><span class="Reserve__step">02</span> {t(L, 'rsv.s2')}</h2>
				<div class="Reserve__cars">
					{#each data.vehicles as v (v.id)}
						<button type="button" class="Reserve__car" class:is-selected={selected?.id === v.id} onclick={() => chooseVehicle(v)}>
							<div class="Reserve__car-media">
								{#if v.image_url}<img src={v.image_url} alt={v.display_name} loading="lazy" />{/if}
							</div>
							<div class="Reserve__car-body">
								<h3 class="Reserve__car-name">{v.display_name}</h3>
								<p class="Reserve__car-sub">{v.subtitle ?? v.class_name}</p>
								<p class="Reserve__car-price">
									<span class="Reserve__car-from">{t(L, 'rsv.perDay')}</span>
									<span class="Reserve__car-amount">{t(L, 'rsv.fromPrice', { price: formatJpy(v.base_rate_24h, L) })}</span>
									<span class="Reserve__car-tax">{t(L, 'rsv.taxExcl')}</span>
								</p>
							</div>
							<span class="Reserve__car-check" aria-hidden="true">{selected?.id === v.id ? '✓' : ''}</span>
						</button>
					{/each}
				</div>
			</section>

			<!-- Step 03: calendar + live cart -->
			{#if selected}
				<section class="Reserve__block">
					<h2 class="Reserve__h2"><span class="Reserve__step">03</span> {t(L, 'rsv.s3')} — {selected.display_name}</h2>

					<div class="Reserve__cal-layout">
						<div class="Reserve__cal-main">
							<div class="Reserve__times">
								<div class="Reserve__field">
									<label for="ptime">{t(L, 'rsv.pickupTime')}</label>
									<input id="ptime" type="time" bind:value={pickupTime} />
								</div>
								<div class="Reserve__field">
									<label for="rtime">{t(L, 'rsv.returnTime')}</label>
									<input id="rtime" type="time" bind:value={returnTime} />
								</div>
							</div>

							<AvailabilityCalendar
								{bookedDates}
								{priceByDate}
								bind:pickup
								bind:returnDate
								today={data.today}
								minDate={addDaysStr(data.today, 3)}
							/>
							<p class="Reserve__cal-note">{t(L, 'rsv.calTaxNote')}</p>
							<p class="Reserve__cal-note">{t(L, 'rsv.calLeadNote')}<a class="Reserve__cal-link" href="mailto:hi@miles158.com?subject=Last-minute%20Inquiry">{t(L, 'rsv.calLeadLink')}</a>{t(L, 'rsv.calLeadTail')}</p>
						</div>

						<aside class="Reserve__cart">
							<p class="Reserve__cart-title">{t(L, 'rsv.cartTitle')}</p>
							<p class="Reserve__cart-veh">{selected.display_name}</p>
							{#if cart}
								<p class="Reserve__cart-range">{pickup} {pickupTime}<br />〜 {returnDate} {returnTime}</p>
								<dl class="Reserve__cart-sum">
									<div><dt>{t(L, 'rsv.cartRental', { d: cart.days })}</dt><dd>{formatJpy(cart.base, L)}</dd></div>
									{#if cart.discount > 0}
										<div class="is-discount"><dt>{t(L, 'rsv.cartDiscount', { p: cart.discountPercent })}</dt><dd>−{formatJpy(cart.discount, L)}</dd></div>
									{/if}
									<div><dt>{t(L, 'rsv.cartTax')}</dt><dd>{formatJpy(cart.tax, L)}</dd></div>
									<div class="Reserve__cart-total"><dt>{t(L, 'cfg.total')}</dt><dd>{formatJpy(cart.total, L)}</dd></div>
								</dl>
								<p class="Reserve__cart-note">{t(L, 'rsv.cartNote', { dep: formatJpy(selected.deposit_amount, L) })}</p>
								{#if form?.message}<p class="Reserve__error">{form.message}</p>{/if}
								<form method="POST" action="?/select" use:enhance>
									<input type="hidden" name="licenseKind" value={licenseKind} />
									<input type="hidden" name="vehicleId" value={selected.id} />
									<input type="hidden" name="classId" value={selected.class_id} />
									<input type="hidden" name="pickupDate" value={pickup} />
									<input type="hidden" name="pickupTime" value={pickupTime} />
									<input type="hidden" name="returnDate" value={returnDate} />
									<input type="hidden" name="returnTime" value={returnTime} />
									<button type="submit" class="btn-outline Reserve__go">{t(L, 'rsv.proceed')}</button>
								</form>
							{:else}
								<p class="Reserve__cart-empty">{t(L, 'rsv.cartEmpty')}</p>
							{/if}
						</aside>
					</div>
				</section>
			{/if}
		{/if}
	</div>
</main>

<style>
	.Reserve {
		padding-top: calc(var(--space-11) + var(--space-5));
		padding-bottom: var(--space-11);
	}
	.Reserve__inner {
		max-width: 1040px;
		margin: 0 auto;
		padding-inline: var(--padding);
	}
	.Reserve__head {
		margin-bottom: var(--space-8);
	}
	.Reserve__eyebrow {
		font-size: var(--fs-h6);
		opacity: 0.55;
		letter-spacing: 0.08em;
		margin: 0 0 var(--space-2);
	}
	.Reserve__title {
		font-size: var(--fs-h1);
		line-height: 1.1;
		margin: 0;
	}
	.Reserve__expired {
		margin: 0 0 var(--space-7);
		padding: var(--space-4) var(--space-5);
		border: 1px solid var(--color-accent);
		border-radius: 6px;
		background: rgba(51, 121, 230, 0.06);
		font-size: var(--fs-h5);
		line-height: 1.7;
	}
	.Reserve__block + .Reserve__block {
		margin-top: var(--space-9);
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-line);
	}
	.Reserve__h2 {
		font-size: var(--fs-h3);
		margin: 0 0 var(--space-3);
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex-wrap: wrap;
	}
	.Reserve__step {
		font-size: var(--fs-h6);
		opacity: 0.4;
		font-feature-settings: 'tnum';
	}
	.Reserve__lead {
		font-size: var(--fs-h5);
		line-height: 1.8;
		opacity: 0.82;
		margin: 0 0 var(--space-5);
		max-width: 56ch;
	}
	.Reserve__licenses {
		display: grid;
		gap: var(--space-2);
	}
	.Reserve__license {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: 6px;
		cursor: pointer;
		transition: border-color var(--duration-fast) var(--ease-default);
	}
	.Reserve__license.is-selected {
		border-color: var(--color-text);
	}
	.Reserve__license input {
		accent-color: var(--color-accent);
	}
	.Reserve__license-label {
		font-size: var(--fs-h5);
	}
	.Reserve__notice {
		margin-top: var(--space-5);
		padding: var(--space-5);
		border: 1px solid var(--color-line);
		border-radius: 6px;
	}
	.Reserve__notice--block {
		border-color: var(--color-accent);
		background: rgba(51, 121, 230, 0.06);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		align-items: flex-start;
	}
	.Reserve__docs-title {
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin: 0 0 var(--space-2);
	}
	.Reserve__docs {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.Reserve__docs li {
		font-size: var(--fs-h5);
		padding-left: 1.1em;
		position: relative;
	}
	.Reserve__docs li::before {
		content: '·';
		position: absolute;
		left: 0;
	}
	.Reserve__cars {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-4);
	}
	@media (min-width: 640px) {
		.Reserve__cars {
			grid-template-columns: 1fr 1fr;
		}
	}
	.Reserve__car {
		position: relative;
		display: grid;
		grid-template-columns: 100px 1fr;
		gap: var(--space-4);
		padding: var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: 8px;
		text-align: left;
		background: var(--color-bg);
		align-items: center;
		cursor: pointer;
		transition: border-color var(--duration-fast) var(--ease-default);
	}
	.Reserve__car.is-selected {
		border-color: var(--color-text);
		box-shadow: inset 0 0 0 1px var(--color-text);
	}
	.Reserve__car-media {
		aspect-ratio: 16 / 10;
		background: var(--c-sky);
		border-radius: 6px;
		overflow: hidden;
	}
	.Reserve__car-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.Reserve__car-name {
		font-size: var(--fs-h4);
		margin: 0;
	}
	.Reserve__car-sub {
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin: 2px 0 var(--space-2);
	}
	.Reserve__car-price {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin: 0;
	}
	.Reserve__car-amount {
		font-size: var(--fs-h4);
		font-feature-settings: 'tnum';
	}
	.Reserve__car-from,
	.Reserve__car-tax {
		font-size: var(--fs-h6);
		opacity: 0.55;
	}
	.Reserve__car-check {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		color: var(--color-text);
		font-size: var(--fs-h5);
	}
	.Reserve__cal-layout {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-7);
	}
	@media (min-width: 900px) {
		.Reserve__cal-layout {
			grid-template-columns: 1fr 300px;
			align-items: start;
		}
	}
	.Reserve__times {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-5);
	}
	.Reserve__field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}
	.Reserve__field label {
		font-size: var(--fs-h6);
		opacity: 0.6;
	}
	.Reserve__field input {
		border: 1px solid var(--color-line);
		border-radius: 4px;
		padding: var(--space-2) var(--space-3);
		font-size: var(--fs-h5);
		background: var(--color-bg);
	}
	.Reserve__cart {
		border: 1px solid var(--color-line);
		border-radius: 8px;
		padding: var(--space-5);
		position: sticky;
		top: var(--space-8);
	}
	.Reserve__cart-title {
		font-size: var(--fs-h6);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.55;
		margin: 0 0 var(--space-2);
	}
	.Reserve__cart-veh {
		font-size: var(--fs-h4);
		margin: 0 0 var(--space-4);
	}
	.Reserve__cart-range {
		font-size: var(--fs-h6);
		opacity: 0.75;
		line-height: 1.6;
		margin: 0 0 var(--space-4);
		font-feature-settings: 'tnum';
	}
	.Reserve__cart-sum > div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-2) 0;
		font-size: var(--fs-h5);
	}
	.Reserve__cart-sum dt {
		opacity: 0.75;
	}
	.Reserve__cart-sum dd {
		margin: 0;
		font-feature-settings: 'tnum';
	}
	.Reserve__cart-sum .is-discount dd {
		color: var(--color-accent);
	}
	.Reserve__cart-total {
		border-top: 1px solid var(--color-text);
		margin-top: var(--space-2);
		font-size: var(--fs-h3) !important;
	}
	.Reserve__cart-total dd {
		font-weight: 500;
	}
	.Reserve__cart-note {
		font-size: var(--fs-h6);
		opacity: 0.6;
		line-height: 1.6;
		margin: var(--space-4) 0;
	}
	.Reserve__cart-empty {
		font-size: var(--fs-h6);
		opacity: 0.6;
		line-height: 1.7;
	}
	.Reserve__cal-note {
		font-size: var(--fs-h6);
		opacity: 0.55;
		line-height: 1.6;
		margin-top: var(--space-3);
	}
	.Reserve__cal-link {
		text-decoration: underline;
	}
	.Reserve__error {
		color: var(--color-accent);
		font-size: var(--fs-h6);
		margin: var(--space-3) 0;
	}
	.Reserve__go {
		justify-content: center;
		width: 100%;
	}
</style>
