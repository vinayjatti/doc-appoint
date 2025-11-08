import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import app from "./server.js";

// ✅ Set region and optional resources (Gen 2 supports CPU, memory, etc.)
setGlobalOptions({
  region: "us-central1",
  cpu: 1,
  memory: "512MiB",
  minInstances: 0
});

// ✅ Export HTTPS function
export const api = onRequest(app);