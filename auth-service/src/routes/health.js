export function registerHealthRoutes(app) {
  app.get("/health", async () => ({ status: "ok", service: "auth-service" }));
}
