FROM node:24-alpine AS builder

WORKDIR /app

ENV NODE_ENV=build

COPY . ./

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json

CMD ["node", "dist/index.js"]
