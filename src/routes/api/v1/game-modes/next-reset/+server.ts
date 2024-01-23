import { json } from '@sveltejs/kit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function GET() {
	const nextReset = dayjs().utc().add(1, 'day').startOf('day').toISOString();

	return json(nextReset);
}
