import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireRoles(...allowedRoles) {
  return async (request, reply) => {
    const header = request.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return reply.code(401).send({ error: "missing bearer token" });
    }
    try {
      const claims = jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ["HS256"] });
      if (!allowedRoles.includes(claims.role)) {
        return reply.code(403).send({ error: "role is not allowed" });
      }
      request.user = claims;
    } catch {
      return reply.code(401).send({ error: "invalid token" });
    }
  };
}
