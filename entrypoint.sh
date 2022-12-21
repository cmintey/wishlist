export PROTOCOL_HEADER=x-forwarded-proto 
export HOST_HEADER=x-forwarded-host
export DATABASE_URL=file:/usr/src/app/data/prod.db

pnpm prisma migrate deploy
pnpm start