import dayjs from '$lib/configs/dayjsConfig';

export function getGameModeResetTime() {
	return dayjs.utc().endOf('day');
}
