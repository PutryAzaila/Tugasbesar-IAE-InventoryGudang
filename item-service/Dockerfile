FROM golang:1.23-alpine AS builder

WORKDIR /src

COPY go.mod ./
COPY src ./src

RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/item-service ./src

FROM alpine:3.21

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /out/item-service /usr/local/bin/item-service

USER app

EXPOSE 3002

ENTRYPOINT ["item-service"]