FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY apps/backend/analytics-service/package.json ./apps/backend/analytics-service/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY apps/backend/analytics-service ./apps/backend/analytics-service
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Build
RUN yarn workspace @bongo-ai/analytics-service build

FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/backend/analytics-service/dist ./dist
COPY --from=builder /app/apps/backend/analytics-service/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4004

CMD ["node", "dist/index.js"]
