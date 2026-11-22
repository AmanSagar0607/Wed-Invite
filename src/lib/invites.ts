import { cache } from "react";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { invites } from "@/lib/db-schema";

export const getPublishedInvite = cache(async (slug: string) => {
  const [record] = await getDb().select({ data: invites.data }).from(invites).where(eq(invites.slug, slug)).limit(1);
  return record?.data ?? null;
});
