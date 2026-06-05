import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { roles, users } from "../db/schema.js";
import { env } from "../config/env.js";
import { verifyToken } from "../middleware/auth.js";

export async function login(request, reply) {
  const body = request.body || {};
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const user = await findUserByUsername(username);

  if (!user || !user.isActive || !(await Bun.password.verify(password, user.passwordHash))) {
    return reply.code(401).send({ error: "invalid username or password" });
  }

  const token = jwt.sign(
    { sub: String(user.id), username: user.username, role: user.role },
    env.jwtSecret,
    { algorithm: "HS256", expiresIn: "8h" },
  );
  return { token, user: publicUser(user) };
}

export async function register(request, reply) {
  const body = request.body || {};
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  const roleName = String(body.role || "manager").trim();

  if (!username || password.length < 6 || !["admin", "manager"].includes(roleName)) {
    return reply.code(400).send({ error: "username, password min 6 chars, and valid role are required" });
  }

  const role = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  if (!role.length) {
    return reply.code(400).send({ error: "role not found" });
  }

  try {
    await db.insert(users).values({
      username,
      passwordHash: await Bun.password.hash(password),
      roleId: role[0].id,
      isActive: true,
    });
  } catch {
    return reply.code(409).send({ error: "username already exists" });
  }

  const created = await findUserByUsername(username);
  return reply.code(201).send(publicUser(created));
}

export async function me(request, reply) {
  const claims = verifyToken(request);
  if (!claims) {
    return reply.code(401).send({ error: "invalid token" });
  }
  const user = await findUserById(Number(claims.sub));
  if (!user) {
    return reply.code(404).send({ error: "user not found" });
  }
  return publicUser(user);
}

export async function listUsers() {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id));
  return rows.map(publicUser);
}

export async function listRoles() {
  return db.select({ id: roles.id, name: roles.name }).from(roles);
}

async function findUserByUsername(username) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.username, username))
    .limit(1);
  return rows[0] || null;
}

async function findUserById(id) {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      role: roles.name,
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);
  return rows[0] || null;
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    is_active: Boolean(user.isActive),
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
