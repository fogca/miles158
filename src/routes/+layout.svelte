<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';

	let { children } = $props();

	let lenis: import('lenis').default | null = null;
	let tickerFn: ((time: number) => void) | null = null;

	if (browser) {
		bootstrapScroll();
	}

	async function bootstrapScroll() {
		const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
			import('lenis'),
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);

		gsap.registerPlugin(ScrollTrigger);

		lenis = new Lenis();
		lenis.on('scroll', ScrollTrigger.update);

		tickerFn = (time: number) => lenis?.raf(time * 1000);
		gsap.ticker.add(tickerFn);
		gsap.ticker.lagSmoothing(0);

		ScrollTrigger.refresh();
	}

	onMount(() => {
		return () => {
			if (tickerFn) {
				import('gsap').then(({ gsap }) => gsap.ticker.remove(tickerFn!));
			}
			lenis?.destroy();
			lenis = null;
		};
	});
</script>

<svelte:head>
	<title>MILES 158 — Car Service Brand · Nagoya</title>
	<meta
		name="description"
		content="MILES 158 — 名古屋・西区に生まれた車好きのためのカーラウンジ。カーレンタル、クラブコミュニティ、カフェラウンジ、メンテナンス。"
	/>
	<link
		rel="preload"
		href="/fonts/ABCArizonaFlare-Regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/ABCArizonaFlare-Medium.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<SiteHeader />

{@render children()}

<SiteFooter />
