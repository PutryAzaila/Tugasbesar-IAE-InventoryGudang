import { listRoles, listUsers, login, me, register } from "../controllers/authController.js";
import { requireRoles } from "../middleware/auth.js";

export function registerAuthRoutes(app) {
  app.post("/auth/login", login);
  app.get("/auth/me", me);
  app.post("/auth/register", { preHandler: requireRoles("admin") }, register);
  app.get("/auth/users", { preHandler: requireRoles("admin") }, listUsers);
  app.get("/auth/roles", { preHandler: requireRoles("admin") }, listRoles);
}
