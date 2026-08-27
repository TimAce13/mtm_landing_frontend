# Статика биллинг-фронта за nginx. Билд из frontend/:
#   docker buildx build --platform linux/amd64 -t timace13/mtm-billing-front:<tag> --push .
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
