import {
  createSupplier,
  deleteSupplier,
  listSuppliers,
  showSupplier,
  updateSupplier,
} from "../controllers/supplierController.js";
import { requireRoles } from "../middleware/auth.js";

export function registerSupplierRoutes(app) {
  const guard = requireRoles("admin", "manager");
  app.get("/suppliers", guard, listSuppliers);
  app.post("/suppliers", guard, createSupplier);
  app.get("/suppliers/:id", guard, showSupplier);
  app.put("/suppliers/:id", guard, updateSupplier);
  app.delete("/suppliers/:id", guard, deleteSupplier);
}
