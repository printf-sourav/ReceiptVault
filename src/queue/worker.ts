import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { log, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/whatsappSender";
import { supabase } from "../services/supabaseWriter";
import { AlertJob } from "./producer";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Worker needs its own connection — cannot share with the Queue.
// BullMQ Worker uses blocking Redis commands (BLMOVE) that would
// deadlock if the connection was shared.
const workerRedis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

function formatAlertMessage(
  job: AlertJob,
  storeName: string,
  date: string
): string {
  switch (job.alertType) {
    case "return_deadline":
      return (
        `⏰ Return window for your ${storeName} purchase closes in ` +
        `${job.payload.daysRemaining} day(s) — ${date}. ` +
        `Act now if you want to return it.`
      );
    case "warranty_expiry":
      return (
        `🔧 Your warranty for ${storeName} expires in ` +
        `${job.payload.daysRemaining} day(s) — ${date}.`
      );
    case "reorder":
      return `🛒 Time to reorder from ${storeName}!`;
    default:
      return `Alert for ${storeName}: ${job.alertType}`;
  }
}

async function processAlert(job: Job<AlertJob>): Promise<void> {
  const { receiptId, userPhone, alertType, payload } = job.data;

  try {
    const { data: receipt } = await supabase
      .from("receipts")
      .select("store_name, return_deadline_date, warranty_expiry_date")
      .eq("id", receiptId)
      .single();

    const storeName =
      receipt?.store_name || (payload.store_name as string) || "Unknown";
    const date =
      alertType === "return_deadline"
        ? receipt?.return_deadline_date || ""
        : receipt?.warranty_expiry_date || "";

    const message = formatAlertMessage(job.data, storeName, date);
    await sendWhatsAppMessage(userPhone, message);
    log(`Alert fired: ${alertType} for receipt ${receiptId}`);
  } catch (error) {
    logError(
      `Failed to process alert job for receipt ${receiptId}`,
      error
    );
    throw error;
  }
}

export let alertWorker: Worker<AlertJob> | null = null;

export function startWorker(): Worker<AlertJob> {
  alertWorker = new Worker<AlertJob>(
    "receipt-alerts",
    processAlert,
    { connection: workerRedis }
  );

  alertWorker.on("completed", (job) => {
    log(`Job ${job.id} completed: ${job.data.alertType}`);
  });

  alertWorker.on("failed", (job, err) => {
    logError(`Job ${job?.id} failed: ${err.message}`);
  });

  log("BullMQ worker started (dedicated Redis connection)");
  return alertWorker;
}

export async function closeWorker(): Promise<void> {
  if (alertWorker) {
    await alertWorker.close();
    alertWorker = null;
  }
  await workerRedis.quit();
}
