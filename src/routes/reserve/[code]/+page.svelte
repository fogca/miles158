<script lang="ts">
	import Stepper from '$lib/components/reserve/Stepper.svelte';
	import { formatJpy, formatJst } from '$lib/time';
	import { t, l as lhref, type Locale } from '$lib/i18n';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const r = data.reservation;
	const L = (data.locale ?? 'ja') as Locale;

	// Status-aware display: a cancelled/no-show booking must not read "Confirmed".
	const isCancelled = r.status === 'cancelled' || r.status === 'no_show';
	const heading = isCancelled
		? { eyebrow: 'Reservation Cancelled', title: t(L, 'done.cancelledTitle') }
		: r.status === 'completed'
			? { eyebrow: 'Rental Completed', title: t(L, 'done.completedTitle') }
			: { eyebrow: 'Reservation Confirmed', title: t(L, 'done.confirmedTitle') };

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'RentalCarReservation',
		reservationId: r.code,
		reservationStatus: isCancelled
			? 'https://schema.org/ReservationCancelled'
			: 'https://schema.org/ReservationConfirmed',
		underName: { '@type': 'Person' },
		reservationFor: {
			'@type': 'Car',
			name: data.vehicle?.display_name ?? 'Vehicle'
		},
		pickupTime: r.pickupAt,
		dropoffTime: r.returnAt
	});
</script>

<svelte:head>
	<title>{heading.title} — MILES 158</title>
	{@html `<script type="application/ld+json">${jsonLd}</scr` + `ipt>`}
</svelte:head>

<main class="Done">
	<div class="Done__inner">
		{#if !isCancelled}
			<Stepper current={4} />
		{/if}
		<div class="Done__card" class:is-cancelled={isCancelled}>
			<p class="Done__eyebrow" lang="en">{heading.eyebrow}</p>
			<h1 class="Done__title">{heading.title}</h1>
			<p class="Done__code">{r.code}</p>

			{#if data.vehicle}
				<div class="Done__veh">
					{#if data.vehicle.image_url}<img src={data.vehicle.image_url} alt={data.vehicle.display_name} />{/if}
					<div>
						<p class="Done__veh-name">{data.vehicle.display_name}</p>
						<p class="Done__veh-sub">{data.vehicle.subtitle ?? ''}</p>
					</div>
				</div>
			{/if}

			<dl class="Done__detail">
				{#if r.pickupAt}<div><dt>{t(L, 'done.pickup')}</dt><dd>{formatJst(r.pickupAt, L)}</dd></div>{/if}
				{#if r.returnAt}<div><dt>{t(L, 'done.return')}</dt><dd>{formatJst(r.returnAt, L)}</dd></div>{/if}
				<div><dt>{t(L, 'done.total')}</dt><dd>{formatJpy(r.total ?? 0, L)}</dd></div>
				<div><dt>{t(L, 'done.deposit')}</dt><dd>{formatJpy(r.deposit ?? 0, L)}</dd></div>
			</dl>

			<div class="Done__next">
				{#if isCancelled}
					<p>{@html t(L, 'done.nextCancelled', { href: lhref(L, '/reserve') })}</p>
				{:else}
					<p>{t(L, 'done.nextConfirmed')}</p>
				{/if}
			</div>

			<a class="btn-outline Done__home" href={lhref(L, '/')}>{t(L, 'done.home')}</a>
		</div>
	</div>
</main>

<style>
	.Done { padding-top: calc(var(--space-11) + var(--space-5)); padding-bottom: var(--space-11); }
	.Done__inner { max-width: 640px; margin: 0 auto; padding-inline: var(--padding); }
	.Done__card { border: 1px solid var(--color-line); border-radius: 10px; padding: var(--space-8) var(--space-7); text-align: center; }
	.Done__card.is-cancelled { opacity: 0.92; }
	.Done__card.is-cancelled .Done__code { border-color: var(--color-line); opacity: 0.6; text-decoration: line-through; }
	.Done__eyebrow { font-size: var(--fs-h6); letter-spacing: 0.1em; opacity: 0.55; margin: 0 0 var(--space-3); }
	.Done__title { font-size: var(--fs-h3); margin: 0 0 var(--space-4); }
	.Done__code {
		font-size: var(--fs-h2); font-feature-settings: 'tnum'; letter-spacing: 0.04em;
		padding: var(--space-3) var(--space-5); border: 1px solid var(--color-text); border-radius: 6px;
		display: inline-block; margin: 0 0 var(--space-7);
	}
	.Done__veh { display: flex; gap: var(--space-4); align-items: center; text-align: left; padding: var(--space-4) 0; border-top: 1px solid var(--color-line); }
	.Done__veh img { width: 120px; aspect-ratio: 16/10; object-fit: cover; border-radius: 6px; }
	.Done__veh-name { font-size: var(--fs-h4); margin: 0; }
	.Done__veh-sub { font-size: var(--fs-h6); opacity: 0.6; margin: 2px 0 0; }
	.Done__detail { text-align: left; margin: var(--space-4) 0; }
	.Done__detail > div { display: flex; justify-content: space-between; padding: var(--space-2) 0; border-bottom: 1px solid var(--color-line); font-size: var(--fs-h5); }
	.Done__detail dt { opacity: 0.7; }
	.Done__detail dd { margin: 0; font-feature-settings: 'tnum'; }
	.Done__next { text-align: left; font-size: var(--fs-h6); opacity: 0.75; line-height: 1.8; margin: var(--space-5) 0; }
	.Done__home { margin-top: var(--space-3); }
</style>
