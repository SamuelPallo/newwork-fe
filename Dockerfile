# Dockerfile for newwork-fe (Vite + React, served by nginx)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production image: nginx
FROM nginx:1.25 AS runner
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
