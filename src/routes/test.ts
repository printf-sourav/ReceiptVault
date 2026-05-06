import { Router, Request, Response } from "express";
import { log } from "../utils/logger";

const router = Router();

// Only enable in non-production
function guardProd(res: Response): boolean {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Not available in production" });
    return true;
  }
  return false;
}

router.get("/run-skill", async (req: Request, res: Response): Promise<void> => {
  if (guardProd(res)) return;

  const skill = req.query.name as string;
  const validSkills = [
    "deadline-watch",
    "consumable-tracker",
    "sub-manager",
    "spending-dashboard",
    "gmail-scanner",
  ];

  if (!skill || !validSkills.includes(skill)) {
    res.status(400).json({
      error: "Provide ?name= with one of: " + validSkills.join(", "),
    });
    return;
  }

  log(`[test] Manually triggering skill: ${skill}`);
  res.json({ status: "triggered", skill });

  // Run after sending response so the HTTP call doesn't time out
  try {
    switch (skill) {
      case "deadline-watch": {
        const { runDeadlineWatch } = await import(
          "../skills/deadline-watch"
        );
        await runDeadlineWatch();
        break;
      }
      case "consumable-tracker": {
        const { runConsumableTracker } = await import(
          "../skills/consumable-tracker"
        );
        await runConsumableTracker();
        break;
      }
      case "sub-manager": {
        const { runSubscriptionManager } = await import(
          "../skills/sub-manager"
        );
        await runSubscriptionManager();
        break;
      }
      case "spending-dashboard": {
        const { runSpendingDashboard } = await import(
          "../skills/spending-dashboard"
        );
        await runSpendingDashboard();
        break;
      }
      case "gmail-scanner": {
        const { scanGmail } = await import("../services/gmailScanner");
        await scanGmail();
        break;
      }
    }
    log(`[test] Skill ${skill} completed`);
  } catch (err) {
    log(`[test] Skill ${skill} failed: ${err}`);
  }
});

router.post("/queue-alert", async (req: Request, res: Response): Promise<void> => {
  if (guardProd(res)) return;

  // Fire a test BullMQ alert in 5 seconds to verify the worker is running
  const { alertQueue } = await import("../queue/producer");
  const phone =
    (req.body?.phone as string) || process.env.TEST_PHONE || "";

  if (!phone) {
    res.status(400).json({ error: "Provide { phone } in request body or set TEST_PHONE in .env" });
    return;
  }

  await alertQueue.add(
    "alert",
    {
      receiptId: "test-receipt-id",
      userPhone: phone,
      alertType: "return_deadline",
      scheduledFor: new Date(Date.now() + 5000).toISOString(),
      payload: { daysRemaining: 1, store_name: "Test Store" },
    },
    { delay: 5000 }
  );

  res.json({
    status: "queued",
    message: `Alert will fire to ${phone} in 5 seconds`,
  });
  log(`[test] Manual alert queued for ${phone}`);
});

export default router;
