FROM golang:1.23-alpine AS builder

WORKDIR /src
COPY go.mod ./
RUN go mod download
COPY src ./src
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/item-service ./src

FROM alpine:3.21
RUN addgroup -S app && adduser -S app -G app
USER app
COPY --from=builder /out/item-service /usr/local/bin/item-service
EXPOSE 3002
ENTRYPOINT ["item-service"]
