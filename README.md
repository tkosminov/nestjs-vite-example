# nestjs-vite-example

NestJS Vite Swc

## Dependencies

* [NodeJS 22](https://nodejs.org/download/release/latest-v22.x/)
* [Redis 7](https://redis.io/download/)
* [PostgreSQL 13+](https://www.postgresql.org/download/)

## Installation

```bash
npm ci
```

## Run app

```bash
npm run start:dev
```

## Build

```bash
npm run build
```

## Typeorm

### Create an empty migration file

```bash
MIGRATION_NAME=$name npm run typeorm:create
```
