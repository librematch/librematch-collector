# ⚔️ Libre:Match Collector

Collect match data from Relic Link API into a database

<img src="architecture/flow.svg">

## Status

### Matches

- Fetching and parsing of obersable matches **done**.
- Fetching match results when match ended **done**.
- Fetching match after an collector outage **not yet done**. Could be done by checking which users played matches during outage via leaderboards.

### Lobbies

- Fetching and parsing of lobbies **done**.
- Cleanup of lobbies that do not exist anymore **not yet done**.

### Leaderboards

- Fetching and parsing of leaderboards **done** but not enabled by default.

## Requirements

Install [node.js](https://nodejs.org/).

Install yarn with `npm install --global yarn`.

Install [docker](https://docs.docker.com/get-docker/) for local postgres db for development.

## Install

Install dependencies

    yarn

## Configure

Copy sample env variable file

    mv .env.sample .env

## Setup database

Start local postgres db

    docker compose up -d

Migrate db

    npx prisma migrate dev

## Run collector

Start collector

    yarn collector

## Run graphql server

Start graph

    yarn graph
