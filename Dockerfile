# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Use pnpm via corepack
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@latest --activate

# Install deps (cache layer)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# Prune dev dependencies for production
RUN pnpm prune --prod --ignore-scripts

# ---------- runtime stage ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Non-root (Node image already has user 'node')
USER node

ENV NODE_ENV=production
ENV PORT=3000

# Copy only what we need
COPY --chown=node:node --from=build /app/package.json ./
COPY --chown=node:node --from=build /app/pnpm-lock.yaml ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
