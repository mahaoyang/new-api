FROM oven/bun:latest AS builder-admin

WORKDIR /build-admin
COPY web/package.json .
COPY web/bun.lock .
RUN bun install
COPY web .
COPY VERSION .
RUN DISABLE_ESLINT_PLUGIN='true' VITE_REACT_APP_VERSION=$(cat VERSION) bun run build

FROM oven/bun:latest AS builder-user

WORKDIR /build-user
COPY web-user/package.json .
COPY web-user/bun.lock .
RUN bun install
COPY web-user .
RUN bun run build

FROM golang:alpine AS builder2
ENV GO111MODULE=on CGO_ENABLED=0

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64}


WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=builder-admin /build-admin/dist ./web/dist
COPY --from=builder-user /build-user/dist ./web-user/dist
RUN go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=$(cat VERSION)'" -o new-api

FROM alpine

RUN apk upgrade --no-cache \
    && apk add --no-cache ca-certificates tzdata \
    && update-ca-certificates

COPY --from=builder2 /build/new-api /
EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/new-api"]
