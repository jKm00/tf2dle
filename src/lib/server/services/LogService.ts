import dayjs from '$lib/configs/dayjsConfig';
import { db } from '../prisma';

class LogService {
	private constructor() {}

	public static async log(event: string, message: string) {
		await db.logs.create({
			data: {
				createdAt: dayjs.utc().toDate(),
				event,
				message
			}
		});
	}
}

export default LogService;
