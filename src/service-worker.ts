/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

// PWA service worker for iPad/iPhone staff use. STRATEGY:
//   * Pre-cache immutable build assets + static files (hashed, safe to cache).
//   * NEVER cache dynamic data — /api, /dashboard and /reserve always hit the
//     network so availability and booking state are never stale (a cached
//     dashboard could cause double-booking). Those requests pass straight
//     through to the network.

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `m158-cache-${version}`;
const ASSETS = [...build, ...files];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const req = event.request;
	if (req.method !== 'GET') return;
	const url = new URL(req.url);
	if (url.origin !== location.origin) return;

	// Dynamic surfaces are network-only — do not serve stale state.
	if (
		url.pathname.startsWith('/api') ||
		url.pathname.startsWith('/dashboard') ||
		url.pathname.startsWith('/reserve')
	) {
		return;
	}

	// Cache-first for immutable build assets / static files.
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.match(req).then((cached) => cached ?? fetch(req))
		);
	}
});
