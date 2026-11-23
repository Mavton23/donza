# Web Donza (Next.js). As variáveis API_URL e NEXT_PUBLIC_* são fixadas na compilação.
FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG API_URL=http://api:3001
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_DEFAULT_CURRENCY=MZN
ENV API_URL=$API_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL NEXT_PUBLIC_DEFAULT_CURRENCY=$NEXT_PUBLIC_DEFAULT_CURRENCY
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# A compilação pré-renderiza páginas públicas e precisa de alcançar a API: use `docker compose build` com a API a correr,
# ou defina um API_URL acessível durante o build (as páginas dinâmicas não bloqueiam).
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
USER node
EXPOSE 3000
CMD ["npm", "start"]
