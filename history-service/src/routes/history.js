import { createHistory, listHistory } from "../controllers/historyController.js";
import { requireRoles } from "../middleware/auth.js";

export function registerHistoryRoutes(app) {
  app.get("/history", { preHandler: requireRoles("admin") }, listHistory);
  app.post("/history", { preHandler: requireRoles("admin", "manager") }, createHistory);
}
