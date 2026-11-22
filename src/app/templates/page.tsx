import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { fontVariableById, themePresets } from "@/lib/themes";

export const metadata = { title: "Wedding invitation templates", description: "Choose a celebration palette and start a personalized wedding invitation." };

export default function TemplatesPage() {
  return (
    <main className="template-page">
      <div className="template-topbar"><Link href="/create" className="text-link" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><ArrowLeft size={15} />Back to editor</Link><h1>Find your feeling</h1><span className="eyebrow" style={{ margin: 0 }}>8 curated palettes</span></div>
      <div className="template-grid">
        {themePresets.map((theme) => <article className="template-card" key={theme.id}>
          <div className="template-preview" style={{ background: `linear-gradient(145deg,${theme.tokens.bg},${theme.tokens.paper})`, color: theme.tokens.ink }}>
            <div>
              <small style={{ color: theme.tokens.primary }}>A JOURNEY TO FOREVER</small>
              <strong style={{ color: theme.tokens.primary, fontFamily: `var(${fontVariableById[theme.fonts.script]})` }}>Ritisha &amp; Samyak</strong>
              <span style={{ color: theme.tokens.muted }}>03 January 2027</span>
              <div style={{ width: 55, height: 1, margin: "13px auto 0", background: theme.tokens.accent2 }} />
            </div>
          </div>
          <div className="template-card-foot"><strong>{theme.name}</strong><Link href={`/create?theme=${theme.id}`}>Use this look <ArrowUpRight size={13} style={{ marginLeft: 5 }} /></Link></div>
        </article>)}
      </div>
    </main>
  );
}
