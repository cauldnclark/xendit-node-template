# Builder
FROM 420361828844.dkr.ecr.ap-southeast-1.amazonaws.com/xendit/iss/base-node-12.x.x:1.1 as builder

ARG NPM_TOKEN

WORKDIR /app
COPY . /app


RUN apk update && apk upgrade
# Can replace the RUN above with this one if your builds need python and/or make
# RUN apk update && apk upgrade  && \
#     apk --update add python make

RUN cp .npmrc.example .npmrc && echo -ne "\n//registry.npmjs.org/:_authToken=$NPM_TOKEN" >> .npmrc
RUN npm ci
RUN npm run build
RUN rm -rf node_modules/
RUN npm install --production
RUN rm -f .npmrc

# Distribution
FROM 420361828844.dkr.ecr.ap-southeast-1.amazonaws.com/xendit/iss/base-node-12.x.x:1.1

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/docs /app/docs

RUN chown -R node:node /app
USER node

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
