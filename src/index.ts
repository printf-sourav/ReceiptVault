import "dotenv/config";
import express from "express";
import webhookRouter from "./routes/webhook";
import { startWorker, closeWorker } from "./queue/worker";
import { alertQueue, redisConnection, runSmokeTest } from "./queue/producer";
import { initScheduler } from "./scheduler";
import { log, logError } from "./utils/logger";
import testRouter from "./routes/test";

if (!process.env.REDIS_URL) {
  logError("REDIS_URL is not defined — BullMQ will not connect");
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("ReceiptVault is running.");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/webhook", webhookRouter);

if (process.env.NODE_ENV !== "production") {
  app.use("/test", testRouter);
  log("Test routes enabled (disable by setting NODE_ENV=production)");
}

startWorker();
initScheduler();

const server = app.listen(PORT, () => {
  log(`ReceiptVault server running on port ${PORT}`);
  if (process.env.NODE_ENV !== "production") {
    runSmokeTest().catch((e) =>
      logError("Smoke test failed to queue", e)
    );
  }
});

async function shutdown(signal: string): Promise<void> {
  log(`${signal} received — shutting down gracefully`);
  server.close();
  try {
    await closeWorker();
    await alertQueue.close();
    await redisConnection.quit();
    log("All queues, workers, and Redis connections closed");
  } catch (err) {
    logError("Error during shutdown", err);
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
