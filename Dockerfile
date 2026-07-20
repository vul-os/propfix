# Build the single embedded binary, then ship it on a minimal base.
#
# NOTE ON THE APP EMBED (read before relying on this image):
# backend/cmd/propfix currently only embeds the marketing/docs site
# (site/ -> served at /site/, see backend/cmd/propfix/site_embed.go, build
# tag `embed_frontend`). There is no //go:embed for the built React app
# (dist/) yet, and main.go registers no "/" route — so the app UI is not
# served by this image today. The frontend build stage below still runs and
# its output is copied into the backend build context so that the day a
# dist embed lands (mirroring site_embed.go's pattern), this Dockerfile picks
# it up with no changes: go tolerates a directory under a package that no
# go:embed directive references. Until then, this image serves the full
# /api/ surface and the marketing site at /site/.
FROM node:20-bookworm AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM golang:1.25-bookworm AS backend
WORKDIR /app
COPY backend/go.mod backend/go.sum ./backend/
RUN cd backend && go mod download
COPY . .
# Marketing site, embedded today (see site_embed.go).
RUN rm -rf backend/cmd/propfix/site && cp -R site backend/cmd/propfix/site
# App bundle, staged for when the embed exists (see the note above).
COPY --from=frontend /app/dist ./backend/cmd/propfix/dist
ARG VERSION=docker
RUN cd backend && CGO_ENABLED=0 go build -tags embed_frontend \
    -ldflags "-s -w -X main.version=${VERSION}" \
    -o /propfix ./cmd/propfix

FROM gcr.io/distroless/static-debian12
COPY --from=backend /propfix /propfix
# propfix does not read these from the environment today — see backend's
# main.go, which only accepts -addr/-db/-demo/-origins/-secure-cookies flags.
# They are declared here to match the house Dockerfile convention and to
# document the values this image's default CMD wires into flags below; a
# deployment needing different values must override CMD directly, e.g.:
#   docker run ... ghcr.io/vul-os/propfix:latest -addr=0.0.0.0:9000 -db=/data/propfix.db
ENV PROPFIX_HOST=0.0.0.0 \
    PROPFIX_PORT=8099 \
    PROPFIX_DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 8099
ENTRYPOINT ["/propfix"]
CMD ["-addr=0.0.0.0:8099", "-db=/data/propfix.db"]
