# Ghar Ke Nuskhe — Content Dashboard

A basic web admin (React + Vite + TypeScript) for managing the app's content —
remedies, conditions (categories), ingredients, and app settings — through the
Go backend API. Login is gated by the `config/login` document in Firestore.

## How it works

- **No Firebase SDK in the browser.** The dashboard is a pure client of the Go
  backend; the service-account key never leaves the server.
- **Login** (`POST /api/login`) validates a username/password against
  `config/login`. On success the credentials are kept (base64) and sent as HTTP
  Basic Auth on every mutating request; the backend re-validates each one.
- **Tabs:** Remedies · Conditions · Ingredients · App Settings — each with
  create / edit / delete.

## Run locally

```bash
bun install
bun run dev        # http://localhost:5173
```

The backend must be running (default `http://localhost:8080`). Override the API
location with an env var:

```bash
# .env (see .env.example)
VITE_API_URL=https://your-backend-host
```

## Deploy (Vercel)

1. `vercel login`
2. From this folder: `vercel --prod` (Vercel auto-detects Vite; output `dist`).
   If deploying the monorepo, set the project **Root Directory** to
   `web-dashboard`.
3. Set the **`VITE_API_URL`** environment variable in the Vercel project to your
   public backend URL (the Dockerized Go backend on your VPS).

Build check: `bun run build`.
