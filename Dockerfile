FROM node:lts-alpine as build

WORKDIR /usr/src/app

COPY ./ .
RUN npm ci
RUN npm run build



FROM node:lts-alpine as app

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/build ./build/
COPY ["package.json", "package-lock.json", "prisma/", "./"]
RUN npm ci
RUN npx prisma generate

CMD ["node", "build"]