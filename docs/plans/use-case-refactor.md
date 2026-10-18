# Use-case-centered refactor plan

Status: proposed implementation plan. This branch adds documentation only.

## Contents

- [Recommended design](#1-recommended-design)
- [Current behavior and compatibility](#2-what-exists-today)
- [Structure and dependency rules](#3-target-structure-and-dependency-rules)
- [Shared server use cases](#4-shared-server-use-cases)
- [Cosmetic server example](#5-concrete-server-slice-cosmetic)
- [Remote functions](#6-remote-functions-as-controllers)
- [Client architecture and examples](#7-shared-client-use-cases-with-mode-specific-state)
- [Storage constraints](#8-storage-and-concurrency-with-the-existing-schema)
- [New and custom modes](#9-adding-custom-behavior-and-entirely-new-modes)
- [Other application features](#10-apply-the-same-pattern-to-the-rest-of-the-application)
- [Migration sequence](#11-migration-sequence)
- [Verification](#12-test-strategy-and-examples)
- [Completion criteria](#13-completion-criteria)

## 1. Recommended design

Organize the application by feature and use case. Within each use case, separate the framework controller, business service, and storage ports. Compose those services with ordinary constructor or function injection.

For games, share the daily-answer lifecycle, submission orchestration, browser progress lifecycle, statistics, and presentation shell. Give each mode its own answer-selection rules, feedback, clues, public data projection, progress extensions, and components.

Keep the six page routes explicit. Export statically declared remote functions for each mode. A new mode should be able to reuse the daily guessing workflow, replace part of it, or implement a different workflow without adding flags to every existing mode.

The key distinction is between a consistent structure and identical implementations. A map-image game and an attribute game can follow the same dependency rules without sharing their clue model.

### Constraints

- Preserve all existing page URLs, including `/`, `/patch-notes`, `/admin`, `/admin/login`, `/admin/logs`, `/admin/notification`, and `/game-modes/{weapon,weapon-2,map,cosmetic,unusual,warpaint}`.
- Preserve the rendered UI, text, images, keyboard interactions, loading and error behavior, animations, settings, sharing, and navigation order.
- Preserve existing answers, community counters, metrics, notifications, authentication, local progress, streaks, and statistics.
- Keep `prisma/schema.prisma` and the migration history unchanged. No new tables, columns, constraints, or data cleanup are required by this refactor.
- Prefer SvelteKit remote functions for interactive reads and mutations. Keep page loads, actions, and hooks where they own route-specific framework behavior.
- Use `pnpm`. The repository declares `pnpm@12.10.1` and Node 24.

### Avoid these abstractions

- A `BaseGameService` subclass hierarchy with hooks for every conceivable game.
- One runtime `GameService` switch over all six modes.
- A generic Prisma repository that indexes delegates with a mode string or uses `any` to make incompatible tables fit.
- A global DI container or service locator called from business services.
- One Svelte component that knows every mode's clue fields.
- A shared registry that imports server implementations into browser code.

## 2. What exists today

These findings determine the migration order and compatibility requirements.

| Area                  | Current implementation                                                                                           | Refactor consequence                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Server game logic     | Five services in `src/lib/server/services/`; Warpaint under `src/lib/features/gamemodes/warpaint/server/`        | Move to feature-owned use cases and mode implementations                                      |
| Dependency injection  | Services accept repositories, but import catalogs, time, randomness, logging, and singleton instances themselves | Inject every external dependency; construct production instances separately                   |
| HTTP controllers      | Repeated current-game, catalog, guess, and yesterday endpoints                                                   | Replace browser API calls with typed remote queries and commands                              |
| Client game lifecycle | `useGameEngine.ts` handles Weapon, Unusual, and Warpaint; Map, Cosmetic, and Weapon 2 duplicate it in pages      | Extract one progress service with typed mode-specific progress adapters                       |
| Shared game UI        | `GameShell.svelte` assumes guesses have a string `name`; Map has `name.value`                                    | Give the shell a presentation model or snippets instead of a guess-shape constraint           |
| Daily answers         | Lazy selection, including selection for a missing yesterday row                                                  | Preserve lazy selection and historical lookup behavior                                        |
| Daily uniqueness      | Only `DailyWarpaint.selectedAt` is unique                                                                        | Preserve explicit per-table repositories; do not generalize Warpaint's upsert to other tables |
| Metrics               | Static `MetricsService` imports Prisma directly and catches recording failures                                   | Extract business aggregation and repository writes; keep recording best-effort                |
| Notifications         | Existing function-based use cases already accept repository dependencies                                         | Reuse this approach and move those use cases into their feature                               |
| Admin                 | Repeated authentication checks; log pagination lives in an endpoint                                              | Extract reusable auth controllers and feature-owned log use cases                             |
| Tests                 | Browser tests intercept `/api/v1` URLs                                                                           | Migrate test seams alongside transport changes                                                |

The project is already on `@sveltejs/kit` 3.0.1. `vite.config.ts` enables remote functions and async Svelte compilation. No framework upgrade belongs in this work. The remote-function examples below use the installed `$app/server` `query` and `command` APIs and their Standard Schema validation overloads.

### Mode-by-mode compatibility inventory

| Mode     | Server-specific behavior                                                                                                                                                                          | Browser-specific behavior                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weapon   | Exact-name guess lookup; release-year extraction with 2007 fallback; class aliases; order-sensitive equality and partial overlap for arrays; ammo comparison; current win count in guess response | Comparison grid; 3,500 ms victory delay; weapon-only emoji grid in sharing                                                                         |
| Weapon 2 | Answer pool contains weapons with more than one attribute; mask the answer name in attribute text; initial clue is attribute index 1; returned clues use the existing `slice(1, tries + 2)` rule  | Separate stored clues and revealed answer; 500 ms victory delay; all-weapon picker remains broader than the answer pool                            |
| Map      | Case-insensitive guess lookup; game-mode and year comparisons; stored crop origin from x 0..1920 and y 0..1080                                                                                    | Nested `name.value` feedback; expanding image reveal; stored answer label; 2,000 ms victory delay                                                  |
| Cosmetic | Stored rotation is 0, 90, 180, or 270; resolve image and class from current catalog with stored-value fallback; class clue at attempt 9                                                           | Rotating/obscured icon; separate stored `usedBy`; 500 ms victory delay                                                                             |
| Unusual  | Rotation and catalog fallback like Cosmetic; series clue at attempt 9                                                                                                                             | Separate stored series; 1,000 ms victory delay; current load failures reach the route error page                                                   |
| Warpaint | Unique-date upsert; crop fallback; collection and grade feedback; stable date-and-answer-seeded shortlist at attempt 4; collection and elimination at attempt 5                                   | Larger crop at 1, canvas at 2, full image at 3; shortlist replaces input; inline retry message; 2,000 ms victory delay or zero with reduced motion |

Use the current services and components as executable specifications. Preserve array ordering, hint thresholds, date serialization, catalog resolution, image paths, and share text while extracting them.

Weapon's initial GET currently reads only the community counter and returns zero when no daily row exists. Its load use case should retain that behavior rather than selecting today's answer just because the other modes do so during loading. Map's coordinate generator currently uses `Math.random`, while answer selection uses `crypto.randomInt`; inject both sources where needed and preserve their bounds.

### Browser storage is a public compatibility contract

All modes persist `<prefix>_guesses`, `<prefix>_last_event`, `<prefix>_streak`, and `<prefix>_stats`.

| Page mode  | Storage prefix | Additional keys                              |
| ---------- | -------------- | -------------------------------------------- |
| `weapon`   | `weapon`       | None                                         |
| `weapon-2` | `weapon_2`     | `weapon_2_clues`, `weapon_2_correct_weapon`  |
| `map`      | `map`          | `map_todays_map_name`                        |
| `cosmetic` | `cosmetic`     | `cosmetic_used_by`                           |
| `unusual`  | `unusual`      | `unusual_series`                             |
| `warpaint` | `warpaint`     | Clues are embedded in stored guess responses |

Weapon 2 stores `{ name, correct }` guesses, without `guessedAt`. Its separate last-event record supplies the date. Do not require every stored guess to have the wire-response shape.

Keep these keys and serialized values during this refactor. A storage adapter can expose a better in-memory model without rewriting the user's data into a new format. Keep the homepage's solved status and settings' clear-statistics actions connected to the same keys.

## 3. Target structure and dependency rules

Use feature folders first, then use-case folders. Put reusable mode rules beside the mode. Put repositories next to the feature that owns their storage rather than creating a new global repository directory.

Proposed paths:

```text
src/lib/
  features/
    games/
      contracts.ts
      mode-metadata.ts
      resolve-daily/
        service.ts
        ports.ts
      submit-guess/
        service.ts
        ports.ts
        input-schema.ts
      load-game/
        contracts.ts
      player-progress/
        model.ts
        restore-progress.ts
        accept-guess.ts
        complete-victory.ts
        ports.ts
        local-storage-repo.ts
        controller.svelte.ts
      presentation/
        GameShell.svelte
        GameLoadingSkeleton.svelte
        CommunityStatus.svelte
        CompletedResult.svelte
        VictoryDialog.svelte
        StatsDialog.svelte
        Input.svelte
        YesterdayAnswer.svelte
      modes/
        cosmetic/
          contracts.ts
          load-game/controller.remote.ts
          submit-guess/controller.remote.ts
          yesterday/controller.remote.ts
          server/
            model.ts
            application.server.ts
            evaluate-guess.ts
            project-current.ts
            daily-repo.prisma.server.ts
          client/
            progress-policy.ts
            progress-repo.ts
            CosmeticGame.svelte
            Hints.svelte
            GuessesList.svelte
        weapon/
        weapon-two/
        map/
        unusual/
        warpaint/
      catalogs/
        weapon-catalog.server.ts
        map-catalog.server.ts
        cosmetic-catalog.server.ts
        unusual-catalog.server.ts
        warpaint-catalog.server.ts
    metrics/
      record-guess/service.ts
      record-page-view/service.ts
      get-dashboard/service.ts
      set-logging/service.ts
      ports.ts
      server/application.server.ts
      server/metrics-repo.prisma.server.ts
    notifications/
      get-public/service.ts
      get-admin/service.ts
      update/service.ts
      set-active/service.ts
      ports.ts
      server/notification-repo.prisma.server.ts
      presentation/
    admin-session/
      authenticate/service.ts
      verify-session/service.ts
      server/cookie-controller.server.ts
      server/hmac-token.server.ts
    admin-logs/
      list/service.ts
      list/controller.remote.ts
      server/log-repo.prisma.server.ts
    patch-notes/
    preferences/
    theme/
  server/
    composition/
      games/cosmetic.ts
      games/weapon.ts
      games/weapon-two.ts
      games/map.ts
      games/unusual.ts
      games/warpaint.ts
      metrics.ts
      notifications.ts
      admin.ts
    prisma.ts
    generated/prisma/
    data/
  shared/
    time.ts
    result.ts
  components/ui/
src/routes/                         # Existing page paths remain
tests/unit/features/                # Mirrors use cases
tests/integration/                  # Browser and real-database coverage
```

This tree names the intended ownership. Add files when their responsibilities are extracted; do not create empty layers for every folder. A three-line pure function does not need an interface and implementation class.

Existing generated Prisma output stays at its configured path. Static source datasets can stay under `$lib/server/data` initially. Catalog adapters hide their location from services. Update Python producer paths and their tests if a later move changes where generated datasets are written.

### Dependency direction

```text
page / component
  -> client controller -> progress service -> progress repository port
  -> remote controller -> application service -> repository port
                                      -> mode policy

composition root -> concrete repositories + services + external adapters
Prisma repository -> Prisma client
localStorage repository -> browser Storage
```

Rules:

1. Business services accept plain values and injected dependencies. They do not import Svelte, `$app/*`, `@sveltejs/kit`, Prisma, browser globals, `fetch`, environment variables, or production singleton instances.
2. Controllers parse transport data, authorize requests, map expected failures, and choose framework responses. Services own clue rules, scoring, progression, and notification edit rules.
3. Repository interfaces belong to their consumers. Implementations translate between storage records and application models. They do not decide which answer to select or when a clue unlocks.
4. Pure models and functions may be shared with the browser. Private catalogs, answers, database access, and credentials stay behind server-only modules.
5. A folder named `server` inside a feature is not itself a SvelteKit import guard. Use `.server.ts` for concrete server modules and `$lib/server` for composition roots. Remote controllers are `.remote.ts` files outside `$lib/server` so clients can import the generated stubs.
6. Split browser-safe contracts from server models. Never return a Prisma row by spreading it into a public DTO.
7. Use `$lib/...` consistently in application code. Migrate existing `#lib` imports gradually; keep the package import alias until scripts and tests no longer need it.

Plain factories provide sufficient DI. Tests pass in fake clocks, deterministic random sources, in-memory repositories, and recording metrics sinks. Production composition roots instantiate stateless services once. Player state and request cookies are never singleton dependencies.

## 4. Shared server use cases

There are three useful pieces of shared server behavior:

- Resolve an existing daily record or select and persist one.
- Submit a guess, record a correct answer, and record metrics.
- Load the data a mode needs, including its public current-game projection and picker options.

The first two warrant small generic services. The third usually needs only a short mode-specific function. Do not add a generic loader with flags for every loading variation.

### 4.1 Common contracts

File: `src/lib/features/games/contracts.ts`

```ts
export type GameModeId = 'weapon' | 'weapon-2' | 'map' | 'cosmetic' | 'unusual' | 'warpaint';

export interface GuessInput {
	guess: string;
	numberOfGuesses: number;
}

export interface GuessResult {
	correct: boolean;
	guessedAt: string;
}

export type PlayResult<T> = { ok: true; value: T } | { ok: false; reason: 'invalid-guess' };
```

The common result deliberately has no `name`, `thumbnail`, `attributes`, or hint union. Each mode owns those fields. `GameModeId` is an explicit list of registered modes, not a reason for the core services to branch on mode.

File: `src/lib/shared/time.ts`

```ts
export interface Clock {
	now(): Date;
}

// Application-owned UTC calendar date, formatted YYYY-MM-DD.
export type DayKey = string;

export function utcDay(date: Date): DayKey {
	return date.toISOString().slice(0, 10);
}

export function previousUtcDay(date: Date): DayKey {
	const previous = new Date(date);
	previous.setUTCDate(previous.getUTCDate() - 1);
	return utcDay(previous);
}
```

Validate external date strings at controllers if any use case later accepts them. Today's date comes from the injected server clock, not a client-supplied date. Preserve the existing `dayjs.utc().format()` timestamp representation through an injected formatter during migration.

### 4.2 Resolve the daily answer

File: `src/lib/features/games/resolve-daily/ports.ts`

```ts
import type { DayKey } from '$lib/shared/time';

export interface DailyRepository<Daily, Selection> {
	find(day: DayKey): Promise<Daily | null>;
	saveSelection(day: DayKey, selection: Selection): Promise<Daily>;
	incrementWins(day: DayKey): Promise<void>;
}
```

File: `src/lib/features/games/resolve-daily/service.ts`

```ts
import type { DayKey } from '$lib/shared/time';
import type { DailyRepository } from './ports';

export function createResolveDailyService<Daily, Selection>(deps: {
	repo: DailyRepository<Daily, Selection>;
	select: (day: DayKey) => Selection;
	onSelected: (selection: Selection, day: DayKey) => void;
}) {
	return async function resolveDaily(day: DayKey): Promise<Daily> {
		const existing = await deps.repo.find(day);
		if (existing) return existing;

		const selection = deps.select(day);
		const saved = await deps.repo.saveSelection(day, selection);
		deps.onSelected(selection, day);
		return saved;
	};
}
```

`onSelected` is a logging adapter, not a place for extra game rules. It must handle asynchronous logging failures internally. Preserve existing mode event names and messages. Warpaint can inject a no-op because its current service does not log selections.

`saveSelection` returns the persisted record. Warpaint may return an existing winner of a concurrent upsert. Consumers must use that returned record rather than assuming their random selection won.

Concurrency for the other five tables is discussed in section 8. This interface does not claim that `find` followed by `saveSelection` is atomic.

### 4.3 Submit a guess

File: `src/lib/features/games/submit-guess/ports.ts`

```ts
import type { GameModeId } from '../contracts';
import type { DayKey } from '$lib/shared/time';

export interface GuessMetrics {
	// The implementation contains failures, matching current metrics behavior.
	record(event: {
		mode: GameModeId;
		day: DayKey;
		attempt: number;
		correct: boolean;
	}): Promise<void>;
}
```

File: `src/lib/features/games/submit-guess/service.ts`

```ts
import type { Clock, DayKey } from '$lib/shared/time';
import { utcDay } from '$lib/shared/time';
import type { GameModeId, GuessInput, PlayResult } from '../contracts';
import type { GuessMetrics } from './ports';

export function createSubmitGuessService<Feedback extends { correct: boolean }>(deps: {
	mode: GameModeId;
	clock: Clock;
	formatTimestamp: (date: Date) => string;
	evaluate: (input: GuessInput, context: { day: DayKey }) => Promise<PlayResult<Feedback>>;
	incrementWins: (day: DayKey) => Promise<void>;
	metrics: GuessMetrics;
}) {
	return async function submitGuess(
		input: GuessInput
	): Promise<PlayResult<Feedback & { guessedAt: string }>> {
		const now = deps.clock.now();
		const day = utcDay(now);
		const evaluated = await deps.evaluate(input, { day });
		if (!evaluated.ok) return evaluated;

		if (evaluated.value.correct) await deps.incrementWins(day);

		await deps.metrics.record({
			mode: deps.mode,
			day,
			attempt: input.numberOfGuesses,
			correct: evaluated.value.correct
		});

		return {
			ok: true,
			value: { ...evaluated.value, guessedAt: deps.formatTimestamp(now) }
		};
	};
}
```

The clock is read once per submission. Selection, counter updates, and metrics share the captured day. A slow request crossing midnight must not record its answer against one day and its metrics against another.

Evaluation can contain asynchronous daily lookup but should delegate comparisons to a pure mode function. Recording metrics is not part of that comparison.

Weapon's additional `numberOfCorrectGuesses` response field belongs in its submit use case. Call the shared service, then add the post-increment count through the Weapon repository. Do not burden the other five modes with that field or make the shared service inspect a mode ID.

This preserves today's anonymous accounting model. A correct request increments the community count; the browser prevents normal repeat submissions. There is no server-side player session or durable idempotency key in the current schema. Do not promise exactly-once wins or silently add automatic command retries.

## 5. Concrete server slice: Cosmetic

Cosmetic is a useful first extraction because it has a custom persisted clue, a custom public projection, and duplicated client lifecycle code.

The following examples form the intended server slice. Other modes supply the same kinds of dependencies with their own models. Paths shown here are proposed files, not files created by this documentation branch.

### 5.1 Models and pure rules

File: `src/lib/features/games/modes/cosmetic/server/model.ts`

```ts
export interface Cosmetic {
	name: string;
	image: string;
	usedBy: string;
}

export interface CosmeticSelection {
	name: string;
	thumbnail: string;
	rotation: number;
	usedBy: string;
}

export interface CosmeticDaily extends CosmeticSelection {
	hasWon: number;
}
```

File: `src/lib/features/games/modes/cosmetic/contracts.ts`

```ts
import type { GuessResult } from '../../contracts';

export interface CosmeticGuess extends GuessResult {
	name: string;
	thumbnail: string;
	usedBy?: string;
}

export interface CosmeticCurrent {
	cosmetic: { thumbnail: string; rotation: number };
	numbersOfCorrectGuesses: number;
}

export interface CosmeticGameData {
	current: CosmeticCurrent;
	options: Array<{ name: string; thumbnail: string }>;
}
```

Keep the legacy `numbersOfCorrectGuesses` spelling while moving the implementation. Renaming wire fields is allowed, but doing it separately makes comparison and rollback easier.

File: `src/lib/features/games/modes/cosmetic/server/evaluate-guess.ts`

```ts
import type { GuessInput } from '../../../contracts';
import type { CosmeticGuess } from '../contracts';
import type { Cosmetic, CosmeticDaily } from './model';

export function evaluateCosmeticGuess(
	input: GuessInput,
	daily: CosmeticDaily,
	catalog: readonly Cosmetic[]
): Omit<CosmeticGuess, 'guessedAt'> {
	const guessed = catalog.find((item) => item.name === input.guess);
	const answer = catalog.find((item) => item.name === daily.name);

	return {
		name: guessed?.name ?? '',
		thumbnail: guessed?.image ?? '',
		correct: input.guess === daily.name,
		usedBy: input.numberOfGuesses >= 9 ? (answer?.usedBy ?? daily.usedBy) : undefined
	};
}
```

This deliberately preserves Cosmetic's current unknown-name behavior. Warpaint rejects names outside its catalog. Do not silently turn those different legacy behaviors into one generic name validator. A later API cleanup can make invalid-input behavior consistent; valid player submissions must already match before that change.

File: `src/lib/features/games/modes/cosmetic/server/project-current.ts`

```ts
import type { CosmeticCurrent } from '../contracts';
import type { Cosmetic, CosmeticDaily } from './model';

export function projectCurrentCosmetic(
	daily: CosmeticDaily,
	catalog: readonly Cosmetic[]
): CosmeticCurrent {
	const answer = catalog.find((item) => item.name === daily.name);
	return {
		cosmetic: {
			thumbnail: answer?.image ?? daily.thumbnail,
			rotation: daily.rotation
		},
		numbersOfCorrectGuesses: daily.hasWon
	};
}
```

The public projection omits the answer name and the unrevealed class clue. Keep the existing image identifiers and CDN behavior. This is not a redesign of how difficult it is to infer an answer from image assets.

### 5.2 Repository adapter

File: `src/lib/features/games/modes/cosmetic/server/daily-repo.prisma.server.ts`

```ts
import type { PrismaClient } from '$lib/server/generated/prisma/client';
import type { DailyRepository } from '../../../resolve-daily/ports';
import type { DayKey } from '$lib/shared/time';
import type { CosmeticDaily, CosmeticSelection } from './model';

type Database = Pick<PrismaClient, 'dailyCosmetics'>;

export function createCosmeticDailyRepository(
	db: Database
): DailyRepository<CosmeticDaily, CosmeticSelection> {
	const selectedAt = (day: DayKey) => new Date(`${day}T00:00:00.000Z`);

	const project = (row: CosmeticDaily): CosmeticDaily => ({
		name: row.name,
		thumbnail: row.thumbnail,
		rotation: row.rotation,
		usedBy: row.usedBy,
		hasWon: row.hasWon
	});

	return {
		async find(day) {
			const row = await db.dailyCosmetics.findFirst({
				where: { selectedAt: selectedAt(day) }
			});
			return row ? project(row) : null;
		},
		async saveSelection(day, selection) {
			const row = await db.dailyCosmetics.create({
				data: { selectedAt: selectedAt(day), ...selection }
			});
			return project(row);
		},
		async incrementWins(day) {
			await db.dailyCosmetics.updateMany({
				where: { selectedAt: selectedAt(day) },
				data: { hasWon: { increment: 1 } }
			});
		}
	};
}
```

The deprecated `thumbnail` column remains populated because the schema still requires it and old rows use it as a fallback. Keep `usedBy`, rotations, Map coordinates, and Unusual series in their existing columns.

This example retains the old `findFirst`, `create`, and date-scoped `updateMany` semantics. Test UTC-midnight conversion against the real PostgreSQL `@db.Date` columns before replacing the existing Dayjs calls.

### 5.3 Compose the use cases

File: `src/lib/features/games/modes/cosmetic/server/application.server.ts`

```ts
import type { Clock } from '$lib/shared/time';
import { previousUtcDay, utcDay } from '$lib/shared/time';
import { createResolveDailyService } from '../../../resolve-daily/service';
import type { DailyRepository } from '../../../resolve-daily/ports';
import { createSubmitGuessService } from '../../../submit-guess/service';
import type { GuessMetrics } from '../../../submit-guess/ports';
import type { CosmeticGameData } from '../contracts';
import type { Cosmetic, CosmeticDaily, CosmeticSelection } from './model';
import { evaluateCosmeticGuess } from './evaluate-guess';
import { projectCurrentCosmetic } from './project-current';

export function createCosmeticApplication(deps: {
	repo: DailyRepository<CosmeticDaily, CosmeticSelection>;
	catalog: readonly Cosmetic[];
	clock: Clock;
	randomIndex: (exclusiveMax: number) => number;
	formatTimestamp: (date: Date) => string;
	metrics: GuessMetrics;
	logSelection: (selection: CosmeticSelection) => void;
}) {
	const resolveDaily = createResolveDailyService({
		repo: deps.repo,
		select: () => {
			const item = deps.catalog[deps.randomIndex(deps.catalog.length)];
			return {
				name: item.name,
				thumbnail: item.image,
				usedBy: item.usedBy,
				rotation: deps.randomIndex(4) * 90
			};
		},
		onSelected: deps.logSelection
	});

	const submitGuess = createSubmitGuessService({
		mode: 'cosmetic',
		clock: deps.clock,
		formatTimestamp: deps.formatTimestamp,
		metrics: deps.metrics,
		incrementWins: (day) => deps.repo.incrementWins(day),
		evaluate: async (input, { day }) => ({
			ok: true as const,
			value: evaluateCosmeticGuess(input, await resolveDaily(day), deps.catalog)
		})
	});

	return {
		submitGuess,
		async loadGame(): Promise<CosmeticGameData> {
			const daily = await resolveDaily(utcDay(deps.clock.now()));
			return {
				current: projectCurrentCosmetic(daily, deps.catalog),
				options: deps.catalog.map(({ name, image }) => ({ name, thumbnail: image }))
			};
		},
		async getYesterday(): Promise<string> {
			const daily = await resolveDaily(previousUtcDay(deps.clock.now()));
			return daily.name;
		}
	};
}
```

Check nonempty catalogs once when composing production services. Catalog lookup is a storage boundary too: JSON-backed catalog adapters own loading and parsing, while services receive readonly domain values. Weapon and Weapon 2 can share a catalog adapter and still have different answer pools.

File: `src/lib/server/composition/games/cosmetic.ts`

```ts
import { randomInt } from 'node:crypto';
import dayjs from '$lib/configs/dayjsConfig';
import { db } from '$lib/server/prisma';
import cosmetics from '$lib/server/data/cosmetics.json';
import { createCosmeticApplication } from '$lib/features/games/modes/cosmetic/server/application.server';
import { createCosmeticDailyRepository } from '$lib/features/games/modes/cosmetic/server/daily-repo.prisma.server';
import { guessMetrics, selectionLog } from '$lib/server/composition/metrics';

export const cosmeticApplication = createCosmeticApplication({
	repo: createCosmeticDailyRepository(db),
	catalog: cosmetics,
	clock: { now: () => new Date() },
	randomIndex: randomInt,
	formatTimestamp: (date) => dayjs.utc(date).format(),
	metrics: guessMetrics,
	logSelection: (selection) => {
		selectionLog.record(
			'Cosmetic',
			`Selected cosmetic: ${selection.name} with rotation ${selection.rotation} degrees`
		);
	}
});
```

`src/lib/server/composition/metrics.ts` supplies `guessMetrics: GuessMetrics` and `selectionLog.record(event, message): void`. The latter starts a repository write with an attached rejection handler. Section 10 specifies the underlying metrics and logging services. The example imports JSON directly at the composition boundary; replace that import with the catalog adapter when catalog validation is extracted.

## 6. Remote functions as controllers

Use a separate statically exported query or command for each operation. Remote files may import server-only composition roots; browser imports get SvelteKit's generated client function.

The examples use Valibot for Standard Schema validation. It is not currently a dependency. Add it during the first remote-function implementation with `pnpm add valibot`; this plan does not install it. Keep schemas at the transport boundary, and retain domain checks in services where callers other than remote functions need them.

File: `src/lib/features/games/submit-guess/input-schema.ts`

```ts
import * as v from 'valibot';

export const guessInputSchema = v.strictObject({
	guess: v.string(),
	numberOfGuesses: v.pipe(
		v.number(),
		v.integer(),
		v.minValue(1),
		v.maxValue(Number.MAX_SAFE_INTEGER)
	)
});
```

This matches the normal payload already sent by every page and preserves Warpaint's rejection of extra action payloads. Older endpoints are inconsistent on malformed requests. Document those transport changes rather than mistaking them for game-rule changes. Do not trim or lowercase every guess; that would alter exact-name mode behavior.

File: `src/lib/features/games/modes/cosmetic/load-game/controller.remote.ts`

```ts
import { query } from '$app/server';
import { cosmeticApplication } from '$lib/server/composition/games/cosmetic';

export const getCosmeticGame = query(() => cosmeticApplication.loadGame());
```

File: `src/lib/features/games/modes/cosmetic/yesterday/controller.remote.ts`

```ts
import { query } from '$app/server';
import { cosmeticApplication } from '$lib/server/composition/games/cosmetic';

export const getYesterdayCosmetic = query(() => cosmeticApplication.getYesterday());
```

File: `src/lib/features/games/modes/cosmetic/submit-guess/controller.remote.ts`

```ts
import { command } from '$app/server';
import { error } from '@sveltejs/kit';
import { guessInputSchema } from '../../../submit-guess/input-schema';
import { cosmeticApplication } from '$lib/server/composition/games/cosmetic';

export const submitCosmeticGuess = command(guessInputSchema, async (input) => {
	const result = await cosmeticApplication.submitGuess(input);
	if (!result.ok) error(400, 'Please select a cosmetic from the list.');
	return result.value;
});
```

Keep factories and schemas in ordinary modules. Do not dynamically generate remote exports by iterating a registry. Static per-mode exports preserve result inference and make custom operations easy to add.

### Loading and cache policy

- Keep current-game data and yesterday's answer as separate queries. Yesterday is already independently rendered on most pages and is optional on Warpaint.
- A current-game query can invoke lazy daily initialization, as the current GET endpoints do. Treat this as an idempotent initialization requirement, not as a player start or guess. Query re-execution must not increment metrics or wins.
- Do not put player progress or today's answer in a build-time `prerender` function. Do not apply public CDN caching to per-day remote responses without an explicit expiry policy.
- Scope query handles to a page/component instance. Do not store them in a module-global browser singleton.
- Remote query caching differs from fresh REST fetches. On returning to a mode, refresh an already-cached current-game query and yesterday query. The client loading controller must expose an awaited fresh result before enabling guesses on a new visit. First SSR/hydration can use the request's initial query result.
- Preserve the current reset behavior: progress is reconciled on initialization/remount. Do not add an automatic mid-game reset at midnight as part of this extraction. A mounted game's cross-midnight submission is a characterization case; changing that product behavior needs its own decision.
- Keep loading/error policy mode-specific. Unusual currently fails the route load; Warpaint retains an inline load error and tolerates yesterday failure. Sharing data acquisition does not require changing these outcomes.
- Keep community-counter ownership explicit. Initially, initialize it from load data and increment locally once at the existing victory delay. Do not also refresh and overwrite it after a command, which would double count or change the reveal timing. A later server-authoritative counter design can replace that policy.
- Do not automatically retry a guess command after a network error. The server may already have processed it.

The installed query API exposes `ready`, `current`, `loading`, `error`, and `refresh()`. SvelteKit commands return promises and expose `pending`. Use these APIs in framework controllers. Business services should know neither query handles nor command handles.

### Thin page example

File: `src/routes/(app)/game-modes/cosmetic/+page.svelte`

```svelte
<script lang="ts">
	import CosmeticGame from '$lib/features/games/modes/cosmetic/client/CosmeticGame.svelte';
	import { getCosmeticGame } from '$lib/features/games/modes/cosmetic/load-game/controller.remote';
	import { getYesterdayCosmetic } from '$lib/features/games/modes/cosmetic/yesterday/controller.remote';
	import { submitCosmeticGuess } from '$lib/features/games/modes/cosmetic/submit-guess/controller.remote';

	const game = getCosmeticGame();
	const yesterday = getYesterdayCosmetic();
</script>

<CosmeticGame {game} {yesterday} submitGuess={submitCosmeticGuess} />
```

`CosmeticGame` is the framework controller/view for this page. It owns query freshness, the initial loading state, mounting browser persistence, and passing values to existing visual components. Extract its markup from the current page before changing it. Implement the freshness rule above in its loading controller and test both direct SSR and client navigation.

A mode with route-level load errors can retain a thin `+page.ts` that awaits its remote query. A `+page.server.ts` may call the same application service directly when route-level authorization or server rendering requires it. Avoid fetching the application's own HTTP endpoints from server code.

## 7. Shared client use cases with mode-specific state

Separate browser storage, progress rules, and Svelte reactivity.

| Responsibility                                              | Owner                               |
| ----------------------------------------------------------- | ----------------------------------- |
| Read and write legacy storage keys                          | Progress repository                 |
| Reconcile last event, UTC dates, streak, guesses            | `restore-progress.ts` service       |
| Accept a successful server response                         | `accept-guess.ts` service           |
| Commit delayed victory, statistics, revealed answer         | `complete-victory.ts` service       |
| Pending state, timers, mount/unmount, query handles, toasts | Svelte controller                   |
| Extra clues and conversion from response to stored guess    | Mode progress policy                |
| Image reveals, hints, guesses, share presentation           | Mode components and pure presenters |

### 7.1 Progress models and a pure transition

File: `src/lib/features/games/player-progress/model.ts`

```ts
import type { GuessResult } from '../contracts';

export interface PlayerProgress<StoredGuess, Extra> {
	guesses: StoredGuess[];
	lastEvent: { event: 'won' | 'guessed'; date: string } | null;
	streak: number;
	stats: number[];
	extra: Extra;
}

export interface ProgressPolicy<Result extends GuessResult, StoredGuess, Extra> {
	toStoredGuess(result: Result): StoredGuess;
	afterGuess(extra: Extra, result: Result): Extra;
	afterVictory(extra: Extra, result: Result): Extra;
}
```

File: `src/lib/features/games/player-progress/accept-guess.ts`

```ts
import type { GuessResult } from '../contracts';
import type { PlayerProgress, ProgressPolicy } from './model';

export function acceptGuess<Result extends GuessResult, StoredGuess, Extra>(
	current: PlayerProgress<StoredGuess, Extra>,
	result: Result,
	policy: ProgressPolicy<Result, StoredGuess, Extra>
): PlayerProgress<StoredGuess, Extra> {
	return {
		...current,
		guesses: [policy.toStoredGuess(result), ...current.guesses],
		lastEvent: {
			event: result.correct ? 'won' : 'guessed',
			date: result.guessedAt
		},
		extra: policy.afterGuess(current.extra, result)
	};
}
```

File: `src/lib/features/games/player-progress/complete-victory.ts`

```ts
import type { GuessResult } from '../contracts';
import type { PlayerProgress, ProgressPolicy } from './model';

export function completeVictory<Result extends GuessResult, StoredGuess, Extra>(
	current: PlayerProgress<StoredGuess, Extra>,
	result: Result,
	policy: ProgressPolicy<Result, StoredGuess, Extra>
): PlayerProgress<StoredGuess, Extra> {
	const stats = [...current.stats];
	const index = current.guesses.length - 1;
	stats[index] = (stats[index] ?? 0) + 1;
	return {
		...current,
		streak: current.streak + 1,
		stats,
		extra: policy.afterVictory(current.extra, result)
	};
}
```

The controller calls `completeVictory` exactly once after a successful winning response and the configured delay. A restored same-day win does not pass through it again. Otherwise statistics and streaks would grow on each reload.

File: `src/lib/features/games/modes/cosmetic/client/progress-policy.ts`

```ts
import type { ProgressPolicy } from '../../../player-progress/model';
import type { CosmeticGuess } from '../contracts';

export interface CosmeticProgress {
	usedBy: string | null;
}

export const cosmeticProgressPolicy: ProgressPolicy<
	CosmeticGuess,
	CosmeticGuess,
	CosmeticProgress
> = {
	toStoredGuess: (result) => result,
	afterGuess: (extra, result) => ({ usedBy: result.usedBy ?? extra.usedBy }),
	afterVictory: (extra) => extra
};
```

Weapon 2's policy stores only `{ name, correct }`. It updates failed-guess clues immediately and winning clues plus `correctWeapon` after the reveal delay. Map's policy sets `todaysMapName` on victory. Warpaint needs no extra clue storage because its latest response contains the clues.

### 7.2 Storage adapters

File: `src/lib/features/games/player-progress/ports.ts`

```ts
import type { PlayerProgress } from './model';

export interface ProgressRepository<StoredGuess, Extra> {
	read(): PlayerProgress<StoredGuess, Extra>;
	saveGuess(progress: PlayerProgress<StoredGuess, Extra>): void;
	saveVictory(progress: PlayerProgress<StoredGuess, Extra>): void;
}
```

`saveGuess` writes guesses, last event, and any immediately revealed mode fields. `saveVictory` writes streak, statistics, and victory-only fields. Separate writes preserve the current timing and avoid creating a `<prefix>_stats` key after a failed guess. Add explicit reset/clear operations when extracting restoration and settings.

Construct repositories with a `Storage`-like dependency. Do not read global `localStorage` during module import or server rendering. `createCosmeticProgressRepository(storage)` uses the common legacy-key repository plus an extra-field codec for `cosmetic_used_by`.

For the first implementation, keep the existing JSON shape and sparse histogram behavior, including serialized nulls for unused array buckets. Define decoding and storage-failure behavior with tests before adding recovery behavior. A new storage format or cross-tab synchronization is a separate change.

### 7.3 Svelte controller boundary

File: `src/lib/features/games/player-progress/controller.svelte.ts`

The excerpt below shows submission orchestration. Initialization and the public stats-clear API are separate methods in the same controller, implemented from the current lifecycle and settings behavior.

```ts
import { acceptGuess } from './accept-guess';
import { completeVictory } from './complete-victory';
import type { PlayerProgress, ProgressPolicy } from './model';
import type { ProgressRepository } from './ports';
import type { GuessInput, GuessResult } from '../contracts';

export function createGameSession<Result extends GuessResult, StoredGuess, Extra>(deps: {
	initial: PlayerProgress<StoredGuess, Extra>;
	initialPhase: 'guessing' | 'won';
	initialCommunityWins: number;
	submit: (input: GuessInput) => Promise<Result>;
	repo: ProgressRepository<StoredGuess, Extra>;
	policy: ProgressPolicy<Result, StoredGuess, Extra>;
	victoryDelayMs: number;
	schedule: (callback: () => void, delayMs: number) => () => void;
	reportError: () => void;
}) {
	let progress = $state.raw(deps.initial);
	let phase = $state<'guessing' | 'revealing-win' | 'won'>(deps.initialPhase);
	let pending = $state(false);
	let victoryOpen = $state(false);
	let communityWins = $state(deps.initialCommunityWins);
	let disposed = false;
	let cancelVictory: (() => void) | undefined;

	async function guess(value: string): Promise<Result | undefined> {
		if (disposed || pending || phase !== 'guessing') return;
		pending = true;
		try {
			const result = await deps.submit({
				guess: value,
				numberOfGuesses: progress.guesses.length + 1
			});
			if (disposed) return;

			progress = acceptGuess(progress, result, deps.policy);
			deps.repo.saveGuess(progress);

			if (result.correct) {
				phase = 'revealing-win';
				cancelVictory = deps.schedule(() => {
					if (disposed) return;
					progress = completeVictory(progress, result, deps.policy);
					deps.repo.saveVictory(progress);
					communityWins += 1;
					phase = 'won';
					victoryOpen = true;
				}, deps.victoryDelayMs);
			}
			return result;
		} catch {
			if (!disposed) deps.reportError();
		} finally {
			pending = false;
		}
	}

	return {
		get progress() {
			return progress;
		},
		get phase() {
			return phase;
		},
		get pending() {
			return pending;
		},
		get communityWins() {
			return communityWins;
		},
		get victoryOpen() {
			return victoryOpen;
		},
		closeVictory() {
			victoryOpen = false;
		},
		guess,
		dispose() {
			disposed = true;
			cancelVictory?.();
		}
	};
}
```

Create one controller per mounted game after restoring progress and resolving initial game data. Call `dispose` on teardown. The scheduler adapter uses `setTimeout` and returns a cancellation function. Tests inject a controllable scheduler.

The controller's phase makes the winning-response lock explicit while retaining the existing reveal delay. The excerpt's teardown cancellation is a proposed lifecycle policy, not a claim about existing behavior: characterize navigation or reload during a pending request or victory delay before adopting it. Current pages can leave a timer that writes after navigation. Choose the compatibility behavior in phase 0 and keep that choice isolated from the pure transitions.

Keep current visible error text per mode through `reportError`. Warpaint also consumes the return value to retain its inline error and pending shortlist button state.

### 7.4 Restoration rules to extract

`restore-progress.ts` receives a saved snapshot, current time, and mode-specific initial extra state. It returns restored progress, phase, and the precise writes needed by the repository.

Preserve these cases:

- No last event clears guesses, resets streak, and initializes the mode's clue state.
- A same-day win restores the completed view without incrementing stats or reopening the victory dialog.
- A yesterday win keeps the streak but clears today's guesses and the appropriate mode-specific state.
- An older win resets the streak.
- A last event of `guessed` resets the streak under the current implementation, including a same-day reload. Do not silently substitute a different streak definition.
- Old guesses reset on a new day. Stats persist across days.
- Preserve the different extra-state resets until characterized. For example, `unusual_series` is stored outside `useGameEngine` and does not currently have the same reset logic as Cosmetic's `usedBy`.

The existing streak check mixes `dayjs(lastEvent.date)` with UTC calls. Test multiple browser time zones around midnight before replacing it with a supposedly equivalent date helper. Improving those edge cases is a separate behavior change.

### 7.5 Presentation composition

Move existing components first, preserving their markup and styles. Keep `Input`, hints, image showcases, and guess rows mode-specific where they already differ.

Refactor `GameShell` to consume presentation values and snippets instead of assuming every guess has a string name and image key. Its proposed API is owned by `src/lib/features/games/presentation/GameShell.svelte`:

```ts
import type { Snippet } from 'svelte';

interface Props {
	title: string;
	description: string;
	guessCount: number;
	streak: number;
	loadingState: 'loading' | 'error' | 'success';
	onOpenStats: () => void;
	children: Snippet;
	footer?: Snippet;
	dialogs: Snippet;
}
```

This is the component's script-interface excerpt, not replacement markup. Reuse the current card, header, loading skeleton, error link, seasonal decoration, and footer markup. The `dialogs` snippet lets a mode pass its correctly typed victory image and share payload without making the shell inspect guess fields.

Map and Weapon 2 currently have slightly different shell markup. Preserve those details with a small explicit presentation variant or retain their wrapper until screenshot comparisons prove extraction is equivalent. Do not force them through a visually different shell merely to reduce file count.

Separate mode metadata from player stores. `mode-metadata.ts` contains labels, route paths, storage prefixes, icons or icon keys, next-mode links, and existing new-mode date rules. The homepage constructs a progress summary controller per mode instead of calling `useStats` in a module-global registry.

## 8. Storage and concurrency with the existing schema

Keep one explicit adapter for each existing daily table:

| Mode     | Prisma delegate   | Extra persisted data              |
| -------- | ----------------- | --------------------------------- |
| Weapon   | `dailyWeapons`    | None                              |
| Weapon 2 | `dailyWeaponsTwo` | None                              |
| Map      | `dailyMaps`       | `startingPosX`, `startingPosY`    |
| Cosmetic | `dailyCosmetics`  | `thumbnail`, `rotation`, `usedBy` |
| Unusual  | `dailyUnusuals`   | `thumbnail`, `rotation`, `series` |
| Warpaint | `dailyWarpaint`   | None; crop resolves from catalog  |

Preserve `hasWon` independently from `DailyGameModeMetrics.wins`. Disabling metrics must not disable community win counts.

For Warpaint, preserve the unique-date `upsert` with a no-op update and use the row it returns. Never overwrite an existing answer or reset its wins during initialization.

For the other five modes, the schema permits multiple rows on one date. The extraction stage retains current `findFirst` and `updateMany` semantics. Do not add `findUnique({ selectedAt })`, a uniqueness migration, a new tie-breaker, or silent deduplication.

A schema-preserving concurrency improvement is possible after parity: a repository transaction can take a PostgreSQL transaction-scoped advisory lock for a stable mode/day key, re-read the daily row, and create only when absent. Every writer must use the same lock, including any retained legacy endpoint. An in-memory mutex is insufficient across Node processes. Existing duplicate rows still require an explicit policy; a lock does not repair them.

Keep that hardening as a separately reviewed change. If chosen, test simultaneous initialization with separate database clients and leave `schema.prisma` untouched. The main refactor must not claim stronger uniqueness guarantees than its repositories implement.

### Limits for future modes

The architecture can support new behavior without a shared-engine rewrite. The frozen schema still limits new durable storage.

A new mode can use a deterministic UTC-date selection, readonly assets, and browser-local progress without a new table. It can record aggregate metrics because `DailyGameModeMetrics.gameMode` is a string. A new mode needing persisted multiplayer sessions, arbitrary per-player server state, or a new durable daily record requires a future schema decision or a separately approved storage system. Do not reuse an unrelated daily table or encode JSON into `name` to evade the constraint.

## 9. Adding custom behavior and entirely new modes

### A mode that fits the current workflow

For a new image-guess mode:

1. Add a mode-owned contract, catalog adapter, selection rule, evaluation function, and public projection.
2. Choose a supported daily storage strategy under section 8.
3. Compose `resolveDaily` and `submitGuess` with those dependencies.
4. Export static remote queries and a guess command.
5. Supply a progress policy, persistence codec, and view.
6. Add a thin page, metadata, sharing support, and dashboard labeling.
7. Run the common daily-game contract suite plus the mode's clue tests.

The common submit and progress services should remain unchanged.

### A mode with an extra operation

Suppose a future audio mode lets the user request another clip. Give that operation its own use case. Do not add `action?: 'guess' | 'clip' | 'skip'` to every guess payload.

Proposed file: `src/lib/features/games/modes/audio/reveal-clip/service.ts`

```ts
export interface AudioClips {
	getClip(segment: number): Promise<{ url: string; durationMs: number }>;
}

export function createRevealClipService(clips: AudioClips) {
	return async function revealClip(input: { segment: number }) {
		return clips.getClip(input.segment);
	};
}
```

This is a structural example, not a specification for a shipped mode. A real audio use case would own its reveal rules and server-selected puzzle identity. A readonly clip lookup is a query. An operation that consumes an attempt or persists progress is a command. Both use the same controller/service/repository boundaries.

### A mode with a different workflow

A timed sequence game may have `start-round`, `submit-sequence`, and `finish-round` use cases. It can share the clock, repository conventions, metrics service, shell, settings, and statistics presenter without using `submit-guess` or the daily-guess progress model.

Do not invent a universal `GamePlugin` interface now. Require only the capabilities a particular use case consumes. Registration for navigation is separate from registration for guessing.

## 10. Apply the same pattern to the rest of the application

### Metrics

Extract the static service into these use cases:

| Target                                | Business responsibility                                                                | Repository responsibility               |
| ------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------- |
| `metrics/record-guess/service.ts`     | Normalize attempt number, respect enabled setting, derive increments, contain failures | Upsert existing daily mode metrics      |
| `metrics/record-page-view/service.ts` | Respect enabled setting and preserve tracked path behavior                             | Upsert existing daily page metrics      |
| `metrics/get-dashboard/service.ts`    | Resolve month selection and build dashboard aggregates                                 | Read game and page rows for date bounds |
| `metrics/set-logging/service.ts`      | Change the configured logging state                                                    | Upsert `AdminSettings` row with ID 1    |

Move the pure calculations in `src/lib/server/metricsUtils.ts` with minimal edits. Preserve attempt normalization, month boundaries, starts on attempt 1, guesses per accepted request, wins, total guesses to win, and default-enabled behavior.

Currently page-view recording is called from `/patch-notes`. Do not introduce site-wide hook tracking while moving it. Remote-query refreshes must not count as new game starts or page views.

The game-facing metrics adapter implements `GuessMetrics` and accepts the captured submission day. The dashboard, logging toggle, and gameplay all use the same metrics application services.

### Admin sessions and logs

- Extract password verification and session-token verification into services with injected time and signing dependencies.
- Keep cookie reads/writes, redirects, and environment access in controllers and composition roots.
- Preserve the `tf2dle_admin` cookie, its seven-day lifetime, root path, strict SameSite, HTTP-only behavior, production secure flag, and cleanup of the old `/admin` cookie path.
- Preserve disabled-admin 404s, unauthenticated page redirects, and authentication checks on every protected operation.
- Admin remote functions are standalone request entry points. Check authorization inside every protected query/command; a protected page load does not protect its remote functions.
- Keep login/logout as thin actions initially to preserve form and redirect behavior. Remote `form` can replace an action later if its enhancement and validation behavior match.
- Move log pagination into `admin-logs/list/service.ts` and a repository. Preserve descending ID order, exclusive `afterId`, default limit 30, maximum 100, `limit + 1` lookahead, cursor values, and ISO timestamps.

An admin remote controller gets `getRequestEvent()` at the start of its callback, authenticates its cookies, then calls the service. Never capture the request event or cookies in a singleton.

### Notifications

Move the existing four notification use cases into the feature without rewriting their behavior. Preserve row ID, version increments, types, enable/disable behavior, edit restrictions while enabled, and the public disabled/missing fallbacks. Keep dismiss/version storage and existing banner markup.

The root layout can call `get-public/service.ts` directly. Admin form actions can continue as controllers while their implementation delegates to feature services. Add remote commands only when migrating the associated UI together.

### Preferences, sharing, patch notes, and theme

- Move browser settings persistence into preference repositories. Keep existing keys and cookie behavior, including the root colorblind action and `hooks.server.ts` HTML transformation.
- Keep timer visibility, reduced-motion behavior, seasonal opt-out, muted update notifications, theme behavior, and notification dismissal unchanged.
- Move sharing to pure use cases/presenters. Preserve exact labels, emoji order, links, chronological grid order, and clipboard feedback. Use a mode-owned formatter for Weapon's extra grid instead of widening a shared guess union.
- Keep patch-note data and rendering together. Standardize the folder spelling to `patch-notes` when references are migrated; avoid mixing content edits into the move.
- Keep generic UI primitives under `components/ui`. They do not need service or repository wrappers.
- Keep deployment, static assets, fallback pages, and data-generation tools working. Update imports and documented paths if a move affects them; they do not need artificial controller/service layers.

## 11. Migration sequence

Each phase should be a reviewable change that keeps the application runnable. Start with compatibility tests, then migrate one complete mode before spreading the pattern.

### Phase 0: Capture behavior

Deliverables:

- Add server characterization fixtures for all six modes using controlled catalogs, daily rows, dates, and randomness.
- Record existing browser progress payloads for fresh, in-progress, won-today, won-yesterday, and old games.
- Capture desktop/mobile screenshots and DOM interaction expectations for each mode's loading, guessing, hints, completed state, and dialogs.
- Record exact error policies, timer delays, share strings, notification behavior, and admin redirects.
- Characterize pending-request navigation, victory-delay navigation, midnight crossings, duplicate guesses, and storage failures before choosing any lifecycle changes.

Exit criterion: the compatibility inventory is backed by fixtures and tests, including the differences called out above. Any behavior correction is explicitly identified as a follow-up rather than hidden in an extraction.

### Phase 1: Extract server dependencies behind existing endpoints

Deliverables:

- Create common contracts, clock/random ports, daily resolution, and submit orchestration.
- Extract Cosmetic's pure rules, repository, and composition root.
- Keep its existing REST controllers as adapters to the new services while its UI still uses REST.
- Extract metrics and logging dependencies far enough that game services do not import static Prisma-backed services.

Exit criterion: old endpoints return equivalent normal-game results against the same database records; no schema changes. Service unit tests need no module mocking of Prisma, time, or global random functions.

### Phase 2: Complete the Cosmetic vertical slice

Deliverables:

- Add Standard Schema validation and remote controllers.
- Extract the common client progress services and Cosmetic's storage adapter/policy.
- Move the Cosmetic page body into its feature and inject the remote submit function.
- Preserve the existing shell and markup while replacing the state wiring.
- Update Cosmetic browser tests to exercise the new remote boundary.

Exit criterion: fresh loads, client navigation, returning to a cached query, hints at attempt 9, failures, persisted wins, streaks, and stats match. Existing localStorage values restore correctly.

### Phase 3: Prove that sharing handles different modes

Migrate in this order:

1. Unusual, to reuse the icon-game similarities while retaining its series storage and route-error behavior.
2. Weapon, to exercise typed comparison feedback and its extra win-count response.
3. Map, to prove the common client core does not require a string `name` or icon presentation.
4. Weapon 2, to prove result-to-storage conversion and separate clue state work.
5. Warpaint, to retain its unique persistence strategy, deterministic clues, shortlist interaction, and reduced-motion behavior.

Do not consolidate Cosmetic and Unusual into a generic icon-game class merely because the first two migrations look similar. Extract an additional helper only where the rules are truly identical and tests demonstrate it.

Exit criterion: all six pages use the same dependency pattern and shared lifecycle where applicable. No mode-specific branching has accumulated in the common submission/progress services.

### Phase 4: Consolidate presentation and non-game features

Deliverables:

- Adapt the shell around values/snippets and compare screenshots before removing bespoke wrappers.
- Replace stateful module-level game metadata with plain metadata and per-view summary controllers.
- Migrate notifications, admin sessions, log listing, metrics dashboard, sharing, and preferences into feature-owned use cases.
- Keep route actions where needed for current form behavior; use remote queries/commands for client-driven operations such as log pagination.

Exit criterion: routes, UI, settings, admin authorization, notification versioning, and metrics semantics match. No server mutable player/request state is shared across users.

### Phase 5: Remove the old paths

Deliverables:

- Remove legacy game endpoints after all browser consumers, tests, and documented callers have migrated.
- Remove old game services, duplicate page handlers, global DTO buckets, and obsolete composables once nothing imports them.
- Update Python dataset producer paths only if the datasets moved.
- Update testing and architecture documentation.
- Add a lightweight import-boundary check to CI for forbidden service imports. Use the existing toolchain or a small check rather than adding a DI framework.

Exit criterion: there is one implementation of each use case, no old `/api/v1` fetches in game UI, no schema diff, all required checks pass, and the application build catches any browser import of server-only modules.

### Rollback during migration

Keep REST adapters and remote controllers calling the same services while a mode migrates. Switching a page back must not switch the daily-answer algorithm or storage keys. Never dual-submit a real guess to old and new implementations for comparison because both would increment wins and metrics.

Compare pure evaluations with recorded fixtures. Once a mode is stable, remove its unused adapter rather than leaving two permanent transport paths.

## 12. Test strategy and examples

### Service tests

Tests should prove business behavior with injected data. Avoid tests that merely assert one mock method forwards to another.

File: `tests/unit/features/games/cosmetic-application.test.ts`

```ts
import { describe, expect, it } from 'vitest';
import { createCosmeticApplication } from '$lib/features/games/modes/cosmetic/server/application.server';
import type { CosmeticDaily } from '$lib/features/games/modes/cosmetic/server/model';
import type { GuessMetrics } from '$lib/features/games/submit-guess/ports';

describe('cosmetic daily guessing', () => {
	it('reveals the class on guess nine and counts only the winning guess', async () => {
		let daily: CosmeticDaily | null = null;
		const events: Parameters<GuessMetrics['record']>[0][] = [];
		const app = createCosmeticApplication({
			repo: {
				async find() {
					return daily;
				},
				async saveSelection(_day, selection) {
					daily = { ...selection, hasWon: 0 };
					return daily;
				},
				async incrementWins() {
					if (!daily) throw new Error('Daily row missing');
					daily = { ...daily, hasWon: daily.hasWon + 1 };
				}
			},
			catalog: [
				{ name: 'Team Captain', image: 'captain', usedBy: 'Soldier' },
				{ name: 'Other Hat', image: 'other', usedBy: 'Scout' }
			],
			clock: { now: () => new Date('2026-10-18T12:00:00Z') },
			randomIndex: () => 0,
			formatTimestamp: (date) => date.toISOString(),
			metrics: {
				record: async (event) => {
					events.push(event);
				}
			},
			logSelection: () => {}
		});

		const early = await app.submitGuess({ guess: 'Other Hat', numberOfGuesses: 8 });
		const ninth = await app.submitGuess({ guess: 'Other Hat', numberOfGuesses: 9 });
		const win = await app.submitGuess({ guess: 'Team Captain', numberOfGuesses: 10 });

		expect(early.ok && early.value.usedBy).toBeUndefined();
		expect(ninth.ok && ninth.value.usedBy).toBe('Soldier');
		expect(win.ok && win.value.correct).toBe(true);
		expect((await app.loadGame()).current.numbersOfCorrectGuesses).toBe(1);
		expect(events.map((event) => event.correct)).toEqual([false, false, true]);
		expect(events.every((event) => event.day === '2026-10-18')).toBe(true);
	});
});
```

Add focused coverage for:

- Existing daily records bypass selection; missing records persist selection metadata; yesterday uses the previous UTC day.
- Correct and incorrect results update the expected counters; failed evaluation does not record an accepted guess.
- Metrics failures do not fail gameplay, and disabling metrics does not disable `hasWon` updates.
- Weapon's exact comparison behavior and emitted numeric/string values. Its current DTO declares the release-year value as a string while the service returns a number; correct the type declaration to match observed payloads instead of changing the payload to fit the type.
- Weapon 2's pool filtering, name masking, slice bounds, and initial attribute index. Extract masking without mutating the shared catalog.
- Map's case-insensitive lookup, comparison ordering, and persisted origin bounds.
- Cosmetic and Unusual clue thresholds and catalog-to-row fallbacks.
- Warpaint's deterministic shortlist ordering and membership, elimination threshold, crop fallback, and invalid input.

### Client service and controller tests

- Restore each saved progress fixture with an injected clock, including `weapon_2` keys and its reduced stored-guess shape.
- Keep per-mode reset differences and time-zone edge cases explicit.
- A rejected submission leaves guesses, last event, streak, and stats unchanged and clears pending state.
- A successful response prepends one guess; a winning response commits one victory at the configured delay.
- Restoring a won game does not increment stats again.
- Ensure the common controller's winning-response guard and any teardown policy match the phase-0 decision.
- Keep the Warpaint pending selection and inline retry behavior.

### Repository tests with real PostgreSQL

Use the disposable database procedure in `docs/testing.md`. Mocked Prisma calls cannot prove date comparison or upsert behavior.

- Read/write each existing table with its required columns.
- Confirm UTC date matching across time zones.
- Preserve old answer rows and counters through service initialization.
- Verify Warpaint concurrent initialization returns the same stored answer and does not reset counters.
- Characterize duplicate-date legacy rows without deleting or rewriting them.
- Verify metrics unique keys, settings row defaults, notification version rules, and log pagination.

If advisory-lock hardening is implemented later, add multi-connection concurrency tests in that change.

### Remote/controller tests

Test input validation, expected error mapping, result serialization, and authorization through SvelteKit. Do not unit-test services through remote wrappers.

For ordinary client-controller tests, inject a plain promise-returning transport. The tests do not need to know SvelteKit's generated remote URL or wire encoding.

For browser integration tests, replace existing `/api/v1` interception with seeded disposable database fixtures and deterministic catalogs/time where needed. Add a test-only composition seam for failure scenarios, enabled only by the test build configuration. It must not be a query parameter or production-accessible test endpoint. Preserve at least one real remote round trip per mode and all protected admin operations.

SvelteKit can batch queries and serialize remote responses differently from ordinary JSON. Do not fabricate a `Response.json(oldDto)` at a guessed remote URL and assume that tests the new transport.

### Browser parity checks

Retain the scenarios in `tests/integration/game-modes.test.ts`, `weapon.test.ts`, `warpaint.test.ts`, `settings.test.ts`, `timer.test.ts`, `admin.test.ts`, and `home.test.ts` while changing their setup seams.

Cover direct loads and client navigation, stale query revisits, keyboard selection, duplicate-option filtering, revealed hints, loading and error paths, wins, dialogs, share text, homepage solved summaries, settings, accessibility attributes, reduced motion, and mobile layouts. Use deterministic local image fixtures for screenshots where CDN rendering would make comparisons unstable.

### Implementation checks

Run the following during implementation, after configuring the disposable test environment documented in `docs/testing.md`:

```sh
pnpm check
pnpm test:unit
pnpm test:integration
pnpm build
pnpm lint
```

Run Python tests from `scripts/` if dataset producers or their paths change:

```sh
uv run --locked python -m unittest discover -s tests -v
```

Build verification matters because production SvelteKit enforces server-only boundaries and remote-function transformation. Unit tests alone do not.

## 13. Completion criteria

The refactor is complete when:

- Every existing page route and visual state still works with the same UI and behavior.
- All six game modes use feature-owned controllers, injected application services, and explicit storage adapters.
- Daily lookup, accepted-guess orchestration, progress transitions, and statistics are shared where their behavior is shared.
- Custom clues and presentation remain typed and owned by each mode.
- The examples' small generic services contain no switch on mode ID.
- Remote functions replace browser game REST calls, with tested loading, cache, validation, and error behavior.
- Services can be unit-tested without booting SvelteKit or mocking module-global Prisma instances.
- Existing localStorage records, selected answers, counters, metrics, notifications, and admin sessions remain usable.
- Prisma schema and migration files have no changes.
- Old duplicate implementations and unused transport adapters are removed.
- The full implementation checks pass.

The first useful implementation milestone is the complete Cosmetic slice. It will test the proposed boundaries against real clue storage, daily persistence, remote transport, and existing UI before the same pattern is applied to the other modes.
