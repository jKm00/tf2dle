import test, { expect } from '@playwright/test';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '#lib/server/generated/prisma/client.ts';
import type { AdminSettings } from '#lib/server/generated/prisma/browser.ts';

test.describe('Real database API regressions', () => {
	test.describe.configure({ mode: 'serial' });

	let db: PrismaClient;
	let originalSettings: AdminSettings | null | undefined;
	let today: Date;
	let yesterday: Date;
	const gameModes = ['weapon', 'weapon-2', 'warpaint'];
	const path = '/patch-notes';

	test.beforeAll(async () => {
		const databaseUrl = process.env.DATABASE_URL;
		if (!databaseUrl) throw new Error('DATABASE_URL must point to the dedicated test database');
		const url = new URL(databaseUrl);
		if (
			!['postgres:', 'postgresql:'].includes(url.protocol) ||
			url.username !== 'tf2dle_test' ||
			url.pathname !== '/tf2dle_migration_test' ||
			!['localhost', '127.0.0.1'].includes(url.hostname) ||
			!['5432', '55432'].includes(url.port)
		) {
			throw new Error('Refusing to mutate a database outside the dedicated local/CI test database');
		}
		db = new PrismaClient({
			adapter: new PrismaPg({
				connectionString: databaseUrl,
				max: 10,
				connectionTimeoutMillis: 10_000,
				idleTimeoutMillis: 300_000
			})
		});
		originalSettings = await db.adminSettings.findUnique({ where: { id: 1 } });
	});

	test.beforeEach(async () => {
		today = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
		yesterday = new Date(today.getTime() - 86400000);
		await cleanup();
		await db.adminSettings.upsert({
			where: { id: 1 },
			create: { id: 1, metricsLoggingEnabled: true },
			update: { metricsLoggingEnabled: true }
		});
		// Non-midnight inputs must round-trip as SQL dates and match API lookups at the current time.
		const selectedToday = new Date(today.getTime() + 15 * 3600000 + 12345);
		const selectedYesterday = new Date(yesterday.getTime() + 23 * 3600000 + 54321);
		await db.$transaction([
			db.dailyWeapons.createMany({
				data: [
					{ selectedAt: selectedToday, name: 'Scattergun', hasWon: 7 },
					{ selectedAt: selectedYesterday, name: 'Rocket Launcher', hasWon: 11 }
				]
			}),
			db.dailyWeaponsTwo.createMany({
				data: [
					{ selectedAt: selectedToday, name: 'Shortstop', hasWon: 7 },
					{ selectedAt: selectedYesterday, name: 'Force-A-Nature', hasWon: 11 }
				]
			}),
			db.dailyWarpaint.createMany({
				data: [
					{ selectedAt: selectedToday, name: 'Anodized Aloha', hasWon: 7 },
					{ selectedAt: selectedYesterday, name: 'Bank Rolled', hasWon: 11 }
				]
			}),
			db.dailyGameModeMetrics.createMany({
				data: gameModes.map((gameMode) => ({
					date: yesterday,
					gameMode,
					starts: 3,
					guesses: 8,
					wins: 2,
					totalGuessesToWin: 6
				}))
			}),
			db.dailyPageMetrics.create({ data: { date: yesterday, path, views: 9 } })
		]);
	});

	test.afterEach(async () => {
		if (!db) return;
		try {
			if (today) await cleanup();
		} finally {
			if (originalSettings) {
				await db.adminSettings.upsert({
					where: { id: 1 },
					create: originalSettings,
					update: originalSettings
				});
			} else if (originalSettings === null) {
				await db.adminSettings.deleteMany({ where: { id: 1 } });
			}
		}
	});

	test.afterAll(async () => {
		await db?.$disconnect();
	});

	for (const gameMode of gameModes) {
		test(`${gameMode} reuses daily selections and persists wins and compound-key metrics`, async ({
			request
		}) => {
			const endpoint = `/api/v1/game-modes/${gameMode}`;
			const correctGuess =
				gameMode === 'warpaint'
					? 'Anodized Aloha'
					: gameMode === 'weapon'
						? 'Scattergun'
						: 'Shortstop';
			const wrongGuess =
				gameMode === 'warpaint'
					? 'Bank Rolled'
					: gameMode === 'weapon'
						? 'Shortstop'
						: 'Scattergun';
			const yesterdayAnswer =
				gameMode === 'warpaint'
					? 'Bank Rolled'
					: gameMode === 'weapon'
						? 'Rocket Launcher'
						: 'Force-A-Nature';
			const readSelections = () =>
				gameMode === 'warpaint'
					? db.dailyWarpaint.findMany({
							where: { selectedAt: { in: [today, yesterday] } },
							orderBy: { selectedAt: 'asc' }
						})
					: gameMode === 'weapon'
						? db.dailyWeapons.findMany({
								where: { selectedAt: { in: [today, yesterday] } },
								orderBy: { selectedAt: 'asc' }
							})
						: db.dailyWeaponsTwo.findMany({
								where: { selectedAt: { in: [today, yesterday] } },
								orderBy: { selectedAt: 'asc' }
							});
			const seeded = await readSelections();
			expect(seeded).toHaveLength(2);
			expect(seeded[0]).toMatchObject({ selectedAt: yesterday, name: yesterdayAnswer, hasWon: 11 });
			expect(seeded[1]).toMatchObject({ selectedAt: today, name: correctGuess, hasWon: 7 });

			for (let i = 0; i < 2; i++) {
				const response = await request.get(endpoint);
				expect(response.status()).toBe(200);
				if (gameMode === 'weapon') {
					expect(await response.json()).toBe(7);
				} else if (gameMode === 'warpaint') {
					expect(await response.json()).toEqual({
						warpaint: {
							thumbnail: '7595369081124629595',
							crop: { x: 0.32, y: 0.29, width: 0.18, height: 0.18 }
						},
						numberOfCorrectGuesses: 7
					});
				} else {
					expect(await response.json()).toEqual({
						weapon: {
							numberOfTotalAttributes: 5,
							attributes: [{ text: 'When weapon is active:', variant: 'neutral' }]
						},
						numberOfCorrectGuesses: 7
					});
				}
				const previous = await request.get(`${endpoint}/yesterday`);
				expect(previous.status()).toBe(200);
				expect(await previous.json()).toBe(yesterdayAnswer);
			}
			expect(await readSelections()).toEqual(seeded);

			const wrong = await request.post(endpoint, {
				data: { guess: wrongGuess, numberOfGuesses: 1 }
			});
			expect(wrong.status()).toBe(200);
			expect(await wrong.json()).toMatchObject({ name: wrongGuess, correct: false });
			expect(await readSelections()).toEqual(seeded);
			const key = { date_gameMode: { date: today, gameMode } };
			const firstMetric = await db.dailyGameModeMetrics.findUnique({ where: key });
			expect(firstMetric).toMatchObject({
				date: today,
				gameMode,
				starts: 1,
				guesses: 1,
				wins: 0,
				totalGuessesToWin: 0
			});

			const correct = await request.post(endpoint, {
				data: { guess: correctGuess, numberOfGuesses: 2 }
			});
			expect(correct.status()).toBe(200);
			expect(await correct.json()).toMatchObject({ name: correctGuess, correct: true });
			expect(await readSelections()).toEqual([seeded[0], { ...seeded[1], hasWon: 8 }]);
			const metric = await db.dailyGameModeMetrics.findUnique({ where: key });
			expect(metric).toEqual({ ...firstMetric, guesses: 2, wins: 1, totalGuessesToWin: 2 });
			expect(await db.dailyGameModeMetrics.count({ where: { date: today, gameMode } })).toBe(1);
			expect(
				await db.dailyGameModeMetrics.findUnique({
					where: { date_gameMode: { date: yesterday, gameMode } }
				})
			).toMatchObject({ starts: 3, guesses: 8, wins: 2, totalGuessesToWin: 6 });

			await db.adminSettings.update({ where: { id: 1 }, data: { metricsLoggingEnabled: false } });
			const unloggedWin = await request.post(endpoint, {
				data: { guess: correctGuess, numberOfGuesses: 3 }
			});
			expect(unloggedWin.status()).toBe(200);
			expect(await unloggedWin.json()).toMatchObject({ correct: true });
			expect(await readSelections()).toEqual([seeded[0], { ...seeded[1], hasWon: 9 }]);
			expect(await db.dailyGameModeMetrics.findUnique({ where: key })).toEqual(metric);
			await db.dailyGameModeMetrics.delete({ where: key });
			const unloggedGuess = await request.post(endpoint, {
				data: { guess: wrongGuess, numberOfGuesses: 1 }
			});
			expect(unloggedGuess.status()).toBe(200);
			expect(await unloggedGuess.json()).toMatchObject({ correct: false });
			expect(await db.dailyGameModeMetrics.findUnique({ where: key })).toBeNull();
			expect(await readSelections()).toEqual([seeded[0], { ...seeded[1], hasWon: 9 }]);
		});
	}

	test('Warpaint only accepts guesses and unlocks consistent clues at the scheduled guess counts', async ({
		request
	}) => {
		const endpoint = '/api/v1/game-modes/warpaint';
		const options = await (await request.get('/api/v1/warpaints')).json();
		expect(options).toHaveLength(163);
		expect(
			options.every((option: object) => Object.keys(option).sort().join() === 'name,thumbnail')
		).toBe(true);
		for (const data of [
			null,
			{},
			{ guess: 'Missing paint', numberOfGuesses: 1 },
			{ guess: 'Anodized Aloha', numberOfGuesses: 0 },
			{ action: 'reveal', numberOfGuesses: 1 },
			{ action: 'reveal', guess: 'Bank Rolled', numberOfGuesses: 1 }
		]) {
			expect((await request.post(endpoint, { data })).status()).toBe(400);
		}
		expect(
			await db.dailyGameModeMetrics.findUnique({
				where: { date_gameMode: { date: today, gameMode: 'warpaint' } }
			})
		).toBeNull();
		const first = await (
			await request.post(endpoint, { data: { guess: 'Bank Rolled', numberOfGuesses: 1 } })
		).json();
		expect(first).toMatchObject({
			name: 'Bank Rolled',
			correct: false,
			feedback: {
				collection: { value: 'Infernal Reward Collection', status: 'incorrect' },
				grade: { value: 'Commando', status: 'incorrect' }
			}
		});
		expect(first).not.toHaveProperty('action');
		expect(first).not.toHaveProperty('shortlist');
		expect(first).not.toHaveProperty('collection');
		const sameCollection = await (
			await request.post(endpoint, { data: { guess: 'Croc Dusted', numberOfGuesses: 2 } })
		).json();
		expect(sameCollection).toMatchObject({
			correct: false,
			feedback: {
				collection: { value: 'Jungle Jackpot Collection', status: 'correct' },
				grade: { value: 'Commando', status: 'incorrect' }
			}
		});
		const early = await (
			await request.post(endpoint, { data: { guess: 'Bloom Buffed', numberOfGuesses: 3 } })
		).json();
		expect(early).toMatchObject({
			correct: false,
			feedback: {
				collection: { value: 'Infernal Reward Collection', status: 'incorrect' },
				grade: { value: 'Mercenary', status: 'correct' }
			}
		});
		expect(early).not.toHaveProperty('shortlist');
		const shortlist = await (
			await request.post(endpoint, { data: { guess: 'Bamboo Brushed', numberOfGuesses: 4 } })
		).json();
		expect(shortlist.shortlist).toHaveLength(6);
		expect(shortlist).toMatchObject({
			correct: false,
			feedback: {
				collection: { value: 'Jungle Jackpot Collection', status: 'correct' },
				grade: { value: 'Mercenary', status: 'correct' }
			}
		});
		expect(new Set(shortlist.shortlist.map((option: { name: string }) => option.name)).size).toBe(
			6
		);
		expect(shortlist.shortlist).toContainEqual({ name: 'Anodized Aloha', ruledOut: false });
		expect(shortlist).not.toHaveProperty('collection');
		const final = await (
			await request.post(endpoint, { data: { guess: 'Bloom Buffed', numberOfGuesses: 5 } })
		).json();
		expect(final.collection).toBe('Jungle Jackpot Collection');
		expect(final.shortlist.some((option: { ruledOut: boolean }) => option.ruledOut)).toBe(true);
		expect(final.shortlist.map((option: { name: string }) => option.name)).toEqual(
			shortlist.shortlist.map((option: { name: string }) => option.name)
		);
		const correct = await (
			await request.post(endpoint, { data: { guess: 'Anodized Aloha', numberOfGuesses: 6 } })
		).json();
		expect(correct).toMatchObject({
			correct: true,
			name: 'Anodized Aloha',
			feedback: {
				collection: { value: 'Jungle Jackpot Collection', status: 'correct' },
				grade: { value: 'Mercenary', status: 'correct' }
			}
		});
		expect(correct).not.toHaveProperty('action');
		expect(correct).not.toHaveProperty('answer');
		expect(
			await db.dailyGameModeMetrics.findUnique({
				where: { date_gameMode: { date: today, gameMode: 'warpaint' } }
			})
		).toMatchObject({ starts: 1, guesses: 6, wins: 1, totalGuessesToWin: 6 });
		expect(await db.dailyWarpaint.findFirst({ where: { selectedAt: today } })).toMatchObject({
			hasWon: 8
		});
	});

	test('Concurrent first visits share one daily warpaint selection', async ({ request }) => {
		await db.dailyWarpaint.deleteMany({ where: { selectedAt: today } });
		const responses = await Promise.all(
			Array.from({ length: 8 }, () => request.get('/api/v1/game-modes/warpaint'))
		);
		const puzzles = await Promise.all(
			responses.map(async (response) => {
				expect(response.status()).toBe(200);
				return response.json();
			})
		);
		expect(puzzles.every((puzzle) => JSON.stringify(puzzle) === JSON.stringify(puzzles[0]))).toBe(
			true
		);
		expect(await db.dailyWarpaint.count({ where: { selectedAt: today } })).toBe(1);
		await expect(
			db.dailyWarpaint.create({ data: { selectedAt: today, name: 'Bank Rolled' } })
		).rejects.toMatchObject({ code: 'P2002' });
	});

	test('Page views reuse the date/path key and stop creating or updating metrics when disabled', async ({
		request
	}) => {
		const key = { date_path: { date: today, path } };
		expect((await request.get(path)).status()).toBe(200);
		const firstMetric = await db.dailyPageMetrics.findUnique({ where: key });
		expect(firstMetric).toMatchObject({ date: today, path, views: 1 });
		expect((await request.get(path)).status()).toBe(200);
		const metric = await db.dailyPageMetrics.findUnique({ where: key });
		expect(metric).toEqual({ ...firstMetric, views: 2 });
		expect(await db.dailyPageMetrics.count({ where: { date: today, path } })).toBe(1);
		expect(
			await db.dailyPageMetrics.findUnique({ where: { date_path: { date: yesterday, path } } })
		).toMatchObject({ views: 9 });

		await db.adminSettings.update({ where: { id: 1 }, data: { metricsLoggingEnabled: false } });
		expect((await request.get(path)).status()).toBe(200);
		expect(await db.dailyPageMetrics.findUnique({ where: key })).toEqual(metric);
		await db.dailyPageMetrics.delete({ where: key });
		expect((await request.get(path)).status()).toBe(200);
		expect(await db.dailyPageMetrics.findUnique({ where: key })).toBeNull();
	});

	async function cleanup() {
		await db.$transaction([
			db.dailyWeapons.deleteMany({ where: { selectedAt: { in: [today, yesterday] } } }),
			db.dailyWeaponsTwo.deleteMany({ where: { selectedAt: { in: [today, yesterday] } } }),
			db.dailyWarpaint.deleteMany({ where: { selectedAt: { in: [today, yesterday] } } }),
			db.dailyGameModeMetrics.deleteMany({
				where: { date: { in: [today, yesterday] }, gameMode: { in: gameModes } }
			}),
			db.dailyPageMetrics.deleteMany({ where: { date: { in: [today, yesterday] }, path } })
		]);
	}
});
