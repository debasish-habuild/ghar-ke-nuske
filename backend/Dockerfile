# ---- build stage ----
FROM golang:1.26-alpine AS build
WORKDIR /src

# Cache deps first.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
# Static binary so the runtime image can stay minimal.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o /out/server ./cmd/server

# ---- runtime stage ----
FROM alpine:3.20
# ca-certificates is required for TLS to Firestore / Google APIs.
RUN apk add --no-cache ca-certificates && adduser -D -u 10001 app
WORKDIR /app
COPY --from=build /out/server /app/server
USER app

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/server"]
