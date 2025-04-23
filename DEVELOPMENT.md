# Wishlist Development

## Prerequisites 

- node v22.x
- [pnpn](https://pnpm.io/installation) v9.x

## Install
```
npm install
```

## Building Docker
```
docker build . --tag wishlist-dev:latest
```
Specific platform, current linux/amd64 and linux/arm64 are confirmed supported 
```
docker build . --tag kylek1782/wishlist:amd64  --platform linux/amd64
docker build . --tag kylek1782/wishlist:amd64  --platform linux/arm64
```

## Running Locally

### Build
```
source .env.development
pnpm run build 
```

### First Time Run
```
source .env.development
pnpm prisma migrate deploy
pnpm prisma db seed
pnpm db:patch
```

### Start
```
pnpm start

# Recompile and run
pnpm build; pnpm start
```
