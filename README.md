# Golden Raspberry Awards API

API dos piores filmes (Golden Raspberry). Carrega o CSV na subida e expõe os intervalos de prêmios.

## Estrutura

- **libs/domain** – domínio (golden-raspberry: entities, services, dtos)
- **apps/api-golden-raspberry** – app NestJS, controllers em `src/app/controllers/`

## Pré-requisitos

Node 18+. npm.

## Instalar

Na pasta `api`:

```sh
npm install
```

## Rodar

```sh
npx nx serve api-golden-raspberry
```

- Base: `http://localhost:3002/api`
- Intervalos: `GET /api/prize-intervals`
- Swagger: `http://localhost:3002/api/docs`

`PORT` e `MOVIE_LIST_CSV` via env se quiser mudar.

## Lint e testes

```sh
npm run lint
npm run test
```

## Build

```sh
npx nx build api-golden-raspberry
```

Saída em `dist/apps/api-golden-raspberry/`. Rodar: `node dist/apps/api-golden-raspberry/main.js`.
