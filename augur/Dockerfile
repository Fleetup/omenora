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

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
