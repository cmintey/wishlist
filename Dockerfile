FROM node:24-slim@sha256:ba849c60be29959425b8734d57b8b4b7d56f98edd9504c9af091d5281095a71e AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    COREPACK_HOME=/usr/bin/corepack
RUN corepack enable pnpm

WORKDIR /usr/src/app

# Build step
FROM base AS build
# Deps for prisma and building packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 openssl git \
    && rm -rf /var/lib/apt/lists/*

# Build flags for compatibility on older systems
ENV RUSTFLAGS="-C target-cpu=x86-64 -C target-feature=-sse4.1,-sse4.2,-avx,-avx2" \
    CFLAGS="-march=x86-64 -mtune=generic" \
    CXXFLAGS="-march=x86-64 -mtune=generic"

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
RUN pnpm build && pnpm prune --prod

# Download Caddy from github
FROM --platform=$BUILDPLATFORM alpine:3.24.2@sha256:294b683cb724975bec92580e1e685676bd4b50bda910ddb8c51d4cabeaec77e6 AS caddy

ARG TARGETPLATFORM
ARG CADDY_VERSION=2.10.0

WORKDIR /
RUN apk add --no-cache curl tar
RUN case "${TARGETPLATFORM}" in \
    "linux/amd64") ARCH="amd64" ;; \
    "linux/arm64") ARCH="arm64" ;; \
    "linux/arm/v7") ARCH="armv7" ;; \
    *) echo "Unsupported platform: ${TARGETPLATFORM}" && exit 1 ;; \
    esac && \
    curl -L "https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_linux_${ARCH}.tar.gz" \
    | tar -xz

# Bring everything together
FROM base AS app
ENV NODE_ENV=production \
    BODY_SIZE_LIMIT=5000000 \
    PRISMA_HIDE_UPDATE_MESSAGE=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=caddy /caddy /usr/bin/caddy
COPY ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "entrypoint.sh", "prisma.config.ts", "Caddyfile", "./"]
COPY ./templates/ ./templates
COPY ./prisma/ ./prisma/

COPY --from=build /usr/src/app/node_modules ./node_modules
RUN chmod +x entrypoint.sh && \
    chmod +x /usr/bin/caddy && \
    echo "verifyDepsBeforeRun: false" >> pnpm-workspace.yaml && \
    pnpm install --frozen-lockfile --prod

COPY --from=build /usr/src/app/build ./build/
COPY --from=build /usr/src/app/src/lib/generated/prisma ./src/lib/generated/prisma

VOLUME /usr/src/app/uploads
VOLUME /usr/src/app/data

ENV DEFAULT_CURRENCY=USD \
    TOKEN_TIME=72 \
    COREPACK_ENABLE_NETWORK=0

ENTRYPOINT [ "sh", "entrypoint.sh" ]