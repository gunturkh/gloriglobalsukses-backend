FROM node:16.10.0-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN apk update
RUN apk add chromium

RUN yarn install --pure-lockfile

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start-production" ]
