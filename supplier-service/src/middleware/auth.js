import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "missing bearer token" });
    }
    try {
      const claims = jwt.verify(header.slice(7), env.jwtSecret, { algorithms: ["HS256"] });
      if (!allowedRoles.includes(claims.role)) {
        return res.status(403).json({ error: "role is not allowed" });
      }
      req.user = claims;
      return next();
    } catch {
      return res.status(401).json({ error: "invalid token" });
    }
  };
}
