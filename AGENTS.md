# GatherWheel agent notes

## Required checks

Run `npm run verify` after code changes. It covers Prettier, ESLint, TypeScript,
tests, and production builds.

## Local full-stack startup

From the repository root in PowerShell:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d
Get-Content .env | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object {
  $pair = $_ -split '=', 2
  Set-Item -Path "Env:$($pair[0])" -Value $pair[1]
}
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Do not upgrade Node.js just to start the project. Stop the app with `Ctrl+C` and
run `docker compose down` when finished.

## Manual browser check

Use the Codex in-app browser, not Chrome.

1. For the complete app, use the full-stack startup above. The API listens on
   `3000`, and Vite serves the web app on `5173`.
2. If only the frontend is needed, run
   `npm run dev -- --host 0.0.0.0 --port 3000` from `apps/web`.
3. Open `http://localhost:5173` for the complete app, or
   `http://localhost:3000` for the frontend-only server.
4. If Vite fails with `EPERM` while creating `.vite-temp`, restart the command
   outside the restricted sandbox.
5. Do not use `host.docker.internal` in this environment: it may not resolve.
6. After the smoke-test, close the in-app browser test tabs and stop every dev
   process started for the check.
