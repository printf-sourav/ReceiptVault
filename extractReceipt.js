require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

// ── 1. YOUR PROMPT ──────────────────────────────────────────
const RECEIPT_EXTRACTION_PROMPT = `
You are a receipt data extraction engine. Analyze the provided image and extract structured data.

The image may be one of:
- A printed supermarket or grocery receipt
- A handwritten receipt or bill
- A screenshot of an online order confirmation (Amazon, Flipkart, Myntra, Zomato, Swiggy, etc.)
- A restaurant bill or food delivery receipt
- An electronics store invoice (Reliance Digital, Croma, Vi, etc.)

OUTPUT FORMAT — return ONLY this JSON, no explanation, no markdown, no code fences:

{
  "store_name": string | null,
  "purchase_date": string | null,
  "purchase_date_inferred": boolean,
  "total_amount": number | null,
  "currency": string,
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
  - Extract the business name exactly as printed
  - For online orders: use the platform name (e.g. "Amazon India", "Flipkart", "Zomato")
  - If not visible, return null

purchase_date:
  - Return in ISO 8601 format: YYYY-MM-DD
  - Indian receipts commonly use DD/MM/YYYY — convert correctly (e.g. 15/04/2024 → "2024-04-15")
  - If only month and year are visible, use the 1st of that month and set purchase_date_inferred to true
  - If no date is visible at all, return null and set purchase_date_inferred to true

purchase_date_inferred:
  - true if the date was estimated, partially guessed, or not explicitly printed
  - false if the date was clearly and fully visible on the receipt

total_amount:
  - Return as a plain number, no currency symbols (e.g. 1299.00 not ₹1,299)
  - Use the final payable amount — after discounts, after GST, after delivery charges
  - If GST is shown separately, still include it in total_amount
  - If not visible, return null

currency:
  - Default to "INR" for all Indian receipts
  - Only use another code (USD, EUR, etc.) if explicitly shown

items:
  - Extract every line item visible on the receipt
  - name: clean product name, remove product codes and barcodes
  - quantity: default to 1 if not shown
  - unit_price: price per single unit, null if not shown
  - total_price: quantity x unit_price, extract directly if shown
  - is_consumable: true for food, beverages, toiletries, cleaning supplies, medicines, printer ink, pet food
  - category: one of "grocery", "electronics", "clothing", "food_dining", "pharmacy", "beauty", "home", "books", "toys", "other"

gst_amount:
  - Extract the total GST/CGST/SGST/IGST charged
  - If multiple GST lines exist (CGST + SGST), sum them into one number
  - Return null if not shown

return_deadline:
  - Return in ISO 8601 format: YYYY-MM-DD
  - Look for text like "return by", "exchange within", "7-day return", "30 days return policy"
  - Do NOT infer a return deadline if it is not printed on this specific receipt
  - Set return_deadline_days to the number of days (e.g. 30) if you can determine it

warranty_period:
  - Look for text like "warranty", "guarantee", "1 year warranty", "2-year extended plan"
  - Return as a human-readable string: "1 year", "6 months", "2 years"
  - Return null if not mentioned

warranty_expiry_date:
  - If warranty_period is found AND purchase_date is known, calculate the expiry date
  - Return in ISO 8601 format: YYYY-MM-DD
  - Return null if either is missing

receipt_type:
  - Classify as one of: "supermarket", "restaurant", "online_order", "electronics", "pharmacy", "handwritten", "other"

confidence:
  - A number from 0.0 to 1.0 representing how clearly the receipt was readable
  - 1.0 = perfectly clear, 0.7 = some fields unclear, 0.4 = handwritten or very blurry

extraction_notes:
  - Any short note worth flagging: "date partially obscured", "total inferred from item sum"
  - Return null if nothing to flag

CRITICAL RULES:
1. Return ONLY the raw JSON object. No markdown. No code fences. No explanation before or after.
2. Never invent data. If a field is not visible, return null — do not guess.
3. The only exception: is_consumable and category may be inferred from the item name.
4. warranty_expiry_date may be calculated if purchase_date and warranty_period are both known.
5. Amounts must always be plain numbers. Strip rupee symbol, commas, and spaces.
6. Dates must always be YYYY-MM-DD in the output.
7. If the image is not a receipt, return all fields as null, confidence: 0.0, extraction_notes: "image does not appear to be a receipt".
`;

// ── 2. GEMINI FUNCTION ───────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractReceiptFromImage(imagePath) {
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const imageBytes = fs.readFileSync(imagePath);

  const result = await model.generateContent([
    {
      inlineData: {
        data: imageBytes.toString('base64'),
        mimeType: 'image/jpeg',
      },
    },
    RECEIPT_EXTRACTION_PROMPT,
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

// ── 3. RUN ───────────────────────────────────────────────────
async function main() {
  const imagePath = './test-receipt.jpg'; // <-- change this to your receipt photo filename

  console.log('Sending receipt to Gemini...\n');

  const result = await extractReceiptFromImage(imagePath);

  console.log('Extracted data:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);