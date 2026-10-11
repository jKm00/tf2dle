# Testing

## Unit tests

```sh
pnpm test:unit
pnpm test:unit:watch
```

## Integration tests

Install Playwright browsers with `pnpm exec playwright install`.

Start the disposable test database:

```sh
docker run --detach --rm --name tf2dle-test-postgres \
  -p 127.0.0.1:55432:5432 \
  -e POSTGRES_USER=tf2dle_test -e POSTGRES_PASSWORD=tf2dle_test \
  -e POSTGRES_DB=tf2dle_migration_test postgres:14-alpine
docker exec tf2dle-test-postgres pg_isready -U tf2dle_test -d tf2dle_migration_test
```

Once it accepts connections, set the test environment and run:

```sh
export DOTENV_CONFIG_PATH=/dev/null
export DATABASE_URL=postgresql://tf2dle_test:tf2dle_test@127.0.0.1:55432/tf2dle_migration_test
export ADMIN_PASSWORD=migration-test-password
export CRON_SECRET=migration-test-secret
export PUBLIC_CDN_URL=
export PUBLIC_APP_VERSION=test
pnpm db:client
pnpm db:migrate
pnpm test:integration
```

Tests build and start the production server on port 4173. The database guard requires the test user and database on loopback, with port 55432 locally or 5432 in CI.

```sh
pnpm test:integration settings.test.ts # One file
pnpm test:integration -g "name"        # Matching test names
pnpm test:integration --trace on       # Capture traces
pnpm test                             # Unit and integration tests
```

Stop the disposable database when finished:

```sh
docker stop tf2dle-test-postgres
```

## Python tests

Run from `scripts/`:

```sh
uv run --locked python -m unittest discover -s tests -v
```
