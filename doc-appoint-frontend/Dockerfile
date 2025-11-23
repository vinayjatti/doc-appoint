# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copy all project files
COPY . .

# Build your Webpack bundle to /dist
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy build output to NGINX html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]