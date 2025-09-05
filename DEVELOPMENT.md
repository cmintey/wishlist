# Wishlist Development

## Prerequisites

- node v22.x
- [pnpn](https://pnpm.io/installation) v10.x

## Install dependencies

```sh
pnpm install
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

## Running Locally

### Create an env file

An example env file for local development. You might want to customize the database URL to your needs:

```sh
#.env.development

export ORIGIN=http://localhost:3000
export DATABASE_URL="file:$(pwd)//prod.db?connection_limit=1"
```

### First Time Run

```sh
source .env.development
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm db:patch
```

### Start dev server

```sh
pnpm dev
```

### Build

```sh
source .env.development
pnpm run build
```
