import dayjs from '$lib/configs/dayjsConfig';
import { db } from '../prisma';

class LogService {
	private static instance: LogService;

	private constructor() {}

	public static getInstance(): LogService {
		if (!LogService.instance) {
			LogService.instance = new LogService();
		}

		return LogService.instance;
	}

	public async log(event: string, message: string) {
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
