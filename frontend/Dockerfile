# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy và cài dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source
COPY . .

# Build Next.js (nếu lỗi, build sẽ dừng ở đây)
RUN npm run build

# Stage 2: Run
FROM node:22-alpine

WORKDIR /app

# Copy file build từ stage 1
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Cài production deps
RUN npm ci --omit=dev

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start"]
