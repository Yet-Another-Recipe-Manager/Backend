###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:20-alpine As development

WORKDIR /usr/src/app


COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./
COPY --chown=node:node prisma ./prisma/

RUN yarn

COPY --chown=node:node . .

RUN yarn prisma generate

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:20-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN yarn --production && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:20-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/src/main.js" ]

###################
# MIGRATION
###################

FROM node:20-alpine As migration

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "yarn", "prisma", "migrate", "deploy" ]

###################
# SEEDING
###################

FROM node:20-alpine As seed

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "yarn", "prisma", "db", "seed" ]