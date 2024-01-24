# TF2DL

A worlde like game for TF2. Inspired by [wordle](https://www.nytimes.com/games/wordle/index.html), [loldle](https://loldle.net/), and [smidle](https://smidle.net/).

## Structure

```
- docs/             # Documentation and command cheat-sheats

- prisma/           # Schema and migrations

- src/              # Sveltekit related filed
  - lib/
    - components/   # Global components
    - composables/  # Global composables
    - features/     # Features wrapped all in one palce
    - server/       # All server code
    - dtos.ts       # Types used between server and client
    - types.ts      # General types
  - routes/         # App routes
    - api/          # Api routes

- static            # Static sveltekit files

- tests             # E2E tests
```

## Getting started

### Prerequisit

- Docker
- Node

### Step by step

1. Add `.env` file. Look at `.env.example` for all the variables needed.
2. Run local postgres with docker:

```
docker compose up -d
```

3. Generate prisma client

```
npx prisma generate
```

4. Apply prisma migration

```
npx prisma migrate deploy
```

4. Run application

```
pnpm dev
```

## Workflow

1. Create a new branch from main where you can develop your feature in piece. Remember to commit regularly!
2. Create a merge request to main when done. Make sure all workflows passes and wait for approval.
3. When approved, merge and delete branch.
