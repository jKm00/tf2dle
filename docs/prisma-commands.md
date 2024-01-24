# Prisma Commands

## Generate migration

```
npx prisma migrate dev --name <name of migration>
```

## Generate / Update prisma client

```
npx prisma generate
```

## Deploy migration (not necessary as this is done in the pipeline)

```
npx prisma migrate deploy
```