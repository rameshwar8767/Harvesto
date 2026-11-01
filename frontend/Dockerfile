# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

COPY . .
RUN npm run build

# Stage 2: Serve with Lightweight Nginx
FROM nginx:alpine AS runner

ARG VERSION=1.0.0
ARG BUILD_DATE
ARG GIT_COMMIT

LABEL maintainer="Harvesto DevOps Team <manerameshwar909@gmail.com>"
LABEL org.opencontainers.image.title="Harvesto Frontend UI"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL version="${VERSION}"

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
