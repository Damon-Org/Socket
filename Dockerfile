FROM node:latest

EXPOSE 42069

WORKDIR /src/app

COPY package.json .
COPY package-lock.json .

RUN npm i

COPY . .

ENTRYPOINT [ "node", "--experimental-loader=./util/loader.js", "." ]
