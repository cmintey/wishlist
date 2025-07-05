export PROTOCOL_HEADER=x-forwarded-proto 
export HOST_HEADER=x-forwarded-host
export DATABASE_URL="file:/usr/src/app/data/test.db?connection_limit=1"
export PUBLIC_DEFAULT_CURRENCY=${DEFAULT_CURRENCY}

caddy start --config /usr/src/app/Caddyfile

pnpm prisma db push && pnpm prisma db seed
pnpm start