# 1. Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Cài đặt dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn và build dự án
COPY . .
RUN npm run build

# 2. Run stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy sản phẩm sau khi build sang container chạy
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
