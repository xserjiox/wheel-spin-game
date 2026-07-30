# Wheel Spin

A multiplayer random-choice wheel. The host creates a room and spins the wheel,
while guests join through an invite link and anonymously suggest new slots.

## MVP features

- Rooms with a random eight-character code and an invite link
- Optional password stored only as an Argon2id hash
- Anonymous sessions without registration
- Only the host can edit and spin the wheel
- Guests can submit fully anonymous slot suggestions
- Sequential names for duplicate guests: `Alex`, `Alex 2`, `Alex 3`
- The same server-authoritative spin for every connected participant
- Room and active-spin recovery after a page refresh
- Up to 20 local slot templates without an account or backend storage
- The 10 most recent spin results
- Room expiration after 7 days of inactivity
- A responsive, mobile-first interface based on the original prototype

## Limits

- Up to 50 participants per room
- Up to 100 slots
- Up to 10 pending suggestions per guest
- Spin duration from 1 to 300 seconds
- Host permissions are bound to a secure cookie in the browser that created the
  room

## Tech stack

- React, React Router, TypeScript, and Vite
- NestJS, Fastify, and Socket.IO
- PostgreSQL and Prisma
- Redis adapter for Socket.IO
- Vitest
- Docker and Railway

The frontend and backend are built into a single public container. NestJS serves
the React SPA, REST API, and WebSocket connection from the same domain.
PostgreSQL and Redis remain accessible only through Railway's private network.

## Architecture

The frontend follows Feature-Sliced Design:

- `app` — application initialization, routing, and global styles
- `pages` — route components for localized home pages, `/r/:code`, and the
  fallback page
- `features` — user actions that are not tied to a single page
- `entities` — room model, API, realtime state, and UI
- `shared` — HTTP client, i18n, router helpers, and reusable UI

The backend is organized as a modular NestJS monolith. The `rooms` business
module is divided into `presentation`, `application`, `domain`, and
`infrastructure`. Database, security, realtime, and configuration code lives in
`shared`.

## Local development

Requirements: Node.js 22+, npm, PostgreSQL, and Redis. If Docker is available,
start the infrastructure with:

```bash
docker compose up -d
```

Create `.env` from `.env.example`, then run:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Healthcheck: `http://localhost:3000/health`

Vite proxies `/api` and `/socket.io` to the backend.

## Production build

```bash
npm run build
npm start
```

After the build, the backend serves the frontend from `apps/web/dist`.

## Quality checks

```bash
npm run format        # Apply Prettier formatting
npm run format:check  # Check formatting
npm run lint          # Run ESLint
npm run typecheck     # Check TypeScript
npm run validate      # Run all checks and tests
npm run verify        # Run validation and the production build
```

GitHub Actions runs `validate` and `build` for every pull request and push to
`main`. The Dockerfile also runs `validate`, so Railway will not build a version
with ESLint, Prettier, TypeScript, or test failures.

## Railway deployment

1. Create a Railway project and connect this GitHub repository as the
   application service.
2. Add PostgreSQL and Redis to the same project and environment.
3. Add the following private variables to the application service:
   - `DATABASE_URL` referencing the PostgreSQL service
   - `REDIS_URL` referencing the Redis service
   - `COOKIE_SECURE=true`
   - `PUBLIC_URL` with the canonical public origin, for example
     `https://wheel.example.com`
4. Create a public domain only for the application service.

`railway.json` configures the Dockerfile build, Prisma migration before startup,
the healthcheck, and one replica in EU West. The Redis adapter already supports
multiple replicas, while spin initiation is protected by an atomic room-status
update in PostgreSQL.

The production build pre-renders the indexable home pages at `/`, `/ru/`,
`/uk/`, `/de/`, and `/zh/`. Temporary room, API, Socket.IO, and health URLs are
served with `X-Robots-Tag: noindex, nofollow`. The application also exposes
`/robots.txt` and a localized `/sitemap.xml`.

## Project structure

```text
apps/
├── api/
│   ├── prisma/                         PostgreSQL schema and migrations
│   ├── src/
│   │   ├── app/                        root NestJS module
│   │   ├── modules/rooms/              vertical room business module
│   │   ├── modules/system/             SPA, health, and readiness endpoints
│   │   └── shared/                     database, security, realtime, config
│   └── test/                           room and wheel rule tests
└── web/
    └── src/
        ├── app/                        app bootstrap, router, and styles
        ├── pages/                      route pages
        ├── features/                   user-facing features
        ├── entities/                   room model and UI
        └── shared/                     shared API, i18n, helpers, and UI

Dockerfile
docker-compose.yml
railway.json
```
