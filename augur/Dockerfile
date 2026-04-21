# ── Base: node:20-slim (Debian Bookworm, glibc) ───────────────────────────────
# IMPORTANT: Do NOT use node:20-alpine here. The sweph native addon (.node file)
# is pre-compiled against glibc (requires GLIBC_2.14+). Alpine uses musl libc
# which is binary-incompatible — the addon will fail to load with a 500 error.
# node:20-slim uses Debian which ships glibc, solving this permanently.
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY augur/package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY augur/ .
RUN npm run build

# ── Runner: node:20-slim (glibc — required for sweph native addon) ────────────
FROM node:20-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    libpixman-1-0 \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output
# Fonts are copied to .output/public/fonts/ by nuxt build, but ensure they exist
# in the runner image so generate-card.post.ts can resolve them at runtime.
COPY --from=builder /app/public/fonts ./.output/public/fonts
COPY --from=builder /app/public/og-image.png ./.output/public/og-image.png

# sweph is a native Node.js addon loaded via node-gyp-build at runtime.
# Nitro copies sweph's JS files into .output/server/node_modules/sweph/ but
# omits the prebuilds/ directory. node-gyp-build resolves the .node binary
# using __dirname of sweph/index.mjs — which at runtime is:
#   /app/.output/server/node_modules/sweph/
# So we must overwrite that incomplete Nitro copy with the FULL sweph package
# (including prebuilds/linux-x64/sweph.node) so the binary is found at runtime.
COPY --from=builder /app/node_modules/sweph ./.output/server/node_modules/sweph
COPY --from=builder /app/node_modules/node-gyp-build ./.output/server/node_modules/node-gyp-build

# Drop root privileges. node:20-slim ships with a built-in 'node' user (uid 1000).
RUN chown -R node:node /app/.output
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
