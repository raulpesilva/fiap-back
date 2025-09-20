# Etapa base
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Etapa build
FROM base AS build

# Copia só os manifests primeiro (para cache eficiente)
COPY package.json pnpm-lock.yaml* ./

# Instala dependências
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copia o restante do código
COPY . .

# Garante que os binários tenham permissão de execução
RUN chmod +x node_modules/.bin/*

# Compila
RUN pnpm run build

# Etapa final (runtime)
FROM base

# Copia apenas o necessário para rodar
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY package.json pnpm-lock.yaml* ./

EXPOSE 4013
CMD [ "pnpm", "start" ]
