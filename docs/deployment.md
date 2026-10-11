# Deployment

## Release a new version

Publish a GitHub release. The **Release** workflow builds and publishes `ghcr.io/edvardsen-dev/tf2dle/sveltekit` with the release tag and `latest`, then deploys it.

The build sets `PUBLIC_CDN_URL` to the release commit's images. Local development uses `/images`.

## Deploy an existing version or roll back

Run **Deploy** from `main` in GitHub Actions and enter the exact image tag, including `v` if present. `latest` is not accepted. The workflow checks that the image is accessible before changing server files.

Both workflows use the current default branch's Compose file and deployment script. Rollback selects an older app image but applies the current configuration and secrets. It may also recreate the PostgreSQL container with a newer patch of `postgres:14-alpine`.

Prisma migrations run at app startup and are not reversed. The selected image must support the current database schema. A failed readiness check does not automatically restore the previous container.

After a successful deployment, the script removes unused local images belonging to this app. GHCR images and database volumes are preserved.

## Runtime configuration

Production starts with `node build`. Supply `DATABASE_URL`, `ADMIN_PASSWORD`, and `CRON_SECRET` at runtime through Compose.

Compose sets `PROTOCOL_HEADER=x-forwarded-proto` and `HOST_HEADER=x-forwarded-host`, and binds the app to `127.0.0.1:3010`. Nginx overwrites these headers with the public protocol and host, which adapter-node uses for request URLs and CSRF checks. Configure public domains in Nginx.

For a local container check, run:

```sh
docker compose -f docker-compose.test.yaml up --build
```

Open `http://localhost:3000` through the included Nginx proxy.
