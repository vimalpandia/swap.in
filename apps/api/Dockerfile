FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifest and workspace definitions
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install and build packages
RUN npm install
RUN npm run build:shared
RUN npm run prisma:generate --workspace=apps/api
RUN npm run build:api

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --schema=./apps/api/prisma/schema.prisma && node apps/api/dist/server.js"]

