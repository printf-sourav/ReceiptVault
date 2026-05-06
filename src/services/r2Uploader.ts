import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { log, logError } from "../utils/logger";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const s3Client = new S3Client({
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectMimeAndExt(buf: Buffer): {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: string;
} {
  if (buf[0] === 0xff && buf[1] === 0xd8)
    return { mime: "image/jpeg", ext: "jpg" };
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return { mime: "image/png", ext: "png" };
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return { mime: "image/webp", ext: "webp" };
  return { mime: "image/jpeg", ext: "jpg" };
}

export function generateFileName(
  senderPhone: string,
  ext: string
): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `receipts/${senderPhone}/${Date.now()}-${random}.${ext}`;
}

export async function uploadToR2(
  imageBuffer: Buffer,
  senderPhone: string
): Promise<string> {
  const { mime, ext } = detectMimeAndExt(imageBuffer);
  const filename = generateFileName(senderPhone, ext);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: filename,
    Body: imageBuffer,
    ContentType: mime,
  });

  try {
    await s3Client.send(command);
  } catch (firstError) {
    logError("R2 upload failed, retrying in 2s...", firstError);
    await sleep(2000);
    try {
      await s3Client.send(command);
    } catch (retryError) {
      logError("R2 upload retry failed", retryError);
      throw firstError;
    }
  }

  const publicUrl = `${R2_PUBLIC_URL}/${filename}`;
  log(
    `Uploaded to R2: ${imageBuffer.length} bytes → ${publicUrl} (${mime})`
  );
  return publicUrl;
}
