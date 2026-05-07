import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { log, logError } from "../utils/logger";
import { ValidatedReceipt } from "../validators/receiptSchema";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function normalizePhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (String(phone).startsWith("+")) return String(phone);
  return `+${digits}`;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function getOrCreateUser(userPhone: string): Promise<string> {
  const canonicalPhone = normalizePhone(userPhone);

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("phone", canonicalPhone)
    .single();

  if (user) {
    return user.id;
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ phone: canonicalPhone })
    .select("id")
    .single();

  if (insertError || !newUser) {
    logError("Failed to create user", insertError);
    throw new Error(`Supabase user insert failed: ${insertError?.message}`);
  }

  return newUser.id;
}

export async function insertReceipt(
  data: ValidatedReceipt,
  r2Url: string,
  userPhone: string
): Promise<string> {
  const canonicalPhone = normalizePhone(userPhone);
  const userId = await getOrCreateUser(canonicalPhone);
  const purchaseDate = data.purchase_date || new Date().toISOString().split("T")[0];
  // Normalize purchaseDate to ISO YYYY-MM-DD to ensure consistent parsing on frontend
  function normalizeDateInput(d: string | null | undefined): string {
    if (!d) return new Date().toISOString().split("T")[0];
    const s = String(d).trim();
    // If already in YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // If in DD/MM/YYYY or D/M/YYYY, convert
    const dm = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (dm) {
      const day = dm[1].padStart(2, '0');
      const month = dm[2].padStart(2, '0');
      let year = dm[3];
      if (year.length === 2) year = '20' + year; // assume 20xx
      return `${year}-${month}-${day}`;
    }
    // Fallback: try to parse Date and format YYYY-MM-DD
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    // Last resort: today
    return new Date().toISOString().split("T")[0];
  }

  const normalizedPurchaseDate = normalizeDateInput(purchaseDate);
  // If parsed purchase date is far in the past (likely OCR/year-parsing error),
  // prefer the current date so dashboard totals reflect recent uploads.
  try {
    const parsed = new Date(normalizedPurchaseDate + 'T00:00:00Z');
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 120) {
      // Treat as recent receipt uploaded today
      const today = now.toISOString().split('T')[0];
      log(`Normalizing old purchase_date ${normalizedPurchaseDate} -> ${today}`);
      // override with today's date
      (normalizedPurchaseDate as any) = today;
    }
  } catch (e) {
    // ignore parsing issues
  }

  const returnDeadlineDate = data.return_deadline_days !== null
    ? addDays(purchaseDate, data.return_deadline_days)
    : null;

  const warrantyExpiryDate = data.warranty_months !== null
    ? addDays(purchaseDate, data.warranty_months * 30)
    : null;

  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .insert({
      user_id: userId,
      user_phone: canonicalPhone,
      store_name: data.store_name,
      purchase_date: normalizedPurchaseDate,
      total_amount: data.total_amount,
      currency: data.currency,
      r2_image_url: r2Url,
      return_deadline_date: returnDeadlineDate,
      warranty_expiry_date: warrantyExpiryDate,
      receipt_number: data.receipt_number,
      date_inferred: data.date_inferred,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (receiptError || !receipt) {
    logError("Failed to insert receipt", receiptError);
    throw new Error(`Supabase receipt insert failed: ${receiptError?.message}`);
  }

  const newReceiptId: string = receipt.id;

  if (data.items.length > 0) {
    const itemRows = data.items.map((item) => ({
      receipt_id: newReceiptId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      is_consumable: item.is_consumable,
    }));

    const { error: itemsError } = await supabase
      .from("receipt_items")
      .insert(itemRows);

    if (itemsError) {
      logError("Failed to insert receipt items, cleaning up orphaned receipt", itemsError);
      await supabase.from("receipts").delete().eq("id", newReceiptId);
      throw new Error(`Supabase receipt_items insert failed: ${itemsError.message}`);
    }
  }

  log(`Inserted receipt ${newReceiptId} for ${canonicalPhone}`);
  return newReceiptId;
}
