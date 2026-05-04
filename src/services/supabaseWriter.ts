import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { log, logError } from "../utils/logger";
import { ValidatedReceipt } from "../validators/receiptSchema";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function getOrCreateUser(userPhone: string): Promise<string> {
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("phone", userPhone)
    .single();

  if (user) {
    return user.id;
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert({ phone: userPhone })
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
  const userId = await getOrCreateUser(userPhone);
  const purchaseDate = data.purchase_date || new Date().toISOString().split("T")[0];

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
      user_phone: userPhone,
      store_name: data.store_name,
      purchase_date: purchaseDate,
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

  log(`Inserted receipt ${newReceiptId} for ${userPhone}`);
  return newReceiptId;
}
