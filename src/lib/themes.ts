import type { InviteTheme } from "@/lib/invite-schema";

const fonts = { heading: "cormorant", script: "great-vibes", body: "montserrat" };

export const themePresets: InviteTheme[] = [
  { id: "rajasthani-rose", name: "Rajasthani Rose", tokens: { bg: "#FBE9D0", paper: "#FFF6EA", primary: "#9B1B4B", primaryContrast: "#FFFFFF", accent1: "#E9CF7A", accent2: "#B8892F", ink: "#3A2A20", muted: "#806A5B", border: "#E7D1B7", heartScratch1: "#9B1B4B", heartScratch2: "#6F1436", overlay: "#321725" }, fonts, scriptSize: 58, radius: 26, frame: "arch", bgStyle: "grain", textureOpacity: 0.24, ornaments: "floral", butterflies: true, darkMode: false, sectionBackgrounds: {} },
  { id: "ivory-gold", name: "Ivory Gold", tokens: { bg: "#FAF6EE", paper: "#FFFDF8", primary: "#7A5C1E", primaryContrast: "#FFFFFF", accent1: "#D9B65D", accent2: "#A67C1A", ink: "#342C20", muted: "#786D5C", border: "#E8DFC9", heartScratch1: "#7A5C1E", heartScratch2: "#4F3B13", overlay: "#292116" }, fonts: { heading: "playfair", script: "parisienne", body: "montserrat" }, scriptSize: 58, radius: 26, frame: "arch", bgStyle: "grain", textureOpacity: 0.2, ornaments: "floral", butterflies: true, darkMode: false, sectionBackgrounds: {} },
  { id: "emerald-royal", name: "Emerald Royal", tokens: { bg: "#EEF4EC", paper: "#FBFFF9", primary: "#0F5C47", primaryContrast: "#FFFFFF", accent1: "#E0C068", accent2: "#B08D2A", ink: "#24392F", muted: "#63776A", border: "#D8E3D4", heartScratch1: "#0F5C47", heartScratch2: "#093D2F", overlay: "#0C2820" }, fonts: { heading: "cinzel", script: "great-vibes", body: "lora" }, scriptSize: 58, radius: 22, frame: "arch", bgStyle: "pattern", textureOpacity: 0.1, ornaments: "peacock", butterflies: true, darkMode: false, sectionBackgrounds: {} },
  { id: "midnight-blush", name: "Midnight Blush", tokens: { bg: "#1B1630", paper: "#28213E", primary: "#E9A6B8", primaryContrast: "#271522", accent1: "#F2D58A", accent2: "#C9A24B", ink: "#F5EDE6", muted: "#C4B7C1", border: "#4B405D", heartScratch1: "#A85574", heartScratch2: "#67334D", overlay: "#080611" }, fonts: { heading: "playfair", script: "parisienne", body: "dm-sans" }, scriptSize: 58, radius: 24, frame: "rounded", bgStyle: "gradient", textureOpacity: 0.1, ornaments: "minimal", butterflies: true, darkMode: true, sectionBackgrounds: {} },
  { id: "sindoor-red", name: "Sindoor Red", tokens: { bg: "#FFF1E6", paper: "#FFFAF4", primary: "#C21E1E", primaryContrast: "#FFFFFF", accent1: "#F4C95D", accent2: "#C28A1E", ink: "#3D2822", muted: "#86645A", border: "#EBD6C6", heartScratch1: "#C21E1E", heartScratch2: "#861414", overlay: "#321411" }, fonts: { heading: "cinzel", script: "great-vibes", body: "montserrat" }, scriptSize: 58, radius: 24, frame: "arch", bgStyle: "grain", textureOpacity: 0.2, ornaments: "floral", butterflies: true, darkMode: false, sectionBackgrounds: {} },
  { id: "peacock-teal", name: "Peacock Teal", tokens: { bg: "#E9F4F4", paper: "#F7FEFD", primary: "#0B6E7F", primaryContrast: "#FFFFFF", accent1: "#E6C46A", accent2: "#B28A2E", ink: "#203538", muted: "#637B7C", border: "#D0E3E2", heartScratch1: "#0B6E7F", heartScratch2: "#064956", overlay: "#09292D" }, fonts: { heading: "playfair", script: "great-vibes", body: "dm-sans" }, scriptSize: 58, radius: 26, frame: "arch", bgStyle: "pattern", textureOpacity: 0.12, ornaments: "peacock", butterflies: true, darkMode: false, sectionBackgrounds: {} },
  { id: "lavender-mist", name: "Lavender Mist", tokens: { bg: "#F4EEF8", paper: "#FDF9FF", primary: "#6D4A8F", primaryContrast: "#FFFFFF", accent1: "#D8B86A", accent2: "#A98A3A", ink: "#33273A", muted: "#786B7D", border: "#E3D8EA", heartScratch1: "#6D4A8F", heartScratch2: "#493160", overlay: "#21142B" }, fonts: { heading: "lora", script: "parisienne", body: "montserrat" }, scriptSize: 58, radius: 26, frame: "rounded", bgStyle: "grain", textureOpacity: 0.18, ornaments: "floral", butterflies: true, darkMode: false, sectionBackgrounds: {} },
  { id: "sage-sand", name: "Sage & Sand", tokens: { bg: "#F2EFE6", paper: "#FCFAF4", primary: "#5E6B4A", primaryContrast: "#FFFFFF", accent1: "#D2B777", accent2: "#9E8240", ink: "#303229", muted: "#747568", border: "#E1DDCF", heartScratch1: "#5E6B4A", heartScratch2: "#404A32", overlay: "#20231A" }, fonts: { heading: "lora", script: "great-vibes", body: "dm-sans" }, scriptSize: 58, radius: 26, frame: "rounded", bgStyle: "grain", textureOpacity: 0.2, ornaments: "minimal", butterflies: true, darkMode: false, sectionBackgrounds: {} },
];

export const defaultTheme = themePresets[0];

export const themeFontOptions = {
  heading: [
    { id: "cormorant", name: "Cormorant Garamond" },
    { id: "playfair", name: "Playfair Display" },
    { id: "lora", name: "Lora" },
    { id: "cinzel", name: "Cinzel" },
    { id: "bodoni-moda", name: "Bodoni Moda" },
    { id: "dm-serif-display", name: "DM Serif Display" },
    { id: "libre-baskerville", name: "Libre Baskerville" },
    { id: "prata", name: "Prata" },
  ],
  script: [
    { id: "great-vibes", name: "Great Vibes" },
    { id: "parisienne", name: "Parisienne" },
    { id: "allura", name: "Allura" },
    { id: "dancing-script", name: "Dancing Script" },
    { id: "italianno", name: "Italianno" },
    { id: "tangerine", name: "Tangerine" },
    { id: "sacramento", name: "Sacramento" },
    { id: "petit-formal", name: "Petit Formal Script" },
  ],
  body: [
    { id: "montserrat", name: "Montserrat" },
    { id: "dm-sans", name: "DM Sans" },
    { id: "lato", name: "Lato" },
    { id: "nunito-sans", name: "Nunito Sans" },
    { id: "open-sans", name: "Open Sans" },
    { id: "source-sans", name: "Source Sans 3" },
    { id: "raleway", name: "Raleway" },
    { id: "manrope", name: "Manrope" },
  ],
} as const;

export const fontVariableById: Record<string, string> = {
  cormorant: "--font-cormorant",
  "great-vibes": "--font-great-vibes",
  montserrat: "--font-montserrat",
  playfair: "--font-playfair",
  lora: "--font-lora",
  "dm-sans": "--font-dm-sans",
  cinzel: "--font-cinzel",
  parisienne: "--font-parisienne",
  allura: "--font-allura",
  "dancing-script": "--font-dancing-script",
  italianno: "--font-italianno",
  tangerine: "--font-tangerine",
  sacramento: "--font-sacramento",
  "petit-formal": "--font-petit-formal",
  "bodoni-moda": "--font-bodoni-moda",
  "dm-serif-display": "--font-dm-serif-display",
  "libre-baskerville": "--font-libre-baskerville",
  prata: "--font-prata",
  lato: "--font-lato",
  "nunito-sans": "--font-nunito-sans",
  "open-sans": "--font-open-sans",
  "source-sans": "--font-source-sans",
  raleway: "--font-raleway",
  manrope: "--font-montserrat",
};

export function getThemeById(id?: string) {
  return themePresets.find((preset) => preset.id === id) ?? defaultTheme;
}
