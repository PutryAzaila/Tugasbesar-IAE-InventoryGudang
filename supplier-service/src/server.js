import express from "express";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSupplierRoutes } from "./routes/suppliers.js";

export function createServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "128kb" }));
  registerHealthRoutes(app);
  registerSupplierRoutes(app);
  return app;
}
