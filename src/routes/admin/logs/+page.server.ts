import { getAdminPassword, isAdminAuthenticated, isAdminEnabled } from '#lib/server/adminAuth.ts';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const adminPassword = getAdminPassword();

	if (!isAdminEnabled(adminPassword)) {
		error(404, 'Not found');
	}

	if (!isAdminAuthenticated(cookies, adminPassword)) {
		redirect(303, '/admin/login');
	}
};
