// FontPlus dynamic-subsetting loader × SvelteKit SPA navigation.
// Proven pattern (OTIF): the loader in app.html only scans the initial DOM, so
// every client-side render change must trigger FONTPLUS.reload() — first load
// with force=true, transitions with false — after whenFontplusReady when
// available. zh (FZYOUHS_510M--GB1-0) and ja (Tazugane) both depend on this.

type FontPlus = {
	reload: (force?: boolean) => void;
	whenFontplusReady?: () => Promise<unknown>;
};

function fp(): FontPlus | undefined {
	if (typeof window === 'undefined') return undefined;
	return (window as unknown as { FONTPLUS?: FontPlus }).FONTPLUS;
}

// Each reload() issues a fresh subset-scan request (PV-metered by FontPlus),
// so the mutation watcher must not re-fire for the DOM churn caused by a
// navigation reload that already scanned the same content.
const WATCH_DEBOUNCE_MS = 300;
const RELOAD_SUPPRESS_MS = 1000;
let lastReloadAt = 0;

export function reloadFontplus(first: boolean): void {
	const f = fp();
	if (!f?.reload) return;
	// Wait one frame so Svelte has painted the new text nodes before the scan.
	requestAnimationFrame(() => {
		lastReloadAt = Date.now();
		try {
			if (typeof f.whenFontplusReady === 'function') {
				f.whenFontplusReady().then(() => f.reload(first)).catch(() => f.reload(first));
			} else {
				f.reload(first);
			}
		} catch {
			/* loader blocked (e.g. unregistered domain) — system fallbacks apply */
		}
	});
}

/**
 * Watch for text that appears WITHOUT a navigation (form action results,
 * client-side month switches, dropdowns) — those characters were never scanned
 * by the loader. Debounced so bursts of DOM patches coalesce into one reload.
 */
export function watchFontplus(): () => void {
	if (typeof window === 'undefined' || !fp()?.reload) return () => {};
	let timer: ReturnType<typeof setTimeout> | null = null;
	const observer = new MutationObserver(() => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
			// Skip if a navigation-driven reload just scanned this DOM state.
			if (Date.now() - lastReloadAt < RELOAD_SUPPRESS_MS) return;
			reloadFontplus(false);
		}, WATCH_DEBOUNCE_MS);
	});
	observer.observe(document.body, { childList: true, subtree: true, characterData: true });
	return () => {
		observer.disconnect();
		if (timer) clearTimeout(timer);
	};
}
