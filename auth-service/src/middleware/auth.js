import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function verifyToken(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  try {
    return jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
}

export function requireRoles(...allowedRoles) {
  return async (request, reply) => {
    const claims = verifyToken(request);
    if (!claims) {
      return reply.code(401).send({ error: "invalid token" });
    }
    if (!allowedRoles.includes(claims.role)) {
      return reply.code(403).send({ error: "role is not allowed" });
    }
    request.user = claims;
  };
}
