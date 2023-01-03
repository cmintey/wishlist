FROM node:lts-slim as build

WORKDIR /usr/src/app

COPY ./ .
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 openssl \
    && rm -rf /var/lib/apt/lists/*
RUN npm i -g pnpm
RUN pnpm i --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:lts-alpine as app

ENV NODE_ENV production
ENV BODY_SIZE_LIMIT 5000000

WORKDIR /usr/src/app

RUN apk add openssl caddy
COPY --from=build /usr/src/app/build ./build/
COPY --from=build /usr/src/app/node_modules ./node_modules/
COPY ["package.json", "pnpm-lock.yaml", "entrypoint.sh", "Caddyfile", "./"]
COPY ./templates/ ./templates
COPY ./prisma/ ./prisma/

RUN npm i -g pnpm
RUN chmod +x entrypoint.sh

VOLUME /usr/src/app/uploads
VOLUME /usr/src/app/data

ENTRYPOINT [ "sh", "entrypoint.sh" ]
