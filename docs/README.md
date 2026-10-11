# TF2DLE

A Wordle-like game for Team Fortress 2. Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html), [LoLdle](https://loldle.net/), and [Smidle](https://smidle.net/).

## Getting started

Requires Docker, Node 24 LTS, and pnpm 12.10.1.

1. Copy `.env.example` to `.env` and fill in the values.
2. Install dependencies with `pnpm install --frozen-lockfile`.
3. Start PostgreSQL with `pnpm db:up` in a separate terminal.
4. Once the database is ready, run:

```sh
pnpm db:client
pnpm db:migrate
pnpm dev
```

## Project structure

- `src/routes/`: pages and API endpoints
- `src/lib/`: components, composables, and server code
- `prisma/`: database schema and migrations
- `scripts/`: Python data collectors and updater
- `static/`: local images and other static assets
- `tests/`: unit and integration tests

## Development

```sh
pnpm check       # Svelte and TypeScript checks
pnpm test:unit   # Unit tests
pnpm lint        # Formatting check
pnpm build      # Production build
```

See [testing](testing.md) for the integration database setup and browser tests, and [Prisma commands](prisma-commands.md) for database tasks.

See [future game modes](plans/game-mode-ideas.md) for ranked ideas, Wiki sources, and the Who said it? gameplay plan.

Create a branch from `main`, open a pull request, and wait for passing checks and approval before merging.

## Deployment

Publish a GitHub release to build and deploy a new version. To deploy an existing version or roll back, run the **Deploy** workflow from `main` with its exact image tag.

See [deployment](deployment.md) for runtime configuration and rollback behavior.
