# Toolchain migration plan

Created: 2026-10-10. This is a working checklist; update it after each verified increment.

## Scope and rules

Upgrade the runtime, Svelte/SvelteKit ecosystem, Prisma, and related tooling without changing game rules, persisted browser data, or production database contents. Preserve existing SQL migration history.

Use current stable, mutually compatible versions, not an unrestricted `latest` update. The expanded required scope is Node 24 LTS, npm 12.2.0, pnpm 12.10.1, Svelte 5.57.2 with all application components in runes syntax, SvelteKit 3.0.1, adapter-node 6, Vite 8, Vitest 5, TypeScript 7.0.2, Tailwind 4.3.3, and Prisma 7.10.0. Prisma's `latest` CLI points to an 8.0 release candidate, so explicitly select Prisma 7.

Kit and svelte-check still require the TS6 compiler API. Install Microsoft's TS6 compatibility package under `typescript` and the genuine TS7 package under `@typescript/native`; `tsc` must report version 7 and run in the completion gate alongside Svelte checking. Do not fake peer versions or disable diagnostics. Full runes conversion, Kit 3, and Tailwind 4 are now required, not optional. Prisma 8 and production PostgreSQL remain separate operational work. Do not upgrade an existing PostgreSQL volume by changing its image tag.

## Completion gate

A migration step is complete only after all of these pass on its resulting code and lockfile:

1. `pnpm build`.
2. `pnpm check`, with no errors or warnings.
3. `pnpm test:unit`, in non-watch mode.
4. `pnpm test:integration`, against an isolated PostgreSQL database and a fresh application server.
5. `uv run --locked python -m unittest discover -s tests -v`, from `scripts`, for the existing scraper suite.

Run generation and committed migrations before database-dependent checks. Use explicit test environment variables; never inherit a development or production database URL for regression tests. Formatting of changed files must also pass. Runtime and Prisma steps additionally require a production Docker image build and startup/migration smoke test against a disposable database. A failed or unavailable check leaves the step open, with the blocker recorded below. Do not mark completion from code changes alone.

Record versions, commands, test counts, and failures in the verification log. Run the gate between dependency groups, not just at the end of the entire migration.

## Step 0: baseline and regression coverage

Status: complete. All baseline gates passed with added regression coverage.

- [x] Make test scripts consistently use pnpm and make unit tests non-watch by default.
- [x] Fix the Playwright preview/base URL mismatch and prevent reuse of an unrelated running server.
- [x] Document a disposable database setup with a dedicated port, test-only credentials, and explicit environment variables.
- [x] Run the build, check, unit, browser, and Python suites before dependency upgrades; fix test harness issues without weakening assertions.
- [x] Add real-PostgreSQL regression coverage for persisted daily selection, UTC date handling, win increments, and compound-key metrics upserts. Guard any fixture deletion so it only runs against the dedicated test database.
- [x] Add admin login/session/logout regression coverage and UI coverage for settings/dialog behavior before UI-library changes.
- [x] Add build/type-check gates to shared CI. Locked CLI alignment remains in step 2.
- [x] Pass the complete gate with the additional tests.

## Step 1: supported Node LTS

Status: complete. Full gate and Node 24 production image smoke test passed.

- [x] Declare Node 24 support in `package.json` and add a local runtime version file.
- [x] Update both Docker stages from Node 20 to Node 24 LTS; use the same runtime policy in CI.
- [x] Keep package-manager versions consistent across manifest, Docker, and workflows. Upgrade pnpm in a separate verified increment if needed.
- [x] Keep the installed Prisma migration CLI in production dependencies and invoke it without runtime downloads. This prerequisite moved forward from step 2 after the Node image startup smoke test failed with `prisma: not found`.
- [x] Exclude local environment files from the Docker build context; build without local secrets.
- [x] Pass the complete gate on Node 24.
- [x] Build the production image and verify migration execution, HTTP readiness, and a database-backed request using an isolated database. Do not deploy to production.

## Step 2: Prisma version and CLI alignment

Status: complete. Full gate and offline production image smoke test passed.

- [x] Pin the Prisma 6 CLI and client to the same stable version as a staging step.
- [x] Replace `dlx`/`npx` version hardcodes with the installed, locked CLI in package scripts and CI.
- [x] Package the migration CLI deterministically for production, or introduce a separate migration image/job. Startup must not fetch an untracked CLI from npm.
- [x] Update Prisma command documentation.
- [x] Pass the complete gate and production image smoke test before changing Prisma major versions.

## Step 2a: npm and pnpm 12

Status: complete. Local versions, frozen installs, CI pins, clean image build and offline runtime verified.

- [x] Install npm 12.2.0 and pnpm 12.10.1 locally, and pin the same versions in Docker and CI.
- [x] Update package-manager declarations, dependency-build approvals, and lockfile using pnpm 12; prove frozen-lockfile installs work.
- [x] Pass the complete gate and production image smoke test; verify actual npm/pnpm versions rather than only configuration values.

## Step 3: full Svelte 5 runes and UI migration

Status: complete. All 88 components compile in forced runes mode; full regression and image gates passed.

- [x] Install the compatible final Svelte 5/Kit 3/Vite/plugin/check/test-tool stack. Verify this coupled application increment together with step 4, because the new UI APIs and runes conversion are interdependent.
- [x] Upgrade Testing Library and adapt test mounting, cleanup, and rerendering where needed.
- [x] Upgrade or replace incompatible UI dependencies: bits-ui, cmdk-sv, mode-watcher, svelte-sonner, and icon components. Removed unused cmdk-sv and replaced deprecated lucide-svelte with @lucide/svelte.
- [x] Adapt checked-in UI wrappers and their consumers to supported APIs; preserve keyboard focus, Escape/close behavior, settings, and styling.
- [x] Convert every application `.svelte` component to runes, snippets, and callback props. Remove legacy `export let`, `$:` declarations, slots, event directives, dispatchers, `$$Props`, and legacy dynamic-component syntax. Preserve existing store/localStorage contracts.
- [x] Audit every component and enforce runes mode globally so no legacy component silently remains.
- [x] Add regression coverage for all game modes, destructive settings confirmations, navigation, notifications, and mobile/desktop rendering as needed.
- [x] Fix reactive error-page reads; exercise navigation and error recovery.
- [x] Pass the complete gate and production image smoke test.

## Step 4: SvelteKit 3 and current build/test tooling

Status: complete. Kit 3, native TS7, Tailwind 4, runtime origin handling and all gates verified.

- [x] Review the current Kit 3 migration guide and migrate the used APIs manually.
- [x] Move `svelte.config.js` configuration into the Vite plugin and update the Node adapter.
- [x] Add package `#lib` imports and replace `$lib` references, including explicit module filenames/extensions, test mocks, and component-generator aliases.
- [x] Replace `$app/stores` with `$app/state`; update reactive consumers and mocks rather than doing an import-only replacement.
- [x] Update `$app/environment`, hook type imports, and TypeScript config/include/exclude settings.
- [x] Use adapter-node's standard entry point and Kit 3's build-time `paths.origin`. Pass `ORIGIN` during image builds; changing origins now requires rebuilding. Verify same-origin forms, rejected cross-origin forms, and spoofed host/proxy headers without disabling CSRF checks.
- [x] Upgrade Vite, its Svelte plugin, Vitest, svelte-check, jsdom, and TypeScript. Use TS7 native `tsc` plus Microsoft's TS6 API compatibility package for Kit/Svelte tools; retain full Svelte diagnostics.
- [x] Migrate Tailwind 4 with its Vite plugin, CSS theme/configuration, and current tailwind-merge/tailwind-variants. Preserve theme colors, utility behavior, dialogs, focus styling, and responsive layouts.
- [x] Review removed/deprecated error, navigation, environment, and response APIs actually used by this app.
- [x] Pass the complete gate and production image smoke test, including admin form submissions and real Prisma queries with the new bundler.

## Step 5: stable Prisma 7

Status: complete. Empty/restored databases, schema comparison, full regressions and offline pruned-image startup verified.

- [x] Install matching stable Prisma CLI, client, and PostgreSQL adapter versions explicitly; do not install the Prisma 8 release candidate.
- [x] Add root `prisma.config.ts`, explicit CLI environment loading, schema path, migration path, and database URL configuration.
- [x] Switch to the supported client generator with explicit output; update client and generated-model imports, mocks, and ignored generated files.
- [x] Initialize the shared client with the PostgreSQL driver adapter; choose explicit connection-pool/timeout behavior where required.
- [x] Update generation and migration packaging for CI and Docker, including builds that have no live database connection.
- [x] Apply preserved migrations to an empty disposable database, then test an upgrade against a restored disposable database with existing data and migration records.
- [x] Pass the complete gate and production image smoke test. Verify date-only lookups, counts, metrics upserts, and admin persistence against real PostgreSQL.

## Step 6: smaller dependency maintenance

Status: complete for the requested toolchain. Audit exceptions below remain upstream follow-ups, not silently ignored checks.

- [x] Refresh the requested UI/build/test toolchain, Playwright browsers, formatting tools, and their browser compatibility data.
- [x] Replace the deprecated `@oslojs/crypto` random-integer helper with Node's supported crypto API and tests for its exclusive upper bound and invalid inputs.
- [x] Complete npm/pnpm upgrades in step 2a.
- [x] Review remaining deprecated/transitive packages and security advisories; document exceptions instead of forcing incompatible overrides.
- [x] Pass the complete gate for the final combined maintenance increment.

## Step 7: PostgreSQL support deadline

Status: pending. Separate operational migration; PostgreSQL 14 support ends 2026-11-12.

- [ ] Confirm production database size, extensions, backup access, acceptable downtime, and restore procedure with the operator.
- [ ] Restore a backup into an isolated database and verify it before choosing dump/restore or `pg_upgrade` for PostgreSQL 18.
- [ ] Test all committed migrations and application regression tests on the target PostgreSQL version.
- [ ] Update CI and disposable/local database configurations once tested. Do not point an existing PostgreSQL 14 data directory at a newer image.
- [ ] Write a production cutover and rollback runbook, including backup verification and old-volume retention.
- [ ] Schedule production execution separately; mark the production task complete only after the operator verifies data and application behavior.

## Optional follow-ups

- [ ] Prisma 8 requires a separate query API, schema-contract, and migration-ownership assessment; it is not part of the requested stable Prisma 7 upgrade.
- [ ] Review GitHub Actions, Python/uv, and scraper dependencies separately; keep locked offline tests passing.

## Verification log

### Initial assessment

- Worktree clean before this migration.
- Local Node: 24.18.1; pnpm: 10.21.0; uv: 0.10.4; Docker available.
- Previous assessment ran `pnpm check`: 0 errors, 0 warnings; `pnpm exec vitest run`: 12 files, 55 tests passed.
- At assessment time, full baseline and additional regression coverage were not yet verified.

### Step 0: baseline verified

- `pnpm build` passed on the existing dependency versions. It still emits the pre-existing Kit/Svelte 4 `untrack` export warnings and stale Browserslist data notice; address these in the framework/tooling steps.
- `pnpm check` passed with 0 errors and 0 warnings.
- `pnpm test:unit` passed: 12 files, 55 tests.
- With the documented disposable database and explicit test environment, `pnpm test:integration --reporter=line` passed: 19 tests, including 5 new admin/settings/database regressions.
- `uv run --locked python -m unittest discover -s tests -v` passed: 33 tests.
- Prettier check of changed supported files passed.
- The first admin regression run failed because Playwright's API client did not send a Secure cookie over loopback HTTP. The authenticated assertion now uses browser fetch, matching the app; the full rerun passed without application changes.
- All 14 committed SQL migrations applied successfully to the disposable PostgreSQL 14 database. No development/production database or volume was changed.

### Step 1: Node LTS verified

- Docker now uses `node:24-alpine` in both stages; the built image reports Node 24.21.0. `.nvmrc`, package engines, and CI use the Node 24 major policy. Host checks ran on existing Node 24.18.1; no global runtime installation was changed.
- The first production startup failed with `prisma: not found`. Retaining the locked CLI as a production dependency and invoking its installed binary fixed startup; there is no npm CLI download at runtime.
- `.env` and `.env.*` are excluded from the build context. The successful image was built without local environment files; runtime checks confirmed `/app/.env` is absent and the migration binary exists.
- `pnpm check`: 0 errors, 0 warnings. `pnpm test:unit`: 55 passed. `pnpm test:integration --reporter=line`: 19 passed, including its fresh production build. Python suite: 33 passed. Changed-file formatting and `git diff --check` passed.
- `docker build --quiet --tag tf2dle-migration:node24 --build-arg PUBLIC_APP_VERSION=test .` passed. Startup applied the migration check with no pending migrations, `/` returned 200, and `/api/v1/game-modes/weapon` returned a numeric database-backed response.
- Concurrent Docker and host build/test runs exceeded startup/tool timeouts under resource contention. A longer preview startup allowance and sequential heavy verification completed successfully; test assertions were not relaxed.
- The disposable app container was stopped and removed after verification. No production deployment occurred.

### Step 2: Prisma 6 staging verified

- Prisma CLI and client are both pinned to 6.19.3. Package scripts and shared CI invoke the installed CLI; Docker retains it after production pruning.
- `pnpm install --frozen-lockfile` passed with the regenerated lockfile. Dependency install-script warnings remain because automatic Prisma scripts are not approved; explicit `pnpm db:client` generation and Docker generation both succeeded. Generation remains an explicit prerequisite, not an install-time side effect.
- `pnpm db:client` generated client 6.19.3. `pnpm db:migrate` verified all 14 existing migrations with no pending changes on the disposable database created by the old CLI.
- `pnpm check`: 0 errors, 0 warnings. `pnpm test:unit`: 55 passed. `pnpm test:integration --reporter=line`: 19 passed, including its fresh production build. Python suite: 33 passed. Changed-file formatting and `git diff --check` passed.
- `docker build --quiet --tag tf2dle-migration:prisma6 --build-arg PUBLIC_APP_VERSION=test .` passed without local `.env` files.
- The image started on a Docker internal network with internet access blocked. Migration execution succeeded; HTTP requests from inside the container returned 200 for `/` and the database-backed weapon endpoint. Prisma version output confirmed CLI/client 6.19.3, Node 24.21.0, and packaged Alpine ARM64 query/schema engines. Internal-network port forwarding was unavailable from the host, so this offline smoke check ran inside the container.
- No SQL schema/data migration was added, and no production data or deployment was changed.

### Continuation: requested upgrades verified

The expanded Svelte/runes, Kit, Tailwind, Prisma, and compiler migration was integrated as one coupled application increment, then passed the full gate. Completion below refers to the final combined code and lockfile, not to an untested intermediate dependency bump.

| Tool                                     | Verified version                                 |
| ---------------------------------------- | ------------------------------------------------ |
| Production Node                          | 24.21.0                                          |
| npm                                      | 12.2.0                                           |
| pnpm                                     | 12.10.1                                          |
| Svelte                                   | 5.57.2                                           |
| SvelteKit / Node adapter                 | 3.0.1 / 6.0.0                                    |
| Native TypeScript compiler               | 7.0.2                                            |
| Svelte/Kit TypeScript API implementation | 6.0.3, through Microsoft's compatibility package |
| Prisma CLI / client / PostgreSQL adapter | 7.10.0                                           |
| Tailwind / Vite plugin                   | 4.3.3                                            |
| Vite / Svelte Vite plugin                | 8.3.4 / 7.3.1                                    |
| Vitest / Testing Library                 | 5.0.3 / 5.4.2                                    |
| Playwright                               | 1.64.0                                           |
| Bits UI                                  | 2.19.5                                           |
| Icons / mode watcher / Sonner            | @lucide/svelte 1.55.0 / 1.1.0 / 1.2.1            |
| Prettier / Svelte plugin                 | 3.9.10 / 4.1.1                                   |

- `pnpm install --frozen-lockfile` passed with pnpm 12. Engine and build approvals moved from `.npmrc` into `pnpm-workspace.yaml`; only explicitly approved dependency scripts run.
- `pnpm check` passed with zero errors and warnings. It runs full Svelte checking followed by actual native TS7 `tsc --noEmit`. Seven route event parameters needed explicit generated route types because standalone TS7 does not inject Svelte tooling's contextual types.
- `pnpm test` passed: 17 unit files / 89 unit tests and 42 browser/API tests. Browser tests run `pnpm build && node server.mjs`, exercising the production entry point instead of preview.
- The offline Python suite passed: 33 tests. No scraper dependency or data-generation behavior was changed.
- All 88 application components compile with global forced runes. Source audit found no remaining legacy props, reactive declarations, slots, event directives, dispatchers, legacy dynamic components, `$app/stores`, `$lib`, old environment imports, or deprecated icon imports.
- Regressions cover all five games, guesses and win persistence, errors/retry, route/error reactivity, notifications, timers, database counts/metrics, admin forms/authentication, nested destructive confirmations, keyboard focus, forced colors, mobile overflow, and colorblind preference persistence without navigating away from the current game.
- Bits UI 2 no longer auto-closes AlertDialog actions or initially focuses Cancel. Controlled confirmations and explicit cancel autofocus preserve the original behavior. Fake-clock game tests now advance their outro transition before asserting the dialog has closed.
- Tailwind 4 uses CSS theme tokens and its Vite plugin. The neutral-color CSS typo was fixed; the old small-shadow value and forced-color focus outline semantics were preserved. Mobile overflow came from the rotated Halloween hat, fixed only below the existing `sm` breakpoint; browser dimension checks passed at 320, 375, 390, 639, 640, and 1280 pixels.
- The colorblind enhanced form now handles success/failure locally rather than using Kit 3's cross-page navigation default. Mouse, Space, Enter, reload, failed actions, HTTP errors, and network failures are tested.
- The commit-pinned CDN setting now uses Kit's static public environment API. Full browser gates built with `PUBLIC_CDN_URL=https://migration.invalid/release-images` and verified actual image URLs, rather than testing only an empty/default setting.
- The project's original `skipLibCheck: true` remains unchanged. Application and Svelte diagnostics are not filtered. A narrowly scoped `runed@0.35.1` optional Kit-peer allowance accepts Kit 3; strict peers remain enabled elsewhere. Its consumed utilities and Bits UI consumers passed the regressions.
- `pnpm db:client` runs Kit sync before generation, fixing clean-container generation when `$app/tsconfig` does not exist yet. Generated Prisma files are ignored and excluded from Docker context. Generation and clean Docker builds do not need a live database or embedded credentials.
- The final pruned image built successfully with no local `.env` files. Docker runs `pnpm check && pnpm build` before pruning, so native TS7 and Svelte checking also passed on Linux ARM64. Runtime version checks confirmed Node 24.21.0, npm 12.2.0, and Prisma 7.10.0.
- All 14 committed migrations applied to an empty disposable PostgreSQL database. A `pg_dump` snapshot with notification data, historical/current daily selections, and migration records was restored into a second disposable database. The old Prisma 6 image and new CLI both previously verified that history without pending changes; after Docker recovery the restore and new-image checks were repeated.
- The restored database retained 14 migration records, notification version 7, and historical win count 17. A real API win changed today's count from 5 to 6 and stored starts/guesses/wins/total-guesses-to-win as 1/1/1/1. `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma` reported no differences.
- Final-image startup migrations, database-backed requests, HTTPS canonical-origin login, Secure cookie authentication, spoofed proxy headers, and cross-origin form rejection passed on an internal Docker network with internet access blocked. Request error containment and asynchronous shutdown ordering have focused unit tests; the image also stopped with exit code 0.
- Docker's first clean-build attempt exposed low disk space and a storage I/O failure. With operator approval, Docker Desktop was recovered and only migration image tags were removed. The development database was restarted and `pg_isready` passed; unrelated images and development volumes were not pruned. Disposable databases and final verification were recreated afterward.
- Local host gates used Node 24.18.1; no global Node installation was changed. Docker and CI use the Node 24 LTS policy. CI definitions are updated; remote GitHub Actions were not triggered because no commit, push, or deployment was requested.

### Upstream audit exceptions

`pnpm audit --prod` reports three advisories in Prisma 7.10.0's CLI dependency tree. This is not a clean security audit. They are documented rather than hidden by audit ignores or forced cross-major dependency overrides.

| Dependency         | Severity / advisory           | Current scope                                                                                                                                                      |
| ------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| deepmerge-ts 7.1.5 | High, GHSA-ggr8-5vv4-36mx     | Prisma CLI configuration merging. This project supplies trusted, nonrecursive config objects, not request-controlled object graphs. Upstream fix requires major 8. |
| mysql2 3.15.3      | High, GHSA-3f6p-5ww8-9rcr     | Prisma CLI's unused MySQL backend. This application and migrations use PostgreSQL, not MySQL authentication.                                                       |
| mysql2 3.15.3      | Moderate, GHSA-rgwj-5xj2-c3m3 | Prisma CLI's unused MySQL compressed protocol. No application request path uses it.                                                                                |

Follow up when Prisma 7 ships patched dependencies or when a separately reviewed, scoped override can be validated. The CLI remains in the runtime image for locked startup migrations; its dependency tree therefore still appears in production audits. Do not describe these advisories as fixed.

## Current checkpoint

All requested application/toolchain upgrades are complete and verified: steps 0 through 6, including 2a. PostgreSQL production cutover and Prisma 8 remain outside this application migration. No production deployment was performed.

The migration app container, internal network, both disposable databases, and migration image tags were removed after verification. The final app stopped with exit code 0. The development database is running again after the approved Docker recovery; its volume and data were not modified by the migration. Unrelated images and volumes were preserved. Ignored test reports and build cache remain available; no images were published.

## References

- [Node release schedule](https://nodejs.org/en/about/previous-releases)
- [Svelte 5 migration](https://svelte.dev/docs/svelte/v5-migration-guide)
- [SvelteKit 3 migration](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)
- [Prisma 7 migration](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)
- [PostgreSQL support policy](https://www.postgresql.org/support/versioning/)
