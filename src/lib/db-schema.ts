import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import type { InviteData } from "@/lib/invite-schema";

export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  data: jsonb("data").$type<InviteData>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
