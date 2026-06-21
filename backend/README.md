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

### Dashboard / write API (auth required)

`POST /api/login` validates a username/password against the `config/login`
document. All mutating routes below require **HTTP Basic Auth** with those same
credentials (re-validated per request):

| Method | Path                      | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/login`              | Validate credentials   |
| POST   | `/api/remedies`           | Create remedy          |
| PUT    | `/api/remedies/{id}`      | Update remedy          |
| DELETE | `/api/remedies/{id}`      | Delete remedy          |
| POST   | `/api/categories`         | Create category        |
| PUT    | `/api/categories/{id}`    | Update category        |
| DELETE | `/api/categories/{id}`    | Delete category        |
| POST   | `/api/ingredients`        | Create ingredient      |
| PUT    | `/api/ingredients/{id}`   | Update ingredient      |
| DELETE | `/api/ingredients/{id}`   | Delete ingredient      |
| PUT    | `/api/config`             | Update app config      |

## Configuration

Set via environment (copy `.env.example` to `.env` locally; the env-guard hook
blocks `source .env`, so export inline or use direnv):

- `FIREBASE_PROJECT_ID` — e.g. `ghar-ke-nuske-dev` (required)
- `GOOGLE_APPLICATION_CREDENTIALS` — path to the service-account JSON, **or**
- `FIREBASE_CREDENTIALS_JSON` — the raw key JSON (for hosts that inject secrets
  as env vars; takes precedence over the file path)
- `PORT` — defaults to `8080`

The service-account key is **never** committed (see `.gitignore`/`.dockerignore`).

## Run

```bash
# the env-guard hook blocks `source .env`, so export inline or use a tool like direnv
FIREBASE_PROJECT_ID=ghar-ke-nuske-dev \
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/key.json \
go run ./cmd/server
# → listening on :8080 (project ghar-ke-nuske-dev)

curl localhost:8080/api/remedies | jq
```

## Docker (VPS deployment)

```bash
# Option A — mount the key file (recommended): place the service-account JSON
# at backend/serviceAccountKey.json, then:
docker compose up -d --build

# Option B — provide the key as inline JSON via a .env file beside compose:
#   FIREBASE_CREDENTIALS_JSON={"type":"service_account",...}
```

The image is a static Go binary on Alpine (with `ca-certificates` for TLS to
Firestore). It listens on `$PORT` (default 8080). See `docker-compose.yml` for
the two credential options.

## Notes

- Reads are public; **writes require the `config/login` credential** (Basic
  Auth), used by the web dashboard.
- CORS is currently `*` for development. Restrict the allowed origin before
  production.
