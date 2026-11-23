import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { fontVariableById, themePresets } from "@/lib/themes";
import { templateTierById } from "@/lib/event-types";

export const metadata = { title: "Wedding invitation templates", description: "Choose a celebration palette and start a personalized wedding invitation." };

export default function TemplatesPage() {
  return (
    <main className="template-page">
      <div className="template-topbar"><Link href="/" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><ArrowLeft size={15} />All celebrations</Link><div className="template-page-title"><span>THE WEDDING COLLECTION</span><h1>Find your feeling</h1><p>Eight considered palettes, ready to make your own.</p></div><span className="eyebrow" style={{ margin: 0 }}>{themePresets.length} curated looks</span></div>
      {themePresets.length > 0 && <div className="template-grid">
        {themePresets.map((theme) => {
          const tier = templateTierById[theme.id] ?? "Premium";
          return <article className="template-card" key={theme.id}>
          <div className="template-preview" style={{ background: `linear-gradient(145deg,${theme.tokens.bg},${theme.tokens.paper})`, color: theme.tokens.ink }}>
            <span className={`template-tier ${tier.toLowerCase()}`}>{tier === "Premium" && <Sparkles size={11} />}{tier}</span>
            <div>
              <small style={{ color: theme.tokens.primary }}>A JOURNEY TO FOREVER</small>
              <strong style={{ color: theme.tokens.primary, fontFamily: `var(${fontVariableById[theme.fonts.script]})` }}>Ritisha &amp; Samyak</strong>
              <span style={{ color: theme.tokens.muted }}>03 January 2027</span>
              <div className="template-preview-rule" style={{ background: theme.tokens.accent2 }} />
            </div>
          </div>
          <div className="template-card-foot"><strong>{theme.name}</strong><Link href={`/create?theme=${encodeURIComponent(theme.id)}`} aria-label={`Use ${theme.name} ${tier.toLowerCase()} template`}>Use this look <ArrowUpRight size={13} /></Link></div>
        </article>;
        })}
      </div>}
    </main>
  );
}
