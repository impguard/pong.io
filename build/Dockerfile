FROM node:10.9.0-stretch

########################################
# Install useful debug utilities
########################################

RUN apt-get update && apt-get install -y vim

########################################
# Cleanup package listings
########################################

RUN rm -rf /var/lib/apt/lists/*

########################################
# Add game code
########################################

WORKDIR /game

COPY src ./src
COPY yarn.lock ./yarn.lock
COPY package.json ./package.json

RUN yarn

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

RUN yarn run build:server

CMD ["yarn", "run:server"]
