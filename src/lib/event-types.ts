export type StudioEventType = {
  id: "wedding" | "engagement" | "birthday";
  name: string;
  availability: "live" | "soon";
  description: string;
  icon: "rings" | "sparkles" | "cake";
};

export const eventTypes: StudioEventType[] = [
  { id: "wedding", name: "Wedding", availability: "live", description: "A beautiful home for every moment of your celebration.", icon: "rings" },
  { id: "engagement", name: "Engagement", availability: "soon", description: "Share the first chapter of your forever.", icon: "sparkles" },
  { id: "birthday", name: "Birthday", availability: "soon", description: "Make their next trip around the sun unforgettable.", icon: "cake" },
];

export const templateTierById: Record<string, "Free" | "Premium"> = {
  "rajasthani-rose": "Free",
  "sage-sand": "Free",
  "ivory-gold": "Premium",
  "emerald-royal": "Premium",
  "midnight-blush": "Premium",
  "sindoor-red": "Premium",
  "peacock-teal": "Premium",
  "lavender-mist": "Premium",
};
