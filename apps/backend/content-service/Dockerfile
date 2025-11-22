FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/content-service/package.json ./apps/backend/content-service/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/backend/content-service ./apps/backend/content-service
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Build
RUN yarn workspace @bongo-ai/content-service build

FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/backend/content-service/dist ./dist
COPY --from=builder /app/apps/backend/content-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4002

CMD ["node", "dist/index.js"]
