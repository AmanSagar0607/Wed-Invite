import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function createStorageClient() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey || !process.env.R2_BUCKET_NAME) throw new Error("R2 is not configured.");
  return new S3Client({ region: "auto", endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } });
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  if (parts.length !== 2 || parts[0] !== "uploads" || !/^[a-f0-9-]{36}\.(jpg|png|webp|mp3|m4a|aac|ogg|wav)$/.test(parts[1])) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const result = await createStorageClient().send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: parts.join("/") }));
    if (!result.Body) return new NextResponse("Not found", { status: 404 });
    const bytes = await result.Body.transformToByteArray();
    const payload = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(payload).set(bytes);
    return new Response(payload, {
      headers: {
        "Content-Type": result.ContentType || "application/octet-stream",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
