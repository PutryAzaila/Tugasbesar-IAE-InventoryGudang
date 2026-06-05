import { bigint, boolean, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const suppliers = mysqlTable("suppliers", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  name: varchar("name", { length: 160 }).notNull(),
  taxNumber: varchar("tax_number", { length: 80 }),
  isActive: boolean("is_active").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const supplierContacts = mysqlTable("supplier_contacts", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  contactName: varchar("contact_name", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 160 }),
  isPrimary: boolean("is_primary").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const supplierAddresses = mysqlTable("supplier_addresses", {
  id: bigint("id", { mode: "number", unsigned: true }).primaryKey().autoincrement(),
  supplierId: bigint("supplier_id", { mode: "number", unsigned: true }).notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
