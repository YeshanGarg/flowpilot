FROM node:22-alpine AS base
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json .npmrc ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN cd apps/api && pnpm prisma:generate
RUN cd apps/api && pnpm build

EXPOSE 3000
CMD ["sh", "-c", "cd apps/api && pnpm start"]
