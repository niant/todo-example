FROM node:16-alpine as base

WORKDIR /home/app
COPY package*.json /
EXPOSE 3000 9229

FROM base as dev
ENV NODE_ENV=development
RUN npm i

FROM base as production
ENV NODE_ENV=production
RUN npm ci
