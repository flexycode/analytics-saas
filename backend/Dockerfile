# ===========================================
# NestJS Backend - Multi-stage Dockerfile
# ===========================================

# -----------------------------
# Base stage
# -----------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# -----------------------------
# Development stage
# -----------------------------
FROM base AS development

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 4000 9229

# Start in development mode
CMD ["pnpm", "run", "start:debug"]

# -----------------------------
# Build stage
# -----------------------------
FROM base AS build

# Install all dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Prune dev dependencies
RUN pnpm prune --prod

# -----------------------------
# Production stage
# -----------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built assets
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Start production server
CMD ["node", "dist/main"]
