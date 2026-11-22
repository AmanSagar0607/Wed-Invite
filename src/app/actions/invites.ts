"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { inviteSchema } from "@/lib/invite-schema";
import { invites } from "@/lib/db-schema";
import { getDb } from "@/lib/db";

const publishWindows = new Map<string, { startedAt: number; count: number }>();

function canPublish(ip: string) {
  const now = Date.now();
  const current = publishWindows.get(ip);
  if (!current || now - current.startedAt > 10 * 60_000) {
    publishWindows.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count++;
  return true;
}

function makeSlug(bride: string, groom: string) {
  const names = `${bride}-${groom}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return `${names || "wedding"}-${randomBytes(3).toString("hex")}`;
}

export async function publishInvite(input: unknown) {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Some invitation details need attention. Review the form and try again." };

  if (!parsed.data.couple.bride.trim() || !parsed.data.couple.groom.trim()) {
    return { ok: false as const, error: "Add both names before publishing your invitation." };
  }
  if (parsed.data.events.some((event) => !event.title.trim())) {
    return { ok: false as const, error: "Give each celebration a name before publishing." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!canPublish(ip)) return { ok: false as const, error: "Please wait a little before publishing another invitation." };

  const serialized = JSON.stringify(parsed.data);
  if (Buffer.byteLength(serialized, "utf8") > 4 * 1024 * 1024) {
    return { ok: false as const, error: "This draft is too large to publish. Ensure photos are uploaded to your media store, then try again." };
  }

  try {
    const db = getDb();
    const slug = makeSlug(parsed.data.couple.bride, parsed.data.couple.groom);
    await db.insert(invites).values({ slug, data: parsed.data });
    revalidatePath(`/i/${slug}`);
    return { ok: true as const, slug };
  } catch {
    return { ok: false as const, error: "We could not publish this invitation just now. Your draft is still saved in this browser." };
  }
}
