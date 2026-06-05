export const env = {
  port: Number(process.env.PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "auth_db",
    user: process.env.DB_USER || "auth_user",
    password: process.env.DB_PASSWORD || "auth_pass",
    connectionLimit: Number(process.env.DB_POOL || 10),
  },
};
