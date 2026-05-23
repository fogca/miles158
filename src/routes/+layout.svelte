<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import faviconSvg from '$lib/assets/favicon.svg';
	import faviconPng from '$lib/assets/favicon.png';
	import ogpImage from '$lib/assets/OGP.png';

	let { children } = $props();

	// Reset scroll to top on every navigation (Home / sub-page).
	// Lenis keeps its own internal scroll position, so we must tell it explicitly.
	afterNavigate(() => {
		if (!browser) return;
		if (lenis) {
			lenis.scrollTo(0, { immediate: true });
		} else {
			window.scrollTo(0, 0);
		}
	});

	let lenis: import('lenis').default | null = null;
	let tickerFn: ((time: number) => void) | null = null;

	// Public Promise the children await before creating ScrollTrigger instances.
	// Without this, on hard reload children race the layout: a child trigger gets
	// created against native scroll BEFORE we register scrollerProxy + defaults,
	// then on first scroll pins fire in the wrong order and sections jump.
	if (browser) {
		let resolveReady: () => void = () => {};
		const scrollReady = new Promise<void>((r) => (resolveReady = r));
		(window as Window & { __scrollReady?: Promise<void> }).__scrollReady = scrollReady;
		bootstrapScroll().finally(() => resolveReady());
	}

	async function bootstrapScroll() {
		// Lenis on mobile fights iOS rubber-band scroll and feels wobbly
		// ("ぐわんぐわん"). On SP we use native scroll instead, and keep
		// ScrollTrigger pin/scrub features working against the window scroller.
		const useLenis = window.matchMedia('(min-width: 768px)').matches;

		const [{ gsap }, { ScrollTrigger }] = await Promise.all([
			import('gsap'),
			import('gsap/ScrollTrigger')
		]);

		gsap.registerPlugin(ScrollTrigger);

		if (!useLenis) {
			// Native scroll path — ScrollTrigger defaults to the window scroller.
			// Just make sure any triggers that were registered before this
			// bootstrap finished get recalibrated against the right scroller.
			ScrollTrigger.refresh(true);

			let refreshTimer: ReturnType<typeof setTimeout> | null = null;
			const debouncedRefresh = (hard = false) => {
				if (refreshTimer) clearTimeout(refreshTimer);
				refreshTimer = setTimeout(() => {
					ScrollTrigger.refresh(hard);
					refreshTimer = null;
				}, 100);
			};

			const scheduleInitial = () => {
				[200, 600, 1200, 2400].forEach((delay) =>
					setTimeout(() => debouncedRefresh(true), delay)
				);
			};
			if (document.readyState === 'complete') scheduleInitial();
			else window.addEventListener('load', scheduleInitial, { once: true });

			if ('fonts' in document) {
				(document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready.then(() =>
					debouncedRefresh(true)
				);
			}
			if ('ResizeObserver' in window) {
				let lastHeight = document.body.scrollHeight;
				const ro = new ResizeObserver(() => {
					const h = document.body.scrollHeight;
					if (Math.abs(h - lastHeight) > 20) {
						lastHeight = h;
						debouncedRefresh();
					}
				});
				ro.observe(document.body);
			}
			return;
		}

		const { default: Lenis } = await import('lenis');
		const lenisInstance = new Lenis();
		lenis = lenisInstance;

		// Expose lenis globally so the Hero intro can lock/unlock scroll
		(window as Window & { __lenis?: typeof lenisInstance }).__lenis = lenisInstance;

		// Bridge Lenis ↔ ScrollTrigger via scrollerProxy. Without this, pin
		// spacing is computed against native scroll while actual scroll happens
		// via Lenis → start/end positions drift, and sections can appear in the
		// wrong order (e.g. StorySlider before ConceptParallax pin completes).
		ScrollTrigger.scrollerProxy(document.body, {
			scrollTop(value?: number) {
				if (arguments.length && typeof value === 'number') {
					lenisInstance.scrollTo(value, { immediate: true });
				}
				return (lenisInstance as unknown as { scroll: number }).scroll ?? window.scrollY;
			},
			getBoundingClientRect() {
				return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
			},
			pinType: 'transform'
		});

		// Defaults applied before children's onMount tries to create their own
		// triggers (children import gsap dynamically too, so by the time they
		// run, defaults are already in place).
		ScrollTrigger.defaults({ scroller: document.body });

		lenisInstance.on('scroll', ScrollTrigger.update);

		tickerFn = (time: number) => lenisInstance.raf(time * 1000);
		gsap.ticker.add(tickerFn);
		gsap.ticker.lagSmoothing(0);

		// Kill any triggers that were created against the wrong scroller before
		// this bootstrap finished (rare, but happens when a child's async import
		// resolved first). They'll be recreated by the staggered refresh below.
		ScrollTrigger.getAll().forEach((t) => {
			if (t.scroller !== document.body) t.refresh();
		});

		ScrollTrigger.refresh(true);

		// Children's onMount runs after this bootstrap async resolves, but their
		// ScrollTriggers may calibrate before fonts / images / late layout shifts
		// settle. Hard-reload often catches this race (cold cache), soft reload
		// usually doesn't. The strategy below covers it from multiple angles:
		//
		//   (1) window.load + rAF (full subresource load)
		//   (2) document.fonts.ready (webfont paint)
		//   (3) staggered timeouts after load (catches late image decode / CLS)
		//   (4) ResizeObserver on body (any subsequent layout change → refresh)
		//
		// All refreshes are debounced so they coalesce into one recompute.

		let refreshTimer: ReturnType<typeof setTimeout> | null = null;
		const debouncedRefresh = (hard = false) => {
			if (refreshTimer) clearTimeout(refreshTimer);
			refreshTimer = setTimeout(() => {
				// hard refresh wipes saved state — used on first load to fight the
				// "skip straight through" race when ScrollTriggers were created
				// before fonts/images settled
				ScrollTrigger.refresh(hard);
				refreshTimer = null;
			}, 100);
		};

		// Initial hard refresh after a longer schedule — catches late image decode,
		// font swap, and any layout shift the first second after load
		const scheduleInitial = () => {
			[200, 600, 1200, 2400].forEach((delay) =>
				setTimeout(() => debouncedRefresh(true), delay)
			);
		};

		if (document.readyState === 'complete') {
			scheduleInitial();
		} else {
			window.addEventListener('load', scheduleInitial, { once: true });
		}

		if ('fonts' in document) {
			(document as Document & { fonts: { ready: Promise<unknown> } }).fonts.ready.then(() =>
				debouncedRefresh(true)
			);
		}

		// Ongoing layout-shift detection — softer (non-hard) refresh.
		// Larger threshold (20px) to avoid firing on tiny reflows from scroll-
		// related transforms — those would race the ScrollTrigger that owns them.
		if ('ResizeObserver' in window) {
			let lastHeight = document.body.scrollHeight;
			const ro = new ResizeObserver(() => {
				const h = document.body.scrollHeight;
				if (Math.abs(h - lastHeight) > 20) {
					lastHeight = h;
					debouncedRefresh();
				}
			});
			ro.observe(document.body);
		}
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

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="MILES 158" />
	<meta property="og:title" content="MILES 158 — Car Service Brand · Nagoya" />
	<meta
		property="og:description"
		content="名古屋・西区に生まれた車好きのためのカーラウンジ。カーレンタル、クラブコミュニティ、カフェラウンジ、メンテナンス。"
	/>
	<meta property="og:image" content={ogpImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="ja_JP" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="MILES 158" />
	<meta
		name="twitter:description"
		content="名古屋・西区の車好きのためのカーラウンジ。"
	/>
	<meta name="twitter:image" content={ogpImage} />

	<link rel="icon" type="image/svg+xml" href={faviconSvg} />
	<link rel="icon" type="image/png" href={faviconPng} />
	<link rel="apple-touch-icon" href={faviconPng} />

	<link rel="canonical" href="https://miles158.pages.dev/" />

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

	<!-- FONTPLUS — provides Tazugane Gothic StdN webfont -->
	<script
		src="https://webfont.fontplus.jp/accessor/script/fontplus.js?kqbwQX--jVA%3D&box=F6ABlUsNQ2k%3D&aa=1&ab=2"
	></script>
</svelte:head>

<SiteHeader />

{@render children()}

<SiteFooter />
