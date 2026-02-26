# Wishlist Development

## Prerequisites

- node v24.x
- [pnpm](https://pnpm.io/installation) v10.x

## Install dependencies

```sh
pnpm install
```

## Running Locally

### Create an env file

An example env file for local development. You might want to customize the database URL to your needs:

```sh
#.env.development

export ORIGIN=http://localhost:3000
export DATABASE_URL="file:$(pwd)//dev.db"
```

### First Time Run

```sh
source .env.development
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
docker build . --tag wishlist-dev:amd64  --platform linux/amd64
docker build . --tag wishlist-dev:amd64  --platform linux/arm64
```
