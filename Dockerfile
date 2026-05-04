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
COPY nginx.container.conf /etc/nginx/nginx.container.conf.template
EXPOSE 80
# Use envsubst to inject OPENAQ_API_KEY at container start (runtime, not build time)
CMD ["/bin/sh", "-c", "envsubst '${OPENAQ_API_KEY}' < /etc/nginx/nginx.container.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
