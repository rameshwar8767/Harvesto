# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --no-audit --prefer-offline

# Stage 2: Runtime Image
FROM node:20-alpine AS runner

WORKDIR /app

ARG VERSION=1.0.0
ARG BUILD_DATE
ARG GIT_COMMIT

LABEL maintainer="Harvesto DevOps Team <manerameshwar909@gmail.com>"
LABEL org.opencontainers.image.title="Harvesto Backend API"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL version="${VERSION}"

# Security: Run as non-root user
USER node

# Copy dependencies and application source
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . .

# Environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
