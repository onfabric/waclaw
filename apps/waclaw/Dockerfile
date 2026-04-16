# syntax=docker/dockerfile:1-labs

# Build context must be the monorepo root. Build from the monorepo root with:
#   docker build -f apps/waclaw/Dockerfile -t waclaw .

FROM oven/bun:1.3.12-slim AS base
WORKDIR /monorepo

# Cache deps in a temp directory.
# Copy only the workspace manifests + lockfile so this layer is reused
# whenever source changes but dependencies don't.
FROM base AS install
WORKDIR /temp/deps
COPY package.json bun.lock ./
COPY --parents apps/*/package.json packages/*/package.json ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=install /temp/deps ./
COPY apps/waclaw apps/waclaw
WORKDIR /monorepo/apps/waclaw
ENV NODE_ENV=production
RUN bun run build

# Run as root so any orchestrator-managed volume mounted at /app/data is
# writable regardless of how it was created (named volume, bind mount, PaaS
# persistent storage). Container isolation is the security boundary here.
# Using the `:debug` variant for the bundled busybox (wget) used by HEALTHCHECK.
FROM gcr.io/distroless/base-debian12:debug AS release
WORKDIR /app
COPY --from=build /monorepo/apps/waclaw/dist/ ./
ENV NODE_ENV=production
EXPOSE 3000/tcp
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/busybox/wget", "-q", "--spider", "http://localhost:3000/health"]
ENTRYPOINT ["/app/server"]
