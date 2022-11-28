FROM node:lts-slim as build

WORKDIR /usr/src/app

COPY ./ .
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 openssl \
    && rm -rf /var/lib/apt/lists/*
RUN npm i -g pnpm
RUN pnpm i
RUN pnpx prisma generate
RUN pnpm run build
RUN pnpm prune --prod

FROM node:lts-slim as app

ENV NODE_ENV production
WORKDIR /usr/src/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/src/app/build ./build/
COPY --from=build /usr/src/app/node_modules ./node_modules/
COPY ["package.json", "pnpm-lock.yaml", "./"]
COPY ./prisma/ ./prisma/

CMD ["node", "build"]
