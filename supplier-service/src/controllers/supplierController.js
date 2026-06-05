import { eq, desc } from "drizzle-orm";
import { db } from "../db/client.js";
import { supplierAddresses, supplierContacts, suppliers } from "../db/schema.js";

export async function listSuppliers(_req, res) {
  const rows = await db.select().from(suppliers).orderBy(desc(suppliers.id));
  const result = [];
  for (const supplier of rows) {
    result.push(await hydrateSupplier(supplier));
  }
  res.json(result);
}

export async function createSupplier(req, res) {
  const input = parseInput(req.body);
  if (!input.name) return res.status(400).json({ error: "name is required" });

  try {
    await db.transaction(async (tx) => {
      await tx.insert(suppliers).values({
        name: input.name,
        taxNumber: input.tax_number || null,
        isActive: input.is_active,
      });
      const created = await tx.select().from(suppliers).where(eq(suppliers.name, input.name)).limit(1);
      await writeRelations(tx, created[0].id, input);
    });
  } catch {
    return res.status(409).json({ error: "supplier already exists or invalid relation" });
  }

  const created = await db.select().from(suppliers).where(eq(suppliers.name, input.name)).limit(1);
  res.status(201).json(await hydrateSupplier(created[0]));
}

export async function showSupplier(req, res) {
  const supplier = await findSupplier(req.params.id);
  if (!supplier) return res.status(404).json({ error: "supplier not found" });
  res.json(await hydrateSupplier(supplier));
}

export async function updateSupplier(req, res) {
  const input = parseInput(req.body);
  if (!input.name) return res.status(400).json({ error: "name is required" });
  const supplier = await findSupplier(req.params.id);
  if (!supplier) return res.status(404).json({ error: "supplier not found" });

  await db.transaction(async (tx) => {
    await tx.update(suppliers).set({
      name: input.name,
      taxNumber: input.tax_number || null,
      isActive: input.is_active,
    }).where(eq(suppliers.id, Number(req.params.id)));
    await tx.delete(supplierContacts).where(eq(supplierContacts.supplierId, Number(req.params.id)));
    await tx.delete(supplierAddresses).where(eq(supplierAddresses.supplierId, Number(req.params.id)));
    await writeRelations(tx, Number(req.params.id), input);
  });

  const updated = await findSupplier(req.params.id);
  res.json(await hydrateSupplier(updated));
}

export async function deleteSupplier(req, res) {
  const supplier = await findSupplier(req.params.id);
  if (!supplier) return res.status(404).json({ error: "supplier not found" });
  await db.delete(suppliers).where(eq(suppliers.id, Number(req.params.id)));
  res.status(204).end();
}

async function findSupplier(id) {
  const rows = await db.select().from(suppliers).where(eq(suppliers.id, Number(id))).limit(1);
  return rows[0] || null;
}

async function hydrateSupplier(supplier) {
  const contacts = await db.select().from(supplierContacts).where(eq(supplierContacts.supplierId, supplier.id));
  const addresses = await db.select().from(supplierAddresses).where(eq(supplierAddresses.supplierId, supplier.id));
  return {
    id: supplier.id,
    name: supplier.name,
    tax_number: supplier.taxNumber,
    is_active: Boolean(supplier.isActive),
    contacts,
    addresses,
    created_at: supplier.createdAt,
    updated_at: supplier.updatedAt,
  };
}

async function writeRelations(tx, supplierId, input) {
  if (input.contact_name || input.phone || input.email) {
    await tx.insert(supplierContacts).values({
      supplierId,
      contactName: input.contact_name || "-",
      phone: input.phone || null,
      email: input.email || null,
      isPrimary: true,
    });
  }
  if (input.address) {
    await tx.insert(supplierAddresses).values({
      supplierId,
      label: "main",
      address: input.address,
    });
  }
}

function parseInput(body = {}) {
  return {
    name: String(body.name || "").trim(),
    tax_number: String(body.tax_number || "").trim(),
    contact_name: String(body.contact_name || "").trim(),
    phone: String(body.phone || "").trim(),
    email: String(body.email || "").trim(),
    address: String(body.address || "").trim(),
    is_active: body.is_active === undefined ? true : Boolean(body.is_active),
  };
}
