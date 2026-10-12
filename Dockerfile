FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy full application code
COPY . .

# Generate Prisma Client & Build Frontend
RUN npx prisma generate
RUN npm run build:web

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["npx", "tsx", "apps/api/src/server.ts"]
