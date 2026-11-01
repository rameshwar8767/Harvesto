# Multi-stage production container for Harvesto
# Stage 1: Build Frontend static assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --prefer-offline
COPY frontend/ ./
RUN npm run build

# Stage 2: Install Backend production dependencies
FROM node:20-alpine AS backend-dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --no-audit --prefer-offline

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ARG VERSION=1.0.0
ARG BUILD_DATE
ARG GIT_COMMIT

LABEL maintainer="Harvesto DevOps Team <manerameshwar909@gmail.com>"
LABEL org.opencontainers.image.title="Harvesto Web Application"
LABEL org.opencontainers.image.description="Harvesto Fresh Groceries E-Commerce Platform"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL version="${VERSION}"

ENV NODE_ENV=production
ENV PORT=5000

# Copy frontend static build for unified delivery
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy backend dependencies and application code
COPY --from=backend-dependencies /app/backend/node_modules ./backend/node_modules
COPY backend ./backend

# Non-root user for security best practices
USER node

EXPOSE 5000

WORKDIR /app/backend
CMD ["node", "server.js"]
