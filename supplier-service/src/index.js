import { createServer } from "./server.js";
import { env } from "./config/env.js";

const app = createServer();
app.listen(env.port, "0.0.0.0", () => {
  console.log(`supplier-service listening on :${env.port}`);
});
