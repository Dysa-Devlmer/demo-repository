# ============================================
# ChatBotDysa Backend - Multi-stage Dockerfile
# ============================================
# Creado: 2025-10-04 00:08
# Para: Instalación en 3 restaurantes (Windows/macOS/Linux)
# ============================================

# ============================================
# STAGE 1: Build
# ============================================
# Cambiado de Alpine a Debian para mejor compatibilidad con dependencias
FROM node:20 AS builder

# Metadata
LABEL maintainer="ChatBotDysa <devlmer@zgamersa.com>"
LABEL description="ChatBotDysa Backend API - NestJS"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# ============================================
# STAGE 2: Production
# ============================================
# Usando node:20-slim (Debian) para producción
FROM node:20-slim

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Create app user (security best practice)
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Create directories for logs and uploads
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8005

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application with dumb-init
CMD ["dumb-init", "node", "dist/src/main"]
