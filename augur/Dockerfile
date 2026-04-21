FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev

FROM base AS deps
COPY augur/package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY augur/ .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg \
    pixman
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output
# Fonts are copied to .output/public/fonts/ by nuxt build, but ensure they exist
# in the runner image so generate-card.post.ts can resolve them at runtime.
COPY --from=builder /app/public/fonts ./.output/public/fonts
COPY --from=builder /app/public/og-image.png ./.output/public/og-image.png

# sweph is a native Node.js addon loaded via node-gyp-build at runtime.
# Nitro cannot bundle native .node binaries into .output — the loader resolves
# the prebuild relative to node_modules/sweph at require() time.
# We must copy the full sweph package so the linux-x64 prebuild is available.
COPY --from=builder /app/node_modules/sweph ./node_modules/sweph
COPY --from=builder /app/node_modules/node-gyp-build ./node_modules/node-gyp-build
COPY --from=builder /app/node_modules/node-addon-api ./node_modules/node-addon-api

# Drop root privileges. node:20-alpine ships with a built-in 'node' user (uid 1000).
# Chown the output directory so the node user can write runtime cache files if needed.
RUN chown -R node:node /app/.output /app/node_modules
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
