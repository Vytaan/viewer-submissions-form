FROM node:lts AS base

WORKDIR /home/node/app

COPY package*.json ./

RUN npm ci

COPY . .

FROM base AS production

RUN npm run build

RUN chmod +x entrypoint.sh

ENV NODE_ENV=production

EXPOSE 2000

VOLUME /data

ENTRYPOINT ["./entrypoint.sh"]
