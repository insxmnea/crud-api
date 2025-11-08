# CRUD API

## Requirements:

- Node.js 24.x.x (24.10.0+ recommended)

## Install

`npm install`

## Development

Starts a single instance on PORT from .env or default 4000

`npm run start:dev`

## Production

Builds (tsc) then runs dist/src/server.js

`npm run start:prod`

## Cluster (multi)

Builds then runs cluster mode

`npm run start:multi`

## Env

Copy `.env.example` to `.env` and adjust PORT if needed.

## Tests

`npm test`
