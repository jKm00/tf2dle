import { warpaintService } from '#lib/features/gamemodes/warpaint/server/WarpaintService.ts';

export async function GET() {
	return Response.json(await warpaintService.getYesterdaysAnswer());
}
