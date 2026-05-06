import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { log, logError } from "../utils/logger";

// Own client — avoids circular dependency with supabaseWriter.ts
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface ReceiptEmbeddingInput {
  receiptId: string;
  storeName: string;
  items: string[];
  totalAmount?: number;
  purchaseDate?: string;
}

export interface EmbeddingResult {
  receiptId: string;
  success: boolean;
  error?: string;
}

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  return new GoogleGenerativeAI(apiKey);
}

export function buildEmbeddingText(
  input: ReceiptEmbeddingInput
): string {
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

async function generateEmbedding(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-2" });
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: taskType as any,
    outputDimensionality: 768,
  } as any);
  const values = result.embedding.values;
  if (!values || values.length !== 768) {
    throw new Error(
      `Unexpected embedding dimensions: got ${values?.length}, expected 768`
    );
  }
  return values;
}

export async function embedAndStoreReceipt(
  input: ReceiptEmbeddingInput
): Promise<EmbeddingResult> {
  try {
    const text = buildEmbeddingText(input);
    const embedding = await generateEmbedding(text, "RETRIEVAL_DOCUMENT");
    const vectorString = `[${embedding.join(",")}]`;

    const client = getSupabaseClient();
    const { error } = await client
      .from("receipts")
      .update({ embedding: vectorString })
      .eq("id", input.receiptId);

    if (error) throw new Error(`Supabase update failed: ${error.message}`);

    log(
      `[embeddings] receipt ${input.receiptId} — 768d vector stored ` +
        `("${text.slice(0, 60)}...")`
    );
    return { receiptId: input.receiptId, success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    logError(`[embeddings] receipt ${input.receiptId} — ${message}`);
    return { receiptId: input.receiptId, success: false, error: message };
  }
}

export async function semanticSearchReceipts(
  userPhone: string,
  query: string,
  topK = 5
): Promise<unknown[]> {
  const queryEmbedding = await generateEmbedding(query, "RETRIEVAL_QUERY");
  const vectorString = `[${queryEmbedding.join(",")}]`;

  const client = getSupabaseClient();
  const { data, error } = await client.rpc("match_receipts", {
    query_embedding: vectorString,
    match_user_phone: userPhone,
    match_count: topK,
  });

  if (error) throw new Error(`Semantic search failed: ${error.message}`);
  return data ?? [];
}
