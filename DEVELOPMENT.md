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

## Running Locally

### Build
```
npm run build 
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
npm run build; pnpm start
```
