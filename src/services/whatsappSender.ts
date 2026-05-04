import axios from "axios";
import { log, logError } from "../utils/logger";
import { ValidatedReceipt } from "../validators/receiptSchema";

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const META_PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID!;

export async function sendWhatsAppMessage(toPhone: string, messageText: string): Promise<void> {
  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${META_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: toPhone,
        type: "text",
        text: { body: messageText },
      },
      {
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    log(`Sent WhatsApp message to ${toPhone}: ${messageText.slice(0, 50)}`);
  } catch (error) {
    logError(`Failed to send WhatsApp message to ${toPhone}`, error);
    throw error;
  }
}

export function buildConfirmationMessage(data: ValidatedReceipt): string {
  const lines: string[] = [
    "Receipt saved!",
    `Store: ${data.store_name}`,
    `Total: ${data.currency} ${data.total_amount}`,
    `Items: ${data.items.length}`,
  ];

  if (data.return_deadline_days !== null) {
    const deadlineDate = data.purchase_date
      ? new Date(new Date(data.purchase_date).getTime() + data.return_deadline_days * 86400000)
          .toISOString().split("T")[0]
      : "TBD";
    lines.push(`Return window: ${data.return_deadline_days} days (by ${deadlineDate})`);
  }

  if (data.warranty_months !== null) {
    lines.push(`Warranty: ${data.warranty_months} months`);
  }

  lines.push("I'll remind you before key deadlines.");
  return lines.join("\n");
}
