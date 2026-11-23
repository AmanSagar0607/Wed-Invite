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
  return `${names || "wedding"}-${randomBytes(2).toString("hex")}`;
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

function publishFailureMessage(error: unknown) {
  const details = typeof error === "object" && error !== null
    ? error as { code?: string; message?: string }
    : {};
  if (details.message?.includes("DATABASE_URL")) {
    return "The invitation database is not configured. Your draft is safe; export it or try again after database setup.";
  }
  if (details.code === "23505") {
    return "We could not create a unique invitation link after several attempts. Please retry.";
  }
  if (details.code?.startsWith("08") || ["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(details.code ?? "")) {
    return "The invitation database could not be reached. Your draft is safe; check your connection and retry.";
  }
  return "The invitation could not be saved to the database. Your draft is safe; retry in a moment.";
}

export async function publishInvite(input: unknown) {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Some invitation details need attention. Review the highlighted fields and try again.",
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    };
  }

  if (parsed.data.events.some((event) => !event.title.trim())) {
    return { ok: false as const, error: "Give each celebration a name before publishing." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!canPublish(ip)) return { ok: false as const, error: "Please wait a little before publishing another invitation." };

  const serialized = JSON.stringify(parsed.data);
  if (Buffer.byteLength(serialized, "utf8") > 4 * 1024 * 1024) {
    return { ok: false as const, error: "This invitation is still too large. Upload every local photo to Blob before publishing." };
  }

  try {
    const db = getDb();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const slug = makeSlug(parsed.data.couple.bride, parsed.data.couple.groom);
      try {
        await db.insert(invites).values({ slug, data: parsed.data });
        try {
          revalidatePath(`/i/${slug}`);
        } catch (error) {
          console.error("[publishInvite] Invitation saved but route revalidation failed", error);
        }
        return { ok: true as const, slug };
      } catch (error) {
        if (isUniqueViolation(error) && attempt < 2) continue;
        throw error;
      }
    }
    return { ok: false as const, error: "We could not create a unique invitation link. Please retry." };
  } catch (error) {
    console.error("[publishInvite] Invitation database insert failed", error);
    return { ok: false as const, error: publishFailureMessage(error) };
  }
}
