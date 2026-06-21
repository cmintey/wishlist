# Wishlist Development

## Prerequisites

- node v24.x
- [pnpm](https://pnpm.io/installation) v11.x

## Install dependencies

```sh
pnpm install
```

## Running Locally

### Create an env file

Copy `.env.example` to `.env`. The Prisma config (`prisma.config.ts`), the Prisma
client, and SvelteKit all load `.env` automatically via `dotenv`.

```sh
cp .env.example .env
```

Database URL needs to be an **absolute** `file:` URL.

```sh
echo "DATABASE_URL=\"file:$(pwd)/prisma/dev.db\"" >> .env
```

### First Time Run

```sh
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm db:patch
```

### Start dev server

```sh
pnpm dev
```

### Running checks

These checks are run in the CI pipeline.

```sh
pnpm check
pnpm lint
pnpm format --write
```

### Build

```sh
pnpm run build
```

## Building Docker

```sh
docker build . --tag wishlist-dev:latest
```

Specific platform, current linux/amd64 and linux/arm64 are confirmed supported

```sh
docker build . --tag wishlist-dev:amd64 --platform linux/amd64
docker build . --tag wishlist-dev:arm64 --platform linux/arm64
```
