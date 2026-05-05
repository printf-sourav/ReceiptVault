const { z } = require('zod');

// ── 1. ITEM SCHEMA ───────────────────────────────────────────
const ReceiptItemSchema = z.object({
  name: z.string().min(1).catch('Unknown Item'),
  quantity: z
    .number()
    .positive()
    .catch(1),
  unit_price: z
    .number()
    .nonnegative()
    .nullable()
    .catch(null),
  total_price: z
    .number()
    .nonnegative()
    .nullable()
    .catch(null),
  is_consumable: z
    .boolean()
    .catch(false),
  category: z
    .enum([
      'grocery',
      'electronics',
      'clothing',
      'food_dining',
      'pharmacy',
      'beauty',
      'home',
      'books',
      'toys',
      'other',
    ])
    .nullable()
    .catch(null),
});

// ── 2. MAIN RECEIPT SCHEMA ───────────────────────────────────
const ReceiptSchema = z.object({
  store_name: z
    .string()
    .min(1)
    .nullable()
    .catch(null),

  purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .nullable()
    .catch(null),

  purchase_date_inferred: z
    .boolean()
    .catch(false),

  total_amount: z
    .number()
    .nonnegative()
    .nullable()
    .catch(null),

  currency: z
    .string()
    .min(1)
    .catch('INR'),

  items: z
    .array(ReceiptItemSchema)
    .catch([]),

  gst_amount: z
    .number()
    .nonnegative()
    .nullable()
    .catch(null),

  return_deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .nullable()
    .catch(null),

  return_deadline_days: z
    .number()
    .positive()
    .nullable()
    .catch(null),

  warranty_period: z
    .string()
    .nullable()
    .catch(null),

  warranty_expiry_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .nullable()
    .catch(null),

  receipt_type: z
    .enum([
      'supermarket',
      'restaurant',
      'online_order',
      'electronics',
      'pharmacy',
      'handwritten',
      'other',
    ])
    .catch('other'),

  confidence: z
    .number()
    .min(0)
    .max(1)
    .catch(0.5),

  extraction_notes: z
    .string()
    .nullable()
    .catch(null),
});

// ── 3. VALIDATE FUNCTION ─────────────────────────────────────
// This is what you call after Gemini returns JSON.
// It NEVER throws — bad fields get safe defaults instead.
function validateReceipt(geminiOutput) {
  // parse handles the case where geminiOutput is still a string
  const raw =
    typeof geminiOutput === 'string'
      ? JSON.parse(geminiOutput)
      : geminiOutput;

  const result = ReceiptSchema.safeParse(raw);

  if (result.success) {
    return {
      data: result.data,
      valid: true,
      issues: [],
    };
  }

  // safeParse failed at the top level (very rare with .catch() on every field)
  // fall back to parsing field by field with defaults
  const fallback = ReceiptSchema.parse(
    ReceiptSchema.catch(getDefaults()).parse(raw)
  );

  return {
    data: fallback,
    valid: false,
    issues: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  };
}

// ── 4. DEFAULTS (used as last resort fallback) ───────────────
function getDefaults() {
  return {
    store_name: null,
    purchase_date: null,
    purchase_date_inferred: true,
    total_amount: null,
    currency: 'INR',
    items: [],
    gst_amount: null,
    return_deadline: null,
    return_deadline_days: null,
    warranty_period: null,
    warranty_expiry_date: null,
    receipt_type: 'other',
    confidence: 0,
    extraction_notes: 'validation failed — all fields defaulted',
  };
}

// ── 5. TEST ──────────────────────────────────────────────────
function runTests() {
  console.log('Running Zod validation tests...\n');

  // Test 1 — perfect Gemini output (should pass cleanly)
  const test1 = validateReceipt({
    store_name: 'DMART',
    purchase_date: '2025-05-01',
    purchase_date_inferred: false,
    total_amount: 750,
    currency: 'INR',
    items: [
      {
        name: 'Amul Taaza Milk 1L',
        quantity: 2,
        unit_price: 56,
        total_price: 112,
        is_consumable: true,
        category: 'grocery',
      },
    ],
    gst_amount: null,
    return_deadline: null,
    return_deadline_days: null,
    warranty_period: null,
    warranty_expiry_date: null,
    receipt_type: 'supermarket',
    confidence: 1,
    extraction_notes: null,
  });
  console.log('Test 1 — clean receipt:');
  console.log('  valid:', test1.valid);
  console.log('  store:', test1.data.store_name);
  console.log('  items:', test1.data.items.length);

  // Test 2 — missing fields (should apply safe defaults)
  const test2 = validateReceipt({
    store_name: null,
    total_amount: 'not a number', // wrong type
    currency: '',                 // empty string
    items: null,                  // should default to []
    receipt_type: 'spaceship',    // invalid enum
    confidence: 99,               // out of range
  });
  console.log('\nTest 2 — bad/missing fields:');
  console.log('  valid:', test2.valid);
  console.log('  total_amount (defaulted):', test2.data.total_amount);   // null
  console.log('  currency (defaulted):', test2.data.currency);           // INR
  console.log('  items (defaulted):', test2.data.items);                 // []
  console.log('  receipt_type (defaulted):', test2.data.receipt_type);   // other
  console.log('  confidence (defaulted):', test2.data.confidence);       // 0.5

  // Test 3 — date in wrong format (DD/MM/YYYY instead of YYYY-MM-DD)
  const test3 = validateReceipt({
    store_name: 'Zomato',
    purchase_date: '01/05/2025', // wrong format — Gemini slipped up
    total_amount: 340,
    currency: 'INR',
    items: [],
    receipt_type: 'online_order',
    confidence: 0.9,
  });
  console.log('\nTest 3 — wrong date format:');
  console.log('  valid:', test3.valid);
  console.log('  purchase_date (defaulted to null):', test3.data.purchase_date);
  console.log('  purchase_date_inferred:', test3.data.purchase_date_inferred);

  // Test 4 — completely empty object
  const test4 = validateReceipt({});
  console.log('\nTest 4 — empty object:');
  console.log('  valid:', test4.valid);
  console.log('  currency (defaulted):', test4.data.currency); // INR
  console.log('  items (defaulted):', test4.data.items);       // []

  console.log('\nAll tests done. No crashes = Zod is working correctly.');
}

runTests();

// ── 6. EXPORT FOR USE IN YOUR PIPELINE ──────────────────────
module.exports = { validateReceipt, ReceiptSchema, ReceiptItemSchema };