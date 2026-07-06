<script lang="ts">
	import { page } from '$app/state';
	import { t, type Locale } from '$lib/i18n';

	// Large single-month availability calendar with ‹ › month navigation.
	// Each open day shows its daily rate; booked days are × and unselectable.
	let {
		bookedDates = [],
		pickup = $bindable(''),
		returnDate = $bindable(''),
		today = '',
		priceByDate = {},
		minDate = ''
	}: {
		bookedDates?: string[];
		pickup?: string;
		returnDate?: string;
		today?: string;
		priceByDate?: Record<string, number>;
		minDate?: string; // earliest selectable pickup date (lead-time floor)
	} = $props();

	const L = $derived((page.data.locale ?? 'ja') as Locale);
	const WD = $derived(
		L === 'en'
			? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
			: L === 'zh'
				? ['日', '一', '二', '三', '四', '五', '六']
				: ['日', '月', '火', '水', '木', '金', '土']
	);
	const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
	const bookedSet = $derived(new Set(bookedDates));
	const floor = $derived(minDate || today); // earliest selectable date
	let msg = $state('');
	let offset = $state(0); // months from the start month

	const startStr = today || new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);
	const startY = Number(startStr.slice(0, 4));
	const startM = Number(startStr.slice(5, 7)) - 1;

	function pad(n: number): string {
		return n < 10 ? `0${n}` : `${n}`;
	}
	function ymd(y: number, m: number, d: number): string {
		return `${y}-${pad(m + 1)}-${pad(d)}`;
	}
	function addDay(s: string): string {
		const t = new Date(`${s}T00:00:00+09:00`).getTime() + 86_400_000;
		return new Date(t + 9 * 3_600_000).toISOString().slice(0, 10);
	}

	const maxOffset = $derived.by(() => {
		const ks = Object.keys(priceByDate);
		if (!ks.length) return 0;
		const last = ks.reduce((a, b) => (a > b ? a : b));
		const ly = Number(last.slice(0, 4));
		const lm = Number(last.slice(5, 7)) - 1;
		return (ly - startY) * 12 + (lm - startM);
	});

	const month = $derived.by(() => {
		const y = startY + Math.floor((startM + offset) / 12);
		const m = (startM + offset) % 12;
		const lead = new Date(`${y}-${pad(m + 1)}-01T00:00:00+09:00`).getDay();
		const dim = new Date(y, m + 1, 0).getDate();
		const cells: (string | null)[] = [];
		for (let b = 0; b < lead; b++) cells.push(null);
		for (let d = 1; d <= dim; d++) cells.push(ymd(y, m, d));
		const label = L === 'en' ? `${MONTHS_EN[m]} ${y}` : `${y}年 ${m + 1}月`;
		return { label, cells };
	});

	function rangeHasBooked(a: string, b: string): boolean {
		let d = a;
		while (d <= b) {
			if (bookedSet.has(d)) return true;
			d = addDay(d);
		}
		return bookedSet.has(addDay(b));
	}

	function pick(d: string | null) {
		if (!d || d < floor || bookedSet.has(d)) return;
		if (!pickup || (pickup && returnDate)) {
			pickup = d;
			returnDate = '';
			msg = '';
		} else if (d < pickup) {
			pickup = d;
			returnDate = '';
		} else if (rangeHasBooked(pickup, d)) {
			msg = t(L, 'cal.rangeBlocked');
			pickup = d;
			returnDate = '';
		} else {
			returnDate = d;
			msg = '';
		}
	}

	function cellState(d: string | null): string {
		if (!d) return 'blank';
		if (d < today) return 'past';
		// Booked/unavailable takes priority over the lead-time hint: a taken day
		// shows × (no point calling), only genuinely-open near days show ✆.
		if (bookedSet.has(d)) return 'booked';
		if (minDate && d < minDate) return 'soon';
		if (d === pickup) return 'pickup';
		if (returnDate && d === returnDate) return 'return';
		if (pickup && returnDate && d > pickup && d < returnDate) return 'inrange';
		return 'open';
	}
</script>

<div class="Cal">
	<div class="Cal__bar">
		<button type="button" class="Cal__nav" onclick={() => (offset = Math.max(0, offset - 1))} disabled={offset === 0} aria-label={t(L, 'cal.prev')}>‹</button>
		<span class="Cal__title">{month.label}</span>
		<button type="button" class="Cal__nav" onclick={() => (offset = Math.min(maxOffset, offset + 1))} disabled={offset >= maxOffset} aria-label={t(L, 'cal.next')}>›</button>
	</div>

	<div class="Cal__legend">
		<span><i class="m m--open">○</i> {t(L, 'cal.open')}</span>
		<span><i class="m m--booked">×</i> {t(L, 'cal.booked')}</span>
		<span><i class="m m--soon">✆</i> {t(L, 'cal.soon')}</span>
		<span><i class="m m--sel"></i> {t(L, 'cal.selected')}</span>
	</div>

	<div class="Cal__wd">
		{#each WD as w, i (i)}<span class:we={i === 0 || i === 6}>{w}</span>{/each}
	</div>
	<div class="Cal__grid">
		{#each month.cells as d, i (i)}
			<button
				type="button"
				class="Cal__day Cal__day--{cellState(d)}"
				disabled={!d || d < floor || bookedSet.has(d)}
				title={d && cellState(d) === 'soon' ? t(L, 'cal.soonTip') : ''}
				onclick={() => pick(d)}
			>
				{#if d}
					<span class="Cal__n">{Number(d.slice(8))}</span>
					{#if cellState(d) === 'booked'}
						<span class="Cal__x">×</span>
					{:else if cellState(d) === 'soon'}
						<span class="Cal__mk Cal__mk--soon">✆</span>
					{:else if priceByDate[d]}
						<span class="Cal__price">¥{priceByDate[d].toLocaleString('ja-JP')}</span>
					{/if}
				{/if}
			</button>
		{/each}
	</div>

	{#if msg}<p class="Cal__msg">{msg}</p>{/if}
</div>

<style>
	.Cal__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-4);
	}
	.Cal__title {
		font-size: var(--fs-h3);
		font-feature-settings: 'tnum';
	}
	.Cal__nav {
		width: 40px;
		height: 40px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
		font-size: var(--fs-h3);
		line-height: 1;
		display: grid;
		place-items: center;
	}
	.Cal__nav:disabled {
		opacity: 0.25;
		cursor: default;
	}
	.Cal__legend {
		display: flex;
		gap: var(--space-5);
		font-size: var(--fs-h6);
		opacity: 0.7;
		margin-bottom: var(--space-4);
	}
	.Cal__legend .m {
		font-style: normal;
		margin-right: 4px;
	}
	.Cal__legend .m--booked {
		color: #c0392b;
	}
	.Cal__legend .m--soon {
		color: #9aa3ad;
	}
	.Cal__legend .m--sel {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 3px;
		background: var(--c-navy);
		vertical-align: -1px;
	}
	.Cal__wd {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		font-size: var(--fs-h6);
		opacity: 0.5;
		margin-bottom: var(--space-2);
	}
	.Cal__wd span {
		text-align: center;
	}
	.Cal__wd .we {
		opacity: 0.8;
	}
	.Cal__grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-2);
	}
	.Cal__day {
		min-height: 72px;
		border: 1px solid var(--color-line);
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		background: #fff;
		padding: var(--space-2);
	}
	.Cal__n {
		font-size: var(--fs-h4);
		line-height: 1;
		font-feature-settings: 'tnum';
	}
	.Cal__price {
		font-size: 11px;
		opacity: 0.7;
		font-feature-settings: 'tnum';
	}
	.Cal__x {
		font-size: var(--fs-h5);
		color: #c0392b;
	}
	.Cal__day--blank {
		border: none;
		background: transparent;
	}
	.Cal__day--past {
		opacity: 0.25;
	}
	.Cal__day--soon {
		background: #f2f4f6;
		color: #9aa3ad;
	}
	.Cal__mk--soon {
		font-size: 11px;
		color: #9aa3ad;
	}
	.Cal__day--booked {
		background: #faf0ee;
		color: #c0392b;
	}
	.Cal__day--open {
		cursor: pointer;
		transition: border-color var(--duration-fast) var(--ease-default);
	}
	.Cal__day--open:hover {
		border-color: var(--c-navy);
	}
	.Cal__day--pickup,
	.Cal__day--return {
		background: var(--c-navy);
		color: var(--c-sky);
		border-color: var(--c-navy);
	}
	.Cal__day--pickup .Cal__price,
	.Cal__day--return .Cal__price {
		opacity: 0.85;
	}
	.Cal__day--inrange {
		background: var(--c-sky);
		border-color: var(--c-sky);
	}
	.Cal__msg {
		color: #c0392b;
		font-size: var(--fs-h6);
		margin-top: var(--space-3);
	}
	@media (max-width: 520px) {
		.Cal__day {
			min-height: 56px;
		}
		.Cal__n {
			font-size: var(--fs-h5);
		}
		.Cal__price {
			font-size: 9px;
		}
	}
</style>
