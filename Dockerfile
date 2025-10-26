FROM node:22-slim@sha256:f9f7f95dcf1f007b007c4dcd44ea8f7773f931b71dc79d57c216e731c87a090b AS base
WORKDIR /usr/src/app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack install -g pnpm@latest-10

# Build step
FROM base AS build
# Deps for prisma and building packages
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 openssl git \
    && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma/ ./prisma/
RUN pnpm prisma generate
COPY src/ ./src
COPY templates/ ./templates
COPY static/ ./static
COPY vite.config.ts tsconfig.json tailwind.config.ts svelte.config.js postcss.config.cjs theme.ts ./
ARG VERSION="unk"
ARG SHA="unk"
ENV VERSION=${VERSION}
ENV SHA=${SHA}
RUN pnpm run build
RUN pnpm prune --prod

# Download Caddy from github
FROM --platform=$BUILDPLATFORM alpine:latest AS caddy

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
ENV NODE_ENV=production
ENV BODY_SIZE_LIMIT=5000000

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=caddy /caddy /usr/bin/caddy
COPY ["package.json", "pnpm-lock.yaml", "entrypoint.sh", "Caddyfile", "./"]
COPY ./templates/ ./templates
COPY ./prisma/ ./prisma/

RUN chmod +x entrypoint.sh && chmod +x /usr/bin/caddy

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/build ./build/

VOLUME /usr/src/app/uploads
VOLUME /usr/src/app/data

ENV DEFAULT_CURRENCY=USD
ENV TOKEN_TIME=72

ENTRYPOINT [ "sh", "entrypoint.sh" ]