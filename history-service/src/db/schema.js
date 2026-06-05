import { bigint, json, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const auditServices = mysqlTable("audit_services", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: varchar("name", { length: 80 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const auditActions = mysqlTable("audit_actions", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  serviceId: bigint("service_id", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  actionId: bigint("action_id", { mode: "number", unsigned: true }).notNull(),
  actorId: varchar("actor_id", { length: 80 }).notNull(),
  actorName: varchar("actor_name", { length: 120 }).notNull(),
  actorRole: varchar("actor_role", { length: 40 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }),
  entityId: varchar("entity_id", { length: 80 }),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull(),
});
