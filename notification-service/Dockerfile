FROM golang:1.23-alpine AS builder

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY src ./src
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/notification-service ./src

FROM alpine:3.21
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=builder /out/notification-service /usr/local/bin/notification-service
EXPOSE 3008
ENTRYPOINT ["notification-service"]