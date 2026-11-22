import type { Metadata, Viewport } from "next";
import {
  Allura,
  Bodoni_Moda,
  Cinzel,
  Cormorant_Garamond,
  Dancing_Script,
  DM_Sans,
  DM_Serif_Display,
  Great_Vibes,
  Italianno,
  Lato,
  Libre_Baskerville,
  Lora,
  Montserrat,
  Noto_Sans_Devanagari,
  Nunito_Sans,
  Open_Sans,
  Parisienne,
  Petit_Formal_Script,
  Playfair_Display,
  Prata,
  Raleway,
  Sacramento,
  Source_Sans_3,
  Tangerine, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["400", "500", "600", "700"] });
const greatVibes = Great_Vibes({ subsets: ["latin"], variable: "--font-great-vibes", weight: "400" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400", "500", "600", "700"] });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora", weight: ["400", "500", "600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "600", "700"] });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "500", "600", "700"] });
const parisienne = Parisienne({ subsets: ["latin"], variable: "--font-parisienne", weight: "400" });
const allura = Allura({ subsets: ["latin"], variable: "--font-allura", weight: "400" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script", weight: ["400", "500", "600", "700"] });
const italianno = Italianno({ subsets: ["latin"], variable: "--font-italianno", weight: "400" });
const tangerine = Tangerine({ subsets: ["latin"], variable: "--font-tangerine", weight: ["400", "700"] });
const sacramento = Sacramento({ subsets: ["latin"], variable: "--font-sacramento", weight: "400" });
const petitFormal = Petit_Formal_Script({ subsets: ["latin"], variable: "--font-petit-formal", weight: "400" });
const bodoniModa = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni-moda", weight: ["400", "500", "600", "700"] });
const dmSerifDisplay = DM_Serif_Display({ subsets: ["latin"], variable: "--font-dm-serif-display", weight: "400" });
const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], variable: "--font-libre-baskerville", weight: ["400", "700"] });
const prata = Prata({ subsets: ["latin"], variable: "--font-prata", weight: "400" });
const lato = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["400", "700"] });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans", weight: ["400", "500", "600", "700"] });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", weight: ["400", "500", "600", "700"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", weight: ["400", "500", "600", "700"] });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway", weight: ["400", "500", "600", "700"] });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-devanagari", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: { default: "Wedding Invite Studio | A celebration, beautifully yours", template: "%s | Wedding Invite Studio" },
  description: "Create a heartfelt wedding invitation with a live preview, keepsake details, and a shareable celebration page.",
  openGraph: {
    title: "Wedding Invite Studio",
    description: "A celebration, beautifully yours.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBE9D0",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${cormorant.variable} ${greatVibes.variable} ${montserrat.variable} ${playfair.variable} ${lora.variable} ${dmSans.variable} ${cinzel.variable} ${parisienne.variable} ${allura.variable} ${dancingScript.variable} ${italianno.variable} ${tangerine.variable} ${sacramento.variable} ${petitFormal.variable} ${bodoniModa.variable} ${dmSerifDisplay.variable} ${libreBaskerville.variable} ${prata.variable} ${lato.variable} ${nunitoSans.variable} ${openSans.variable} ${sourceSans.variable} ${raleway.variable} ${devanagari.variable}`}>
        {children}
      </body>
    </html>
  );
}
