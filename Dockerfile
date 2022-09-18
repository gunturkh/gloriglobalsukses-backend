FROM node:16.10.0-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --pure-lockfile

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start-production" ]
