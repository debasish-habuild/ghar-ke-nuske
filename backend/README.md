# Ghar Ke Nuskhe — Backend (Go + Firestore)

A small, layered HTTP API that serves the app's content catalog (remedies,
categories, ingredients, app config) from Cloud Firestore. It authenticates to
Firebase with the **Admin SDK** (service-account key), so it has trusted
server-side access and is the only thing that talks to Firestore directly.

## Layout

```
cmd/server/            entrypoint (graceful shutdown, signal handling)
internal/config/       env-based configuration
internal/firebaseclient/  Firebase Admin SDK + Firestore client init
internal/catalog/       domain: model → repository (Firestore) → service → handler
internal/router/        route table + CORS middleware
```

The flow per request: `router → handler → service → repository → Firestore`.
The repository is the only layer that imports Firestore; everything above it
deals in plain Go structs whose tags mirror the **real** stored schema.

## Data model (matches Firestore in `ghar-ke-nuske-dev`)

- **`remedies`** — `title`, `summary`, `imageUrl`, `time`, `primaryCategoryId`,
  `categoryIds[]`, `ingredientIds[]`, `ingredients[{ingredientId, amount}]`,
  `steps[]`, `benefits[]`, `precautions[]`, `isPopular`, `createdAt`,
  `updatedAt`.
- **`categories`** — `name`, `emoji`, `order`, `roles[]`.
- **`ingredients`** — `name`, `emoji`, `group`, `order`.
- **`config/app`** — `searchPlaceholders[]`, `todaysRecipeId`.

## Endpoints

| Method | Path                  | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/health`             | Liveness check               |
| GET    | `/api/remedies`       | All remedies                 |
| GET    | `/api/remedies/{id}`  | One remedy (404 if missing)  |
| GET    | `/api/categories`     | All categories               |
| GET    | `/api/ingredients`    | All ingredients              |
| GET    | `/api/config`         | App config (`config/app`)    |

## Configuration

Copy `.env.example` to `.env` (gitignored) and set:

- `FIREBASE_PROJECT_ID` — e.g. `ghar-ke-nuske-dev` (required)
- `GOOGLE_APPLICATION_CREDENTIALS` — absolute path to the service-account JSON
- `PORT` — defaults to `8080`

The service-account key is **never** committed (see `.gitignore`).

## Run

```bash
# the env-guard hook blocks `source .env`, so export inline or use a tool like direnv
FIREBASE_PROJECT_ID=ghar-ke-nuske-dev \
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/key.json \
go run ./cmd/server
# → listening on :8080 (project ghar-ke-nuske-dev)

curl localhost:8080/api/remedies | jq
```

## Notes

- The data already lives in Firestore (curated, normalised). This service is
  **read-only** by design — it does not seed or mutate the catalog.
- CORS is currently `*` for development. Restrict the allowed origin before
  production.
