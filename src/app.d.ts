// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			// Populated by hooks.server.ts for /dashboard/* requests; null when unauthenticated.
			staff: {
				id: string;
				email: string;
				name: string;
				role: 'admin' | 'manager' | 'staff';
			} | null;
			// Resolved request locale for i18n (defaults to 'ja').
			locale: 'ja' | 'en' | 'zh';
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
