FROM node:lts-slim as build

WORKDIR /usr/src/app

COPY ./ .
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 \
    && rm -rf /var/lib/apt/lists/*
RUN npm i -g pnpm
RUN pnpm i
RUN pnpx prisma generate
RUN pnpm run build


FROM node:lts-slim as app

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/build ./build/
COPY --from=build /usr/src/app/node_modules ./node_modules/
COPY ["package.json", "pnpm-lock.yaml", "prisma/", "./"]
RUN npm i -g pnpm
RUN pnpm prune
RUN pnpx prisma generate

CMD ["node", "build"]