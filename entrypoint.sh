export PROTOCOL_HEADER=x-forwarded-proto
export HOST_HEADER=x-forwarded-host
# SQLite is the zero-config default. Set DATABASE_URL to a postgres:// or
# postgresql:// connection string to opt in to an external Postgres database
# instead - see the README for details.
: "${DATABASE_URL:=file:/usr/src/app/data/prod.db}"
export DATABASE_URL
export PUBLIC_DEFAULT_CURRENCY=${DEFAULT_CURRENCY}
export BODY_SIZE_LIMIT=${MAX_IMAGE_SIZE:-5000000}

caddy start --config /usr/src/app/Caddyfile

# For Postgres, the schema's datasource provider must be flipped and the
# Prisma Client regenerated to match (the running server loads this client at
# runtime rather than bundling it - see src/lib/server/prisma.ts, so this
# regeneration takes effect). These steps write to the app tree
# (prisma/schema.prisma, .svelte-kit/, src/lib/generated/prisma).
#
# For the SQLite default, the build-baked client is already correct, so we
# skip all of that and write nothing to the app tree at startup - this keeps
# the zero-config default compatible with read-only root filesystems (only
# the data/ and uploads/ volumes need to be writable).
case "$DATABASE_URL" in
    postgres://* | postgresql://*)
        # `prisma generate` looks for a project tsconfig.json, which extends
        # ./.svelte-kit/tsconfig.json. That file is only ever created by
        # `svelte-kit sync`, which isn't available in this production image
        # (it's a dev-time dependency). A minimal stub satisfies the lookup
        # without changing how the app itself is typechecked/built.
        mkdir -p .svelte-kit && \
        { [ -f .svelte-kit/tsconfig.json ] || echo '{"compilerOptions":{}}' > .svelte-kit/tsconfig.json; } && \
        node scripts/set-db-provider.mjs && \
        pnpm prisma generate || exit 1
        ;;
esac

pnpm prisma migrate deploy && \
pnpm prisma db seed && \
pnpm db:patch && \
pnpm start