# --- Stage 1: Build ---
FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# --- Stage 2: Production (Nginx) ---
FROM nginx:stable-alpine

# Copiem els fitxers compilats de Vite (carpeta dist) a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposem el port 80 (estàndard d'Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]