// Customer & driver persistence. The customer row doubles as the legal rental
// ledger record (name/address/license/nationality).

import { genId, type DB } from './db';
import { nowIso } from '$lib/time';

export interface CustomerInput {
	nameFamily: string;
	nameGiven: string;
	nameDisplay?: string;
	email?: string;
	phone?: string;
	address?: string;
	nationality?: string;
	preferredLocale?: string;
	licenseKind?: string;
	licenseNumber?: string;
	licenseType?: string;
	licenseExpiry?: string;
	passportNumber?: string;
	entryDate?: string;
}

export async function createCustomer(db: DB, input: CustomerInput): Promise<string> {
	const id = genId();
	const now = nowIso();
	await db
		.prepare(
			`INSERT INTO customers
			 (id, name_family, name_given, name_display, email, phone, address, nationality,
			  preferred_locale, license_kind, license_number, license_type, license_expiry,
			  passport_number, entry_date, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(
			id,
			input.nameFamily,
			input.nameGiven,
			input.nameDisplay ?? null,
			input.email ?? null,
			input.phone ?? null,
			input.address ?? null,
			input.nationality ?? null,
			input.preferredLocale ?? 'ja',
			input.licenseKind ?? null,
			input.licenseNumber ?? null,
			input.licenseType ?? null,
			input.licenseExpiry ?? null,
			input.passportNumber ?? null,
			input.entryDate ?? null,
			now,
			now
		)
		.run();
	return id;
}

export interface DriverInput {
	nameFamily: string;
	nameGiven: string;
	address: string;
	licenseType: string;
	licenseNumber: string;
}

export async function addDriver(db: DB, customerId: string, d: DriverInput): Promise<string> {
	const id = genId();
	await db
		.prepare(
			`INSERT INTO drivers (id, customer_id, name_family, name_given, address, license_type, license_number, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.bind(id, customerId, d.nameFamily, d.nameGiven, d.address, d.licenseType, d.licenseNumber, nowIso())
		.run();
	return id;
}
