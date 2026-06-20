FROM node:24-slim@sha256:24dc26ef1e3c3690f27ebc4136c9c186c3133b25563ae4d7f0692e4d1fe5db0e AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm@latest-11

# Build step
FROM base AS build
# Deps for prisma and building packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 openssl git \
    && rm -rf /var/lib/apt/lists/*

# Build flags for compatibility on older systems
ENV RUSTFLAGS="-C target-cpu=x86-64 -C target-feature=-sse4.1,-sse4.2,-avx,-avx2"
ENV CFLAGS="-march=x86-64 -mtune=generic"
ENV CXXFLAGS="-march=x86-64 -mtune=generic"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma/ ./prisma/
RUN pnpm prisma generate
COPY src/ ./src
COPY templates/ ./templates
COPY static/ ./static
COPY vite.config.ts tsconfig.json svelte.config.js ./
ARG VERSION="unk"
ARG SHA="unk"
ENV VERSION=${VERSION}
ENV SHA=${SHA}
RUN pnpm run build
RUN pnpm prune --prod

# Bring everything together
FROM base AS app
ENV NODE_ENV=production
ENV BODY_SIZE_LIMIT=5000000

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "entrypoint.sh", "prisma.config.ts", "./"]
COPY ./templates/ ./templates
COPY ./prisma/ ./prisma/

RUN chmod +x entrypoint.sh

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build/
COPY --from=build /usr/src/app/src/lib/generated/prisma ./src/lib/generated/prisma

VOLUME /usr/src/app/uploads
VOLUME /usr/src/app/data

ENV DEFAULT_CURRENCY=USD
ENV TOKEN_TIME=72

ENTRYPOINT [ "sh", "entrypoint.sh" ]