FROM node:lts AS base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm ci

COPY . .

FROM base AS production

RUN npm run build && mkdir -p customWads && ln -s /data/main.sqlite main.sqlite

ENV NODE_ENV=production

EXPOSE 2000

VOLUME /data

CMD ["sh", "-c", "node dist/db/runMigration.js && exec node dist/index.js"]
