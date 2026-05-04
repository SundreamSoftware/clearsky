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
# If OPENAQ_API_KEY is set, substitute it into the config; otherwise strip the header line
# so nginx never gets an empty proxy_set_header value (which is a fatal syntax error).
CMD ["/bin/sh", "-c", "if [ -n \"$OPENAQ_API_KEY\" ]; then envsubst '${OPENAQ_API_KEY}' < /etc/nginx/nginx.container.conf.template > /etc/nginx/conf.d/default.conf; else sed '/X-API-Key/d' /etc/nginx/nginx.container.conf.template > /etc/nginx/conf.d/default.conf; fi && nginx -g 'daemon off;'"]
