//   src/skills/price-monitor.ts

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendWhatsAppMessage } from '../utils/whatsapp';  // Backend Dev 1's utility

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── 1. Search Google for current prices ──────────────────────────────
async function searchCurrentPrice(itemName: string): Promise<string[]> {
  const query = `${itemName} price buy India`;
  const url = `https://www.googleapis.com/customsearch/v1`;

  const res = await axios.get(url, {
    params: {
      key: process.env.GOOGLE_CSE_KEY,
      cx: process.env.GOOGLE_CSE_ID,
      q: query,
      num: 5,
    },
  });

  // Return the text snippets from top results
  return (res.data.items || []).map(
    (item: any) => `${item.title} ${item.snippet}`
  );
}

// ── 2. Extract a price (INR) from a snippet of text ──────────────────
async function extractPriceFromText(text: string): Promise<number | null> {
  // Try regex first — fast and free
  const match = text.match(/₹\s?([\d,]+)/);
  if (match) {
    const val = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 100) return val; // sanity: ignore ₹5 noise
  }

  // Fallback: ask Gemini to pull the price out
  try {
    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(
      `Extract the price in Indian Rupees (INR) from this text.
       Return ONLY a plain number with no currency symbol, commas, or text.
       If no price is found, return the word null.
       
       Text: ${text}`
    );
    const raw = result.response.text().trim();
    if (raw === 'null') return null;
    const val = parseFloat(raw.replace(/,/g, ''));
    return isNaN(val) ? null : val;
  } catch {
    return null;
  }
}

// ── 3. Main skill function ────────────────────────────────────────────
export async function checkPriceDrop(
  itemName: string,
  purchasePrice: number,
  userPhone: string
): Promise<void> {
  console.log(`[price-monitor] Checking: ${itemName} (paid ₹${purchasePrice})`);

  let snippets: string[];
  try {
    snippets = await searchCurrentPrice(itemName);
  } catch (err) {
    console.error('[price-monitor] Search failed:', err);
    return;
  }

  // Extract prices from each snippet
  const prices: number[] = [];
  for (const snippet of snippets) {
    const price = await extractPriceFromText(snippet);
    if (price !== null) prices.push(price);
  }

  console.log(`[price-monitor] Found prices:`, prices);

  // Confidence check: need at least 2 sources
  if (prices.length < 2) {
    console.log('[price-monitor] Not enough sources. Staying silent.');
    return;
  }

  // Use median (more robust than average against outlier prices)
  const sorted = [...prices].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  const dropPercent = ((purchasePrice - median) / purchasePrice) * 100;
  console.log(`[price-monitor] Median current price: ₹${median}, drop: ${dropPercent.toFixed(1)}%`);

  if (dropPercent >= 10) {
    const message =
      `Price drop alert on ${itemName}!\n` +
      `You paid: ₹${purchasePrice}\n` +
      `Current price: ~₹${Math.round(median)}\n` +
      `That's a ${dropPercent.toFixed(1)}% drop.\n` +
      `Search now: https://www.google.com/search?q=${encodeURIComponent(itemName + ' buy India')}`;

    await sendWhatsAppMessage(userPhone, message);
    console.log(`[price-monitor] Alert sent to ${userPhone}`);
  } else {
    console.log('[price-monitor] Drop below 10% threshold. No alert.');
  }
}