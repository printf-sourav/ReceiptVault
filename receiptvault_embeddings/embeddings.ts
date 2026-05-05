import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReceiptEmbeddingInput {
  receiptId: string;   // UUID from receipts table
  storeName: string;
  items: string[];     // ["Amul Butter 500g", "Parle-G Biscuits", ...]
  totalAmount?: number;
  purchaseDate?: string;
}

export interface EmbeddingResult {
  receiptId: string;
  vectorDimensions: number;
  success: boolean;
  error?: string;
}

// ── Client setup ─────────────────────────────────────────────────────────────

function getSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role, not anon
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  return new GoogleGenerativeAI(apiKey);
}

// ── Core: build the text that gets embedded ──────────────────────────────────
//
// Richer text = better semantic search.
// "Reliance Digital Sony WH-1000XM5 Noise Cancelling Headphones" retrieves
// correctly for queries like "when did I buy headphones" or "Sony purchase".

export function buildEmbeddingText(input: ReceiptEmbeddingInput): string {
  const parts: string[] = [
    `Store: ${input.storeName}`,
    `Items: ${input.items.join(", ")}`,
  ];

  if (input.totalAmount !== undefined) {
    parts.push(`Total: ₹${input.totalAmount.toFixed(2)}`);
  }
  if (input.purchaseDate) {
    parts.push(`Date: ${input.purchaseDate}`);
  }

  return parts.join(". ");
}

// ── Core: call Gemini embedding model ────────────────────────────────────────
//
// Model: text-embedding-004  (768 dimensions — matches vector(768) column)
// Task type: RETRIEVAL_DOCUMENT for storing, RETRIEVAL_QUERY for searching.

export async function generateEmbedding(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: taskType as any,
  });

  const values = result.embedding.values;
  if (!values || values.length !== 768) {
    throw new Error(
      `Unexpected embedding dimensions: got ${values?.length}, expected 768`
    );
  }

  return values;
}

// ── Core: upsert vector into Supabase ────────────────────────────────────────
//
// Uses upsert so re-processing a receipt just refreshes its embedding.
// Requires the receipts table to have: id uuid PK, embedding vector(768).

async function storeEmbedding(
  supabase: SupabaseClient,
  receiptId: string,
  embedding: number[]
): Promise<void> {
  // pgvector expects the array as a string like "[0.1, 0.2, ...]"
  const vectorString = `[${embedding.join(",")}]`;

  const { error } = await supabase
    .from("receipts")
    .update({ embedding: vectorString })
    .eq("id", receiptId);

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`);
  }
}

// ── Main exported function ───────────────────────────────────────────────────

export async function embedAndStoreReceipt(
  input: ReceiptEmbeddingInput
): Promise<EmbeddingResult> {
  const supabase = getSupabaseClient();

  try {
    // 1. Build rich text from receipt fields
    const text = buildEmbeddingText(input);

    // 2. Generate 768-dim embedding via Gemini
    const embedding = await generateEmbedding(text, "RETRIEVAL_DOCUMENT");

    // 3. Persist vector to Supabase
    await storeEmbedding(supabase, input.receiptId, embedding);

    console.log(
      `[embeddings] ✓ receipt ${input.receiptId} — ` +
      `${embedding.length}d vector stored (text: "${text.slice(0, 60)}...")`
    );

    return {
      receiptId: input.receiptId,
      vectorDimensions: embedding.length,
      success: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[embeddings] ✗ receipt ${input.receiptId} — ${message}`);
    return {
      receiptId: input.receiptId,
      vectorDimensions: 0,
      success: false,
      error: message,
    };
  }
}

// ── Batch helper ─────────────────────────────────────────────────────────────
//
// Gemini has rate limits (~1500 RPM on free tier). The 200ms delay keeps you
// well under that even in burst scenarios.

export async function embedAndStoreBatch(
  inputs: ReceiptEmbeddingInput[],
  delayMs = 200
): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];

  for (const input of inputs) {
    const result = await embedAndStoreReceipt(input);
    results.push(result);

    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  const succeeded = results.filter((r) => r.success).length;
  console.log(
    `[embeddings] batch complete — ${succeeded}/${results.length} succeeded`
  );

  return results;
}

// ── Semantic search ──────────────────────────────────────────────────────────
//
// Companion function: takes a natural language query, embeds it, and returns
// the most similar receipts using pgvector cosine similarity (<=>).
//
// SQL equivalent:
//   SELECT id, store_name, total_amount, return_deadline,
//          1 - (embedding <=> '[…query vector…]') AS similarity
//   FROM receipts
//   WHERE user_id = $1
//   ORDER BY embedding <=> '[…query vector…]'
//   LIMIT $2;

export interface SemanticSearchResult {
  id: string;
  store_name: string;
  total_amount: number;
  purchase_date: string;
  return_deadline: string | null;
  similarity: number;
}

export async function semanticSearchReceipts(
  userId: string,
  query: string,
  topK = 5
): Promise<SemanticSearchResult[]> {
  const supabase = getSupabaseClient();

  // Embed query with RETRIEVAL_QUERY task type (important — different from document)
  const queryEmbedding = await generateEmbedding(query, "RETRIEVAL_QUERY");
  const vectorString = `[${queryEmbedding.join(",")}]`;

  const { data, error } = await supabase.rpc("match_receipts", {
    query_embedding: vectorString,
    match_user_id: userId,
    match_count: topK,
  });

  if (error) throw new Error(`Semantic search failed: ${error.message}`);
  return (data ?? []) as SemanticSearchResult[];
}

// ── Usage example (remove before production) ─────────────────────────────────

async function example() {
  // Single receipt
  const result = await embedAndStoreReceipt({
    receiptId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    storeName: "Reliance Digital",
    items: ["Sony WH-1000XM5 Headphones", "USB-C Cable 2m"],
    totalAmount: 29990,
    purchaseDate: "2025-01-15",
  });
  console.log(result);

  // Semantic search
  const hits = await semanticSearchReceipts(
    "user-uuid-here",
    "when did I last buy headphones"
  );
  console.log(hits);
}