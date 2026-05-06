import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sendWhatsAppMessage } from "../../services/whatsappSender";
import { log, logError } from "../../utils/logger";

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function searchCurrentPrice(itemName: string): Promise<string[]> {
  const url = "https://www.googleapis.com/customsearch/v1";
  const res = await axios.get(url, {
    params: {
      key: process.env.GOOGLE_CSE_KEY,
      cx: process.env.GOOGLE_CSE_ID,
      q: `${itemName} price buy India`,
      num: 5,
    },
  });
  return (res.data.items || []).map(
    (item: any) => `${item.title} ${item.snippet}`
  );
}

async function extractPriceFromText(
  text: string
): Promise<number | null> {
  const match = text.match(/₹\s?([\d,]+)/);
  if (match) {
    const val = parseFloat(match[1].replace(/,/g, ""));
    if (!isNaN(val) && val > 100) return val;
  }
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Extract the price in Indian Rupees (INR) from this text.
Return ONLY a plain number with no currency symbol, commas, or text.
If no price is found, return the word null.

Text: ${text}`
    );
    const raw = result.response.text().trim();
    if (raw === "null") return null;
    const val = parseFloat(raw.replace(/,/g, ""));
    return isNaN(val) ? null : val;
  } catch {
    return null;
  }
}

export async function checkPriceDrop(
  itemName: string,
  purchasePrice: number,
  userPhone: string
): Promise<void> {
  if (!process.env.GOOGLE_CSE_KEY || !process.env.GOOGLE_CSE_ID) {
    log("[price-monitor] GOOGLE_CSE_KEY or GOOGLE_CSE_ID not set — skipping");
    return;
  }

  log(`[price-monitor] Checking: ${itemName} (paid ₹${purchasePrice})`);

  let snippets: string[];
  try {
    snippets = await searchCurrentPrice(itemName);
  } catch (err) {
    logError("[price-monitor] Search failed", err);
    return;
  }

  const prices: number[] = [];
  for (const snippet of snippets) {
    const price = await extractPriceFromText(snippet);
    if (price !== null) prices.push(price);
  }

  if (prices.length < 2) {
    log("[price-monitor] Not enough sources for confidence — skipping");
    return;
  }

  const sorted = [...prices].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const dropPercent =
    ((purchasePrice - median) / purchasePrice) * 100;

  log(
    `[price-monitor] Median: ₹${median}, drop: ${dropPercent.toFixed(1)}%`
  );

  if (dropPercent >= 10) {
    const message =
      `Price drop alert on ${itemName}!\n` +
      `You paid: ₹${purchasePrice}\n` +
      `Current price: ~₹${Math.round(median)}\n` +
      `That's a ${dropPercent.toFixed(1)}% drop.\n` +
      `Search now: https://www.google.com/search?q=${encodeURIComponent(
        itemName + " buy India"
      )}`;
    await sendWhatsAppMessage(userPhone, message);
    log(`[price-monitor] Alert sent to ${userPhone}`);
  }
}
