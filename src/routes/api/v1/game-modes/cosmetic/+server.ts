import { cosmeticService } from '$lib/server/services/CosmeticService';
import { json } from '@sveltejs/kit';

export async function GET() {
	const todaysCosmetic = await cosmeticService.getTodaysCosmetic();

	return json({
		cosmetic: {
			thumbnail: todaysCosmetic.thumbnail,
			rotation: todaysCosmetic.rotation
		},
		numbersOfCorrectGuesses: todaysCosmetic.hasWon
	});
}

export async function POST({ request }) {
	const { guess, numberOfGuesses } = await request.json();

	const result = await cosmeticService.validateGuess(guess, numberOfGuesses);

	return json(result);
}
