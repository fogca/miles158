import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getDb } from '$lib/server/db';
import { countStaff, authenticate, createStaff, createSession, STAFF_COOKIE } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import type { Cookies } from '@sveltejs/kit';

function setSessionCookie(cookies: Cookies, token: string, expires: string) {
	cookies.set(STAFF_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: new Date(expires)
	});
}

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	return { needsBootstrap: (await countStaff(db)) === 0 };
};

export const actions: Actions = {
	login: async ({ request, platform, cookies, getClientAddress }) => {
		const db = getDb(platform);
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const staff = await authenticate(db, email, password);
		if (!staff) return fail(400, { message: 'メールアドレスまたはパスワードが違います。' });
		const { token, expires } = await createSession(db, staff.id, {
			ip: getClientAddress(),
			ua: request.headers.get('user-agent') ?? undefined
		});
		setSessionCookie(cookies, token, expires);
		throw redirect(303, '/dashboard');
	},

	bootstrap: async ({ request, platform, cookies, getClientAddress }) => {
		const db = getDb(platform);
		if ((await countStaff(db)) > 0) return fail(400, { message: 'すでに管理者が存在します。' });
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const name = String(form.get('name') ?? '').trim() || '管理者';
		if (!email || password.length < 8) {
			return fail(400, { message: 'メールアドレスと8文字以上のパスワードを入力してください。' });
		}
		const id = await createStaff(db, { email, password, name, role: 'admin' });
		const { token, expires } = await createSession(db, id, {
			ip: getClientAddress(),
			ua: request.headers.get('user-agent') ?? undefined
		});
		setSessionCookie(cookies, token, expires);
		throw redirect(303, '/dashboard');
	}
};
