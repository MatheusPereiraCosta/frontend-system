# ==============================================================================
# ESTÁGIO 1: Build da Aplicação Angular 19
# ==============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copia manifests de dependências primeiro para aproveitar o cache de camadas do Docker
COPY package*.json ./

RUN npm ci --no-audit --prefer-offline

# Copia todo o código fonte
COPY . .

# Compila a aplicação para produção
RUN npm run build -- --configuration production

# ==============================================================================
# ESTÁGIO 2: Runtime com Servidor Web Nginx Alpine (Imagem Enxuta < 25MB)
# ==============================================================================
FROM nginx:1.27-alpine

# Remove a página padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os artefatos compilados do estágio de build
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copia a configuração customizada do Nginx com SPA routing e Proxy Reverso
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Adiciona healthcheck nativo do container
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
