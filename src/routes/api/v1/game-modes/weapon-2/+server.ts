import { json } from '@sveltejs/kit';

/**
 * Returns number of correct guesses for todays weapon
 * @returns number of correct guesses
 */
export async function GET() {
	return json({
		weapon: {
			attributes: [
				{
					text: '+50% faster firing speed',
					variant: 'positive'
				},
				{
					text: 'Knockback on the target and shooter',
					variant: 'positive'
				},
				{
					text: '+20% bullets per shot',
					variant: 'positive'
				},
				{
					text: '-10% damage penalty',
					variant: 'negative'
				},
				{
					text: '-66% clip size',
					variant: 'negative'
				},
				{
					text: 'This weapon reloads its entire clip at once',
					variant: 'neutral'
				}
			]
		},
		numberOfCorrectGuesses: 10
	});
}
