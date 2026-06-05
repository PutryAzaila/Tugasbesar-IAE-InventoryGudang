import { buildServer } from "./server.js";
import { env } from "./config/env.js";

const app = buildServer();
await app.listen({ port: env.port, host: "0.0.0.0" });
