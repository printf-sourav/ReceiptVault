// test-embeddings.ts  ← create this as a throwaway test file
import { embedAndStoreReceipt, semanticSearchReceipts } from "./embeddings";

async function test() {
  // First insert a dummy row into receipts table manually in Supabase,
  // grab its UUID, then:
  const result = await embedAndStoreReceipt({
    receiptId: "paste-the-uuid-here",
    storeName: "DMart",
    items: ["Head & Shoulders Shampoo 400ml", "Dove Soap"],
    totalAmount: 450,
    purchaseDate: "2025-05-01",
  });
  console.log(result); // should show success: true, vectorDimensions: 768

  // Then test search:
  const hits = await semanticSearchReceipts("your-user-uuid", "shampoo purchase");
  console.log(hits);
}

test().catch(console.error);