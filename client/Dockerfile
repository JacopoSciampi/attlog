FROM node:16-alpine

WORKDIR '/app'

COPY package.json .
COPY yarn.lock ./

RUN yarn set version 3.6.0
RUN yarn install

COPY . .


EXPOSE 4200

CMD ["yarn", "start-prod"]
