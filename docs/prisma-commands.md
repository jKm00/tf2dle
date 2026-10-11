# Prisma commands

Commands load `.env` by default. Set `DOTENV_CONFIG_PATH` to use another file, or supply `DATABASE_URL` in the shell.

## Generate migration

```sh
pnpm exec prisma migrate dev --name <migration-name>
```

Requires `DATABASE_URL` pointing to a development database. May reset development data. Run `pnpm db:client` afterward.

## Generate or update Prisma client

```sh
pnpm db:client
```

Does not require a database connection or `DATABASE_URL`. Run after schema changes and before checking, testing, or building a fresh checkout.

## Deploy committed migrations

```sh
pnpm db:migrate
```

Requires `DATABASE_URL`. Applies committed migrations without creating new ones or generating the client.

## Check migration status

```sh
pnpm exec prisma migrate status
```

Requires `DATABASE_URL`.

## Browse database

```sh
pnpm db:studio
```

Requires `DATABASE_URL`. Opens Prisma Studio.
