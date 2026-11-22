import type { CSSProperties, ReactNode } from "react";
import type { InviteTheme } from "@/lib/invite-schema";
import { fontVariableById } from "@/lib/themes";

export function ThemeProvider({ theme, children }: { theme: InviteTheme; children: ReactNode }) {
  const tokens = theme.darkMode
    ? { ...theme.tokens, bg: "#1B1630", paper: "#28213E", ink: "#F5EDE6", muted: "#C4B7C1", border: "#4B405D" }
    : theme.tokens;
  const variables = {
    "--bg": tokens.bg,
    "--paper": tokens.paper,
    "--primary": tokens.primary,
    "--primary-contrast": tokens.primaryContrast,
    "--accent-1": tokens.accent1,
    "--accent-2": tokens.accent2,
    "--ink": tokens.ink,
    "--muted": tokens.muted,
    "--border": tokens.border,
    "--heart-scratch-1": tokens.heartScratch1,
    "--heart-scratch-2": tokens.heartScratch2,
    "--overlay": tokens.overlay,
    "--card-radius": `${theme.radius}px`,
    "--script-size": `${theme.scriptSize}px`,
    "--font-heading": `var(${fontVariableById[theme.fonts.heading] ?? "--font-cormorant"})`,
    "--font-script": `var(${fontVariableById[theme.fonts.script] ?? "--font-great-vibes"})`,
    "--font-body": `var(${fontVariableById[theme.fonts.body] ?? "--font-montserrat"})`,
    "--texture-opacity": `${theme.textureOpacity * 100}%`,
  } as CSSProperties;

  return (
    <div
      className={`invite-root bg-${theme.bgStyle}${theme.darkMode ? " dark-mode" : ""}`}
      style={variables}
      data-ornaments={theme.ornaments}
    >
      {children}
    </div>
  );
}
