FROM node:16-alpine

RUN apk add --no-cache tzdata

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

ENV TZ=Europe/Rome

EXPOSE 8081
CMD [ "node", "server.js" ]