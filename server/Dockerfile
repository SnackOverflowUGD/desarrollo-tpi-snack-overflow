# syntax=docker/dockerfile:1

# --- build stage -------------------------------------------------------------
# node:20-slim (glibc) so argon2's prebuilt native binary resolves without a
# full node-gyp toolchain (alpine/musl would force a source compile).
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- runtime stage -----------------------------------------------------------
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]
