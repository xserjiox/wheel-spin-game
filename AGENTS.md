# GatherWheel agent notes

## Required checks

Run `npm run verify` after code changes. It covers Prettier, ESLint, TypeScript,
tests, and production builds.

## Manual browser check

Use the Codex in-app browser, not Chrome.

1. For the complete app, run `npm run dev` from the repository root. The API
   listens on `3000`, and Vite serves the web app on `5173`.
2. If only the frontend is needed, run
   `npm run dev -- --host 0.0.0.0 --port 3000` from `apps/web`.
3. Open `http://localhost:5173` for the complete app, or
   `http://localhost:3000` for the frontend-only server.
4. If Vite fails with `EPERM` while creating `.vite-temp`, restart the command
   outside the restricted sandbox.
5. Do not use `host.docker.internal` in this environment: it may not resolve.
6. After the smoke-test, close the in-app browser test tabs and stop every dev
   process started for the check.
