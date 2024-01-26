import { json } from '@sveltejs/kit';

export async function GET() {
	return json('Not implemented', { status: 501 });
}
