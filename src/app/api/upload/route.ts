import { randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg", "audio/wav", "audio/x-wav"]);
const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/aac": "aac", "audio/ogg": "ogg", "audio/wav": "wav", "audio/x-wav": "wav" };
const uploadWindows = new Map<string, { startedAt: number; count: number }>();

function canUpload(request: Request) {
  const origin = request.headers.get("origin");
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host"))?.split(",")[0].trim();
  if (!origin || !host) return false;
  try {
    if (new URL(origin).host !== host) return false;
  } catch {
    return false;
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const now = Date.now();
  const current = uploadWindows.get(ip);
  if (!current || now - current.startedAt > 60_000) {
    uploadWindows.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= 30) return false;
  current.count++;
  return true;
}

function createStorageClient() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey || !process.env.R2_BUCKET_NAME) throw new Error("R2 is not configured.");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(request: Request) {
  if (!canUpload(request)) return NextResponse.json({ error: "Upload request was rejected." }, { status: 403 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPEG, PNG, WebP, MP3, M4A, OGG, or WAV file." }, { status: 415 });
    const sizeLimit = file.type.startsWith("audio/") ? 15 * 1024 * 1024 : 8 * 1024 * 1024;
    if (file.size < 1 || file.size > sizeLimit) return NextResponse.json({ error: file.type.startsWith("audio/") ? "Audio files must be smaller than 15 MB." : "Images must be smaller than 8 MB." }, { status: 413 });

    const key = `uploads/${randomUUID()}.${extensions[file.type]}`;
    const client = createStorageClient();
    await client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: new Uint8Array(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }));
    return NextResponse.json({ url: `/api/media/${key}` }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The image could not be uploaded. Try again or keep editing your local draft." }, { status: 503 });
  }
}
