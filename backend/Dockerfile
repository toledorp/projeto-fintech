FROM node:24-alpine AS base
WORKDIR /app
RUN npm install --global pnpm@11.21.0

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# Execute this target separately to apply migrations before starting the app.
FROM dependencies AS migration
COPY .sequelizerc ./
COPY src/config/config.cjs ./src/config/config.cjs
COPY src/migrations ./src/migrations
CMD ["pnpm", "run", "migrate:production"]

FROM base AS production-dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

FROM node:24-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
