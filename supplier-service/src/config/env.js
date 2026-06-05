export const env = {
  port: Number(process.env.PORT || 3003),
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "supplier_db",
    user: process.env.DB_USER || "supplier_user",
    password: process.env.DB_PASSWORD || "supplier_pass",
    connectionLimit: Number(process.env.DB_POOL || 10),
  },
};
