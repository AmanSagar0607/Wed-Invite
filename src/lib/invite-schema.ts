import { z } from "zod";

const hexColor = z.string().regex(/^#[\da-fA-F]{6}$/, "Use a six-digit hex color");
const safeWebUrl = z.string().max(500).refine((value) => !value || value.startsWith("/") || /^https?:\/\//i.test(value), "Use a relative path or an HTTP(S) URL");
const safeImage = z.string().max(2_000_000).refine((value) => !value || value.startsWith("/") || /^https?:\/\//i.test(value) || /^data:image\/(jpeg|png|webp);base64,/i.test(value), "Use an image URL or JPEG, PNG, or WebP image");
const sectionId = z.enum(["hero", "blessing", "date", "countdown", "events", "gallery", "rsvp", "share", "footer"]);

export const themeSchema = z.object({
  id: z.string(),
  name: z.string(),
  tokens: z.object({
    bg: hexColor,
    paper: hexColor,
    primary: hexColor,
    primaryContrast: hexColor,
    accent1: hexColor,
    accent2: hexColor,
    ink: hexColor,
    muted: hexColor,
    border: hexColor,
    heartScratch1: hexColor,
    heartScratch2: hexColor,
    overlay: hexColor,
  }),
  fonts: z.object({ heading: z.string(), script: z.string(), body: z.string() }),
  scriptSize: z.number().min(36).max(88),
  radius: z.number().min(8).max(40),
  frame: z.enum(["arch", "rounded", "square", "scalloped"]),
  bgStyle: z.enum(["grain", "plain", "gradient", "pattern"]),
  textureOpacity: z.number().min(0).max(1),
  ornaments: z.enum(["floral", "peacock", "minimal", "none"]),
  butterflies: z.boolean(),
  darkMode: z.boolean(),
  sectionBackgrounds: z.record(sectionId, z.union([hexColor, safeImage])),
});

export const inviteEventSchema = z.object({
  id: z.string(),
  title: z.string().max(80),
  dateLabel: z.string().max(60),
  calendarDate: z.string().max(20),
  time: z.string().max(60),
  venue: z.string().max(120),
  city: z.string().max(120),
  dressCode: z.string().max(120),
  mapsUrl: safeWebUrl,
  imageUrl: safeImage,
});

export const inviteSchema = z.object({
  couple: z.object({
    bride: z.string().max(80),
    groom: z.string().max(80),
    tagline: z.string().max(180),
    brideFamily: z.string().max(160),
    groomFamily: z.string().max(160),
  }),
  wording: z.object({
    blessing: z.string().max(600),
    hostHeading: z.string().max(120),
    invitation: z.string().max(500),
  }),
  weddingDate: z.string().max(20),
  whatsappNumber: z.string().max(24),
  hashtag: z.string().max(80),
  musicUrl: safeWebUrl,
  heroImage: safeImage,
  heroVideo: safeWebUrl,
  events: z.array(inviteEventSchema).max(12),
  gallery: z.array(z.string().max(2_000_000)).max(24),
  sections: z.record(sectionId, z.boolean()),
  sectionOrder: z.array(sectionId).max(20),
  contacts: z.array(z.object({ name: z.string().max(80), phone: z.string().max(24) })).max(8),
  theme: themeSchema,
});

export type InviteData = z.infer<typeof inviteSchema>;
export type InviteTheme = z.infer<typeof themeSchema>;
export type InviteEvent = z.infer<typeof inviteEventSchema>;
