import { upload } from "@vercel/blob/client";

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadInviteImage(file: File) {
  const extension = imageExtensions[file.type];
  if (!extension) throw new Error("Choose a JPEG, PNG, or WebP image before uploading.");

  try {
    const blob = await upload(`wedding-invites/${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
    });
    return blob.url;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/token|not configured|environment/i.test(message)) {
      throw new Error("Photo storage is not configured. Check the connected Vercel Blob store and retry.");
    }
    if (/network|fetch|offline/i.test(message)) {
      throw new Error("The photo upload lost its network connection. Your draft is safe; retry the upload.");
    }
    throw new Error("The photo could not be uploaded to Vercel Blob. Your draft is safe; retry the upload.");
  }
}

export async function uploadInviteImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([\s\S]+)$/i);
  if (!match) throw new Error("A local photo could not be read. Remove it and choose it again before publishing.");
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const file = new File([bytes], `invitation-photo.${match[1].split("/")[1]}`, { type: match[1] });
  return uploadInviteImage(file);
}
