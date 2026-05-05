require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── 1. EMAIL EXTRACTION PROMPT ───────────────────────────────
const EMAIL_EXTRACTION_PROMPT = `
You are an order data extraction engine. You will be given the raw text of an email — it may contain HTML artifacts, repeated order numbers, marketing copy, unsubscribe links, and promotional banners.

Your job is to ignore all the noise and extract only the actual order information.

The email may be from any of these senders:
- Amazon India (order confirmations, shipment notifications)
- Flipkart (order placed, dispatched emails)
- Zomato (order confirmation, delivery updates)
- Swiggy (order placed, on the way emails)
- Myntra (order confirmation)
- BigBasket, Blinkit, Zepto (grocery delivery)
- Any other Indian e-commerce or food delivery platform

OUTPUT FORMAT — return ONLY this JSON, no explanation, no markdown, no code fences:

{
  "store_name": string | null,
  "order_id": string | null,
  "purchase_date": string | null,
  "purchase_date_inferred": boolean,
  "total_amount": number | null,
  "currency": string,
  "delivery_address_city": string | null,
  "estimated_delivery": string | null,
  "items": [
    {
      "name": string,
      "quantity": number,
      "unit_price": number | null,
      "total_price": number | null,
      "is_consumable": boolean,
      "category": string | null
    }
  ],
  "delivery_charge": number | null,
  "discount_amount": number | null,
  "gst_amount": number | null,
  "return_deadline": string | null,
  "return_deadline_days": number | null,
  "warranty_period": string | null,
  "warranty_expiry_date": string | null,
  "receipt_type": string,
  "confidence": number,
  "extraction_notes": string | null
}

FIELD-BY-FIELD RULES:

store_name:
  - Use the platform name, not the individual seller name
  - "Amazon India" not "Cloudtail India Pvt Ltd"
  - "Flipkart" not "WS Retail"
  - "Zomato", "Swiggy", "Myntra", "BigBasket", "Blinkit", "Zepto" as-is
  - If unknown platform, use the sender domain (e.g. "noreply@shop.com" → "shop.com")

order_id:
  - Extract the primary order ID / order number
  - Amazon format: 402-XXXXXXX-XXXXXXX
  - Flipkart format: OD-XXXXXXXXXX
  - Zomato/Swiggy: numeric order ID
  - If multiple order IDs appear (e.g. item-level and order-level), use the top-level order ID
  - Return null if not found

purchase_date:
  - Return in ISO 8601 format: YYYY-MM-DD
  - Look for "order placed", "order date", "ordered on"
  - Indian formats like "1 May 2025" or "01/05/2025" should be converted to "2025-05-01"
  - If only estimated delivery date is present but no order date, return null and set purchase_date_inferred to true
  - Do not use the email received date as the purchase date

purchase_date_inferred:
  - true if date was estimated or not explicitly stated as the order date
  - false if "order placed on [date]" or similar was clearly present

total_amount:
  - The final amount actually charged or to be charged
  - After discounts, after delivery charges, after GST
  - Look for "order total", "total payable", "amount charged", "grand total"
  - Do not use subtotal or pre-discount amount
  - Strip rupee symbol and commas (₹1,299.00 → 1299.00)
  - Return null if not found

currency:
  - Default "INR" for all Indian platforms
  - Only change if explicitly shown otherwise

delivery_address_city:
  - Extract city from delivery address if shown
  - Return null if not shown

estimated_delivery:
  - Return in ISO 8601 format: YYYY-MM-DD
  - Look for "arriving", "delivery by", "expected by", "get it by"
  - Return null if not mentioned

items:
  - Extract every product ordered
  - For food orders (Zomato/Swiggy): each dish is one item
  - For e-commerce: each product is one item — if same product ordered in quantity > 1, set quantity accordingly
  - name: clean product name only — remove seller name, SKU codes, ASIN, color/size variants if they make the name too long (keep short variants like "Blue, L")
  - quantity: default 1 if not shown
  - unit_price: price per single unit before any discount, null if not shown
  - total_price: final price for this line item after discount, null if not shown
  - is_consumable: true for food, beverages, toiletries, cleaning supplies, medicines, printer ink, pet food
  - category: one of "grocery", "electronics", "clothing", "food_dining", "pharmacy", "beauty", "home", "books", "toys", "other"

delivery_charge:
  - Delivery fee as a plain number, null if free or not shown

discount_amount:
  - Total discount applied as a plain number (positive number even though it reduces the total)
  - null if not shown

gst_amount:
  - Total GST/tax charged as a plain number
  - null if not shown or if included in item prices without being broken out

return_deadline:
  - Return in ISO 8601 format: YYYY-MM-DD
  - Calculate from purchase_date + return window if the policy is mentioned
  - Common policies (only apply if mentioned in this specific email):
      Amazon India: 10 days
      Flipkart: 7 days
      Myntra: 30 days
      Zomato/Swiggy: no returns (null)
  - Do NOT assume a return policy — only set if this email mentions it

return_deadline_days:
  - Number of days for return window (e.g. 10)
  - null if not mentioned

warranty_period:
  - Only for electronics — look for "warranty", "guarantee"
  - Return as human-readable string: "1 year", "6 months"
  - null if not mentioned

warranty_expiry_date:
  - Calculate from purchase_date + warranty_period if both are known
  - YYYY-MM-DD format
  - null if either is missing

receipt_type:
  - Always "online_order" for emails

confidence:
  - 0.0 to 1.0
  - 1.0 = all key fields (order_id, date, total, items) clearly present
  - 0.7 = most fields present but some missing or ambiguous
  - 0.4 = heavily garbled HTML, most fields missing or uncertain

extraction_notes:
  - One short note if anything was uncertain: "total not explicitly shown — inferred from item sum", "HTML artifacts made parsing difficult"
  - null if extraction was clean

NOISE TO IGNORE — do not extract data from:
  - "You might also like" / "Recommended for you" sections
  - Promotional banners and discount offers for future orders
  - Unsubscribe links and footer legal text
  - Customer support phone numbers and addresses
  - Social media links
  - Repeated order ID mentions (pick the first/primary one)

CRITICAL RULES:
1. Return ONLY the raw JSON object. No markdown. No code fences. No explanation.
2. Never invent data. If a field is not visible in the email, return null.
3. Amounts must always be plain numbers — strip ₹, commas, spaces.
4. Dates must always be YYYY-MM-DD in the output regardless of input format.
5. If the email is not an order confirmation (e.g. it is a newsletter or promotional email with no actual order), return all fields null, confidence: 0.0, extraction_notes: "not an order confirmation email".
6. If the email contains multiple orders, extract only the primary/most recent order.
`;

// ── 2. EXTRACTION FUNCTION ───────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractOrderFromEmail(emailText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const result = await model.generateContent([
    EMAIL_EXTRACTION_PROMPT,
    `Here is the email text to extract from:\n\n${emailText}`,
  ]);

  const raw = result.response.text().trim();

  // strip markdown fences if Gemini adds them despite instructions
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

// ── 3. TEST ──────────────────────────────────────────────────
async function main() {
  // paste a real email body here to test
  const testEmail = `
    Your Amazon.in order of "boAt Rockerz 255 Pro+" has been placed.
    
    Order #402-7364291-8472345
    Placed on: 1 May 2025
    
    Items ordered:
    boAt Rockerz 255 Pro+ Bluetooth Earphones (Active Black)   ₹1,299
    Qty: 1
    
    Order Summary:
    Item(s) subtotal:   ₹1,499
    Discount:           -₹200
    Delivery:           FREE
    Total:              ₹1,299
    
    Arriving: Thursday, 8 May 2025
    Delivering to: Bengaluru 560001
    
    Returns accepted within 10 days of delivery.
    1 year manufacturer warranty.
    
    ---
    You might also like: boAt Airdopes 141
    Unsubscribe | Privacy Policy | Help
  `;

  console.log('Sending email to Gemini...\n');
  const result = await extractOrderFromEmail(testEmail);
  console.log('Extracted data:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);