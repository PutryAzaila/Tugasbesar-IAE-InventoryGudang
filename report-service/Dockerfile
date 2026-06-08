FROM composer:2 AS deps

WORKDIR /app
COPY composer.json ./
COPY app ./app
RUN composer install --no-dev --prefer-dist --no-progress --no-scripts --optimize-autoloader --ignore-platform-req=ext-zip

FROM php:8.3-cli-alpine
WORKDIR /app

RUN addgroup -S app \
    && adduser -S app -G app

COPY --from=deps /app/vendor ./vendor
COPY composer.json ./
COPY app ./app
COPY bootstrap ./bootstrap
COPY public ./public
COPY routes ./routes

USER app
EXPOSE 3005
CMD ["php", "-S", "0.0.0.0:3005", "-t", "public"]