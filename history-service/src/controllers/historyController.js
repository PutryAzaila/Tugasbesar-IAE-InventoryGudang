import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { auditActions, auditLogs, auditServices } from "../db/schema.js";

export async function listHistory(request) {
  const limit = Math.min(Number(request.query?.limit || 100), 500);
  return db
    .select({
      id: auditLogs.id,
      actor_id: auditLogs.actorId,
      actor_name: auditLogs.actorName,
      actor_role: auditLogs.actorRole,
      service: auditServices.name,
      action: auditActions.name,
      entity_type: auditLogs.entityType,
      entity_id: auditLogs.entityId,
      metadata: auditLogs.metadata,
      created_at: auditLogs.createdAt,
    })
    .from(auditLogs)
    .innerJoin(auditActions, eq(auditLogs.actionId, auditActions.id))
    .innerJoin(auditServices, eq(auditActions.serviceId, auditServices.id))
    .orderBy(desc(auditLogs.id))
    .limit(limit);
}

export async function createHistory(request, reply) {
  const body = request.body || {};
  const service = String(body.service || "").trim();
  const action = String(body.action || "").trim();
  if (!service || !action) {
    return reply.code(400).send({ error: "service and action are required" });
  }

  const serviceRow = await ensureService(service);
  const actionRow = await ensureAction(serviceRow.id, action);
  await db.insert(auditLogs).values({
    actionId: actionRow.id,
    actorId: String(body.actor_id || request.user?.sub || ""),
    actorName: String(body.actor_name || request.user?.username || ""),
    actorRole: String(body.actor_role || request.user?.role || ""),
    entityType: body.entity_type ? String(body.entity_type) : null,
    entityId: body.entity_id ? String(body.entity_id) : null,
    metadata: body.metadata || {},
  });

  return reply.code(201).send({ status: "logged" });
}

async function ensureService(name) {
  let rows = await db.select().from(auditServices).where(eq(auditServices.name, name)).limit(1);
  if (rows.length) return rows[0];
  try {
    await db.insert(auditServices).values({ name });
  } catch {
    // Another request may have inserted the same normalized value.
  }
  rows = await db.select().from(auditServices).where(eq(auditServices.name, name)).limit(1);
  return rows[0];
}

async function ensureAction(serviceId, name) {
  let rows = await db
    .select()
    .from(auditActions)
    .where(and(eq(auditActions.serviceId, serviceId), eq(auditActions.name, name)))
    .limit(1);
  if (rows.length) return rows[0];
  try {
    await db.insert(auditActions).values({ serviceId, name });
  } catch {
    // Another request may have inserted the same normalized value.
  }
  rows = await db
    .select()
    .from(auditActions)
    .where(and(eq(auditActions.serviceId, serviceId), eq(auditActions.name, name)))
    .limit(1);
  return rows[0];
}
