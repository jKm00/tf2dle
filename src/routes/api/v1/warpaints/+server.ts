import { warpaintService } from '#lib/features/gamemodes/warpaint/server/WarpaintService.ts';

export function GET() {
	return Response.json(warpaintService.getWarpaints());
}
