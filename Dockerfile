FROM node:lts-slim as build

WORKDIR /usr/src/app

COPY ./ .
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 openssl git \
    && rm -rf /var/lib/apt/lists/*
RUN npm i -g pnpm@latest-8
RUN pnpm i --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:lts-slim as app

ENV NODE_ENV production
ENV BODY_SIZE_LIMIT 5000000

WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    openssl debian-keyring debian-archive-keyring apt-transport-https curl gpg ca-certificates

RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list

RUN apt-get update \
    && apt-get install -y --no-install-recommends caddy \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/src/app/build ./build/
COPY --from=build /usr/src/app/node_modules ./node_modules/
COPY ["package.json", "pnpm-lock.yaml", "entrypoint.sh", "Caddyfile", "./"]
COPY ./templates/ ./templates
COPY ./prisma/ ./prisma/

RUN npm i -g pnpm@latest-8
RUN chmod +x entrypoint.sh

VOLUME /usr/src/app/uploads
VOLUME /usr/src/app/data

ENV DEFAULT_CURRENCY USD
ENV TOKEN_TIME 72

ENTRYPOINT [ "sh", "entrypoint.sh" ]
