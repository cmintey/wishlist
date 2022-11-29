export PROTOCOL_HEADER=x-forwarded-proto 
export HOST_HEADER=x-forwarded-host

pnpm prisma migrate deploy
pnpm start