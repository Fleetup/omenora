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
    pixman-dev \
    && ln -sf python3 /usr/bin/python

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
COPY --from=builder /app/node_modules/swisseph ./node_modules/swisseph
# Fonts are copied to .output/public/fonts/ by nuxt build, but ensure they exist
# in the runner image so generate-card.post.ts can resolve them at runtime.
COPY --from=builder /app/public/fonts ./.output/public/fonts
COPY --from=builder /app/public/og-image.png ./.output/public/og-image.png

# Drop root privileges. node:20-alpine ships with a built-in 'node' user (uid 1000).
# Chown the output directory so the node user can write runtime cache files if needed.
RUN chown -R node:node /app/.output /app/node_modules
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
