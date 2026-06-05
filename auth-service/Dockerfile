FROM oven/bun:1.2-alpine AS deps

WORKDIR /app
COPY package.json ./
RUN bun install --production

FROM oven/bun:1.2-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app
EXPOSE 3001
CMD ["bun", "src/index.js"]
