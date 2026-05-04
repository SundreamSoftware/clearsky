# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Bake in the proxy path so browser requests route through Nginx /api/ → GIOŚ
ARG VITE_GIOS_API_BASE_URL=/api
ENV VITE_GIOS_API_BASE_URL=$VITE_GIOS_API_BASE_URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.container.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
