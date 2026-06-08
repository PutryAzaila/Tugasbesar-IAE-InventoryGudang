FROM oven/bun:1.2-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./

RUN bun install --production

COPY src ./src

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app

USER app

EXPOSE 3006

CMD ["bun", "src/index.js"]