# fixed version because of https://github.com/nodejs/node/issues/35582 in function controller
FROM --platform=linux/amd64 node:16.13.1 as BUILD_IMAGE

WORKDIR /usr/src/app

#RUN curl -sf https://gobinaries.com/tj/node-prune | sh

COPY dist/package.deps.json ./package.json
COPY yarn.lock ./
RUN yarn

COPY domain ./domain
COPY package.json ./
RUN yarn run prisma:gen

#RUN npm prune --production
#RUN node-prune

FROM --platform=linux/amd64 node:16.13.1-alpine

WORKDIR /usr/src/app

COPY --from=BUILD_IMAGE /usr/src/app/node_modules ./node_modules
COPY dist ./dist
COPY dist/CHECKS ./CHECKS

CMD ["node", "dist/collector/main.js"]
