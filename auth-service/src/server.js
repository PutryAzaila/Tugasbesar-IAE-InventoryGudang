import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerAuthRoutes } from "./routes/auth.js";

export function buildServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 1024 * 128,
    trustProxy: true,
  });
  registerHealthRoutes(app);
  registerAuthRoutes(app);
  return app;
}
