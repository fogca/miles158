import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getReservationByCode } from '$lib/server/reservation';
import { clearSessionCookie } from '$lib/server/reserve-session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
	const db = getDb(platform);
	const res = await getReservationByCode(db, params.code);
	if (!res) throw error(404, 'Reservation not found');

	const vehicle = res.vehicle_id
		? await db
				.prepare('SELECT display_name, subtitle, image_url FROM vehicles WHERE id = ?')
				.bind(res.vehicle_id)
				.first<{ display_name: string; subtitle: string | null; image_url: string | null }>()
		: null;

	// The flow is done — drop the scratch cookie so a refresh starts clean.
	clearSessionCookie(cookies);

	return {
		reservation: {
			code: res.code,
			status: res.status,
			total: res.total_amount,
			deposit: res.deposit_amount,
			pickupAt: res.pickup_scheduled_at,
			returnAt: res.return_scheduled_at
		},
		vehicle
	};
};
