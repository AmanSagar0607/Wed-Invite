import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout loads fonts globally. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Allura&family=Bodoni+Moda:wght@400;500;600;700&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Dancing+Script:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=Great+Vibes&family=Italianno&family=Lato:wght@400;700&family=Libre+Baskerville:wght@400;700&family=Lora:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Nunito+Sans:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Parisienne&family=Petit+Formal+Script&family=Playfair+Display:wght@400;500;600;700&family=Prata&family=Raleway:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Tangerine:wght@400;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
