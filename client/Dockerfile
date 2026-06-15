# syntax=docker/dockerfile:1

ARG BACKEND_URL=http://localhost:3000

# --- build stage -------------------------------------------------------------
FROM node:20-alpine AS builder
ARG BACKEND_URL
ENV BACKEND_URL=${BACKEND_URL}
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime stage -----------------------------------------------------------
# Uses Next.js standalone output (next.config.ts: output: "standalone").
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone bundle ships server.js + a pruned node_modules; static assets and
# public/ must be copied alongside it (Next does not include them by default).
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
