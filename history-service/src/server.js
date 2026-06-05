import Fastify from "fastify";
import { registerHealthRoutes } from "./routes/health.js";
import { registerHistoryRoutes } from "./routes/history.js";

export function buildServer() {
  const app = Fastify({ logger: true, bodyLimit: 1024 * 128, trustProxy: true });
  registerHealthRoutes(app);
  registerHistoryRoutes(app);
  return app;
}
