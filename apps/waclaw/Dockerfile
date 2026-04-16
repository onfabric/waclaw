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
# Pre-create the data dir here so the release stage can COPY it with the
# correct ownership. Distroless has no shell, so the dir must be staged from
# a layer that does — without this, a named volume mounted at /app/data would
# initialize as root and the nonroot binary couldn't write to it.
RUN mkdir -p dist/data

FROM gcr.io/distroless/base-debian12:nonroot AS release
WORKDIR /app
COPY --from=build --chown=nonroot:nonroot /monorepo/apps/waclaw/dist/ ./
ENV NODE_ENV=production
EXPOSE 3000/tcp
ENTRYPOINT ["/app/server"]
