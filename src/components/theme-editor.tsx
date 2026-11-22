"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Palette, Trash2, Upload } from "lucide-react";
import { themeSchema, type InviteTheme } from "@/lib/invite-schema";
import { themeFontOptions, themePresets } from "@/lib/themes";

const sectionOptions = ["hero", "blessing", "date", "countdown", "events", "gallery", "rsvp", "share", "footer"] as const;

const tokenLabels: Record<keyof InviteTheme["tokens"], string> = {
  bg: "Background",
  paper: "Card paper",
  primary: "Primary",
  primaryContrast: "Primary text",
  accent1: "Gold light",
  accent2: "Gold deep",
  ink: "Main text",
  muted: "Muted text",
  border: "Border",
  heartScratch1: "Scratch light",
  heartScratch2: "Scratch deep",
  overlay: "Photo overlay",
};

function rgb(hex: string) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
}

function luminance(hex: string) {
  const [r, g, b] = rgb(hex);
  return .2126 * r + .7152 * g + .0722 * b;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function hslToHex(h: number, s: number, l: number) {
  const hue = ((h % 360) + 360) % 360 / 360;
  const saturation = Math.max(0, Math.min(1, s));
  const lightness = Math.max(0, Math.min(1, l));
  const channel = (n: number) => {
    const k = (n + hue * 12) % 12;
    const a = saturation * Math.min(lightness, 1 - lightness);
    return lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return `#${toHex(channel(0) * 255)}${toHex(channel(8) * 255)}${toHex(channel(4) * 255)}`;
}

function hexToHsl(hex: string) {
  const [r, g, b] = hex.slice(1).match(/.{2}/g)!.map((value) => Number.parseInt(value, 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
  }
  return { h, s: max === 0 ? 0 : delta / (1 - Math.abs(2 * (max + min) / 2 - 1)) };
}

function autoPalette(primary: string, current: InviteTheme) {
  const { h, s } = hexToHsl(primary);
  const bg = hslToHex(h, Math.min(s * .14, .16), .965);
  const paper = hslToHex(h, Math.min(s * .08, .09), .99);
  const black = "#201b19";
  const white = "#ffffff";
  const text = contrast(black, bg) >= 4.5 ? black : white;
  const primaryContrast = contrast(white, primary) >= contrast(black, primary) ? white : black;
  return {
    ...current,
    id: "custom",
    name: "Custom palette",
    tokens: {
      ...current.tokens,
      bg,
      paper,
      primary,
      primaryContrast,
      accent1: hslToHex(h + 38, Math.min(s * .56 + .2, .75), .72),
      accent2: hslToHex(h + 36, Math.min(s * .68 + .17, .82), .44),
      ink: text,
      muted: hslToHex(h, Math.min(s * .22, .16), .37),
      border: hslToHex(h, Math.min(s * .2, .2), .86),
      heartScratch1: primary,
      heartScratch2: hslToHex(h, Math.min(s + .12, .9), .28),
      overlay: "#291b20",
    },
  };
}

async function extractPalette(source: string) {
  if (!source) throw new Error("Add a cover photo first.");
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = source;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 44;
  canvas.height = 44;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Color sampling is not available in this browser.");
  context.drawImage(image, 0, 0, 44, 44);
  const pixels = context.getImageData(0, 0, 44, 44).data;
  const buckets = new Map<string, { count: number; channels: number[] }>();
  for (let index = 0; index < pixels.length; index += 16) {
    const channels = [pixels[index], pixels[index + 1], pixels[index + 2]];
    const max = Math.max(...channels);
    const min = Math.min(...channels);
    if (max < 32 || min > 242) continue;
    const key = channels.map((value) => Math.round(value / 32)).join("-");
    const bucket = buckets.get(key) ?? { count: 0, channels: [0, 0, 0] };
    bucket.count++;
    bucket.channels = bucket.channels.map((value, channel) => value + channels[channel]);
    buckets.set(key, bucket);
  }
  return [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, 5).map((bucket) => `#${bucket.channels.map((value) => toHex(value / bucket.count)).join("")}`);
}

type TokenName = keyof InviteTheme["tokens"];

function ColorTokenControl({ name, label, value, onChange }: { name: TokenName; label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    if (/^#[\da-fA-F]{6}$/.test(draft)) onChange(draft);
    else setDraft(value);
  };
  return (
    <div className="color-token">
      <input id={`color-${name}`} type="color" value={value} onChange={(event) => { setDraft(event.target.value); onChange(event.target.value); }} aria-label={`${label} color`} />
      <div><label htmlFor={`hex-${name}`}>{label}</label><input id={`hex-${name}`} className="hex-input" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} aria-label={`${label} hex value`} spellCheck={false} /></div>
    </div>
  );
}

function SectionBackgroundControl({ section, value, fallback, onChange }: { section: typeof sectionOptions[number]; value: string; fallback: string; onChange: (value?: string) => void }) {
  const color = /^#[\da-fA-F]{6}$/.test(value);
  const [draft, setDraft] = useState(color ? "" : value);
  useEffect(() => setDraft(/^#[\da-fA-F]{6}$/.test(value) ? "" : value), [value]);
  const commit = () => {
    const next = draft.trim();
    if (!next) {
      if (!color) onChange(undefined);
      return;
    }
    if (next.startsWith("/") && !next.startsWith("//") || /^https?:\/\//i.test(next) || /^data:image\/(jpeg|png|webp);base64,/i.test(next)) onChange(next);
    else setDraft(color ? "" : value);
  };
  return (
    <div className="field full">
      <label htmlFor={`section-bg-${section}`}>{section[0].toUpperCase() + section.slice(1)} background</label>
      <div className="section-bg-controls">
        <input type="color" aria-label={`${section} background color`} value={color ? value : fallback} onChange={(event) => { setDraft(""); onChange(event.target.value); }} />
        <input id={`section-bg-${section}`} type="text" value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} placeholder="Or paste an image URL" aria-label={`${section} background image URL`} />
      </div>
    </div>
  );
}

export function ThemeEditor({ theme, coverPhoto, onChange }: { theme: InviteTheme; coverPhoto: string; onChange: (theme: InviteTheme) => void }) {
  const [saved, setSaved] = useState<InviteTheme[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [palette, setPalette] = useState<string[]>([]);
  const [paletteMessage, setPaletteMessage] = useState("");
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("wedding-invite-templates") || "[]") as InviteTheme[];
      setSaved(parsed);
    } catch {
      setSaved([]);
    }
  }, []);

  const persistSaved = (next: InviteTheme[]) => {
    setSaved(next);
    localStorage.setItem("wedding-invite-templates", JSON.stringify(next));
  };

  const updateToken = (key: keyof InviteTheme["tokens"], value: string) => onChange({ ...theme, id: "custom", name: "Custom palette", tokens: { ...theme.tokens, [key]: value } });
  const checks = [
    { label: "Main text / background", ratio: contrast(theme.tokens.ink, theme.tokens.bg) },
    { label: "Muted text / background", ratio: contrast(theme.tokens.muted, theme.tokens.bg) },
    { label: "Button text / primary", ratio: contrast(theme.tokens.primaryContrast, theme.tokens.primary) },
  ];
  const contrastFailed = checks.some((item) => item.ratio < 4.5);

  const saveTemplate = () => {
    const name = templateName.trim();
    if (!name) return;
    const next = [...saved, { ...theme, id: `custom-${crypto.randomUUID()}`, name }];
    persistSaved(next);
    setTemplateName("");
  };

  const exportTemplates = () => {
    const file = new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "wedding-invite-templates.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importTemplates = async (file?: File) => {
    if (!file) return;
    try {
      const value = JSON.parse(await file.text());
      if (!Array.isArray(value)) throw new Error("Expected a template array.");
      const incoming = value.map((item) => themeSchema.safeParse(item)).filter((result) => result.success).map((result) => result.data);
      const next = [...saved, ...incoming.map((item) => ({ ...item, id: `custom-${crypto.randomUUID()}` }))];
      persistSaved(next);
      setImportMessage(`${incoming.length} template${incoming.length === 1 ? "" : "s"} imported.`);
    } catch {
      setImportMessage("That file is not a valid template export.");
    }
  };

  const applyPhotoPalette = async () => {
    setPaletteMessage("");
    try {
      setPalette(await extractPalette(coverPhoto));
    } catch (error) {
      setPaletteMessage(error instanceof Error ? error.message : "Could not read the cover photo.");
    }
  };

  return (
    <div>
      <p className="field-label">Color templates</p>
      <div className="theme-grid" style={{ marginTop: 9 }}>
        {themePresets.map((preset) => <button type="button" key={preset.id} className={`theme-swatch-card${theme.id === preset.id ? " active" : ""}`} onClick={() => onChange(preset)}>
          <div className="swatch-strip">{[preset.tokens.bg, preset.tokens.paper, preset.tokens.primary, preset.tokens.accent1, preset.tokens.accent2].map((color) => <i key={color} style={{ background: color }} />)}</div><span>{preset.name}</span>
        </button>)}
      </div>
      <div className="inline-actions">
        <label className="button-secondary" style={{ cursor: "pointer" }}><Upload size={13} />Import JSON<input type="file" accept="application/json,.json" hidden onChange={(event) => void importTemplates(event.target.files?.[0])} /></label>
        <button className="button-secondary" type="button" onClick={exportTemplates} disabled={!saved.length}><Download size={13} />Export saved</button>
      </div>
      {importMessage && <p role="status" className="notice">{importMessage}</p>}

      {saved.length > 0 && <div style={{ marginTop: 13 }}><p className="field-label">Your templates</p>{saved.map((item, index) => <div key={item.id} className="contact-row" style={{ gridTemplateColumns: "1fr auto auto" }}>
        <button className="theme-swatch-card" type="button" style={{ padding: "7px 9px" }} onClick={() => onChange(item)}>{item.name}</button>
        <button type="button" className="icon-button" aria-label={`Duplicate ${item.name}`} onClick={() => persistSaved([...saved, { ...item, id: `custom-${crypto.randomUUID()}`, name: `${item.name} copy` }])}><Copy size={14} /></button>
        <button type="button" className="icon-button" aria-label={`Delete ${item.name}`} onClick={() => persistSaved(saved.filter((_, savedIndex) => savedIndex !== index))}><Trash2 size={14} /></button>
      </div>)}</div>}
      <div className="field-grid" style={{ marginTop: 13 }}>
        <div className="field"><label htmlFor="template-name">Save as my template</label><input id="template-name" value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Name this palette" /></div>
        <div className="field" style={{ justifyContent: "flex-end" }}><button className="button-secondary" type="button" onClick={saveTemplate} disabled={!templateName.trim()}>Save template</button></div>
      </div>

      <div className="field-grid" style={{ marginTop: 16 }}>
        <div className="field"><label htmlFor="auto-primary">Auto palette · choose primary</label><input id="auto-primary" type="color" value={theme.tokens.primary} onChange={(event) => onChange(autoPalette(event.target.value, theme))} /></div>
        <div className="field" style={{ justifyContent: "flex-end" }}><button type="button" className="button-secondary" onClick={() => onChange(autoPalette(theme.tokens.primary, theme))}><Palette size={14} />Derive palette</button></div>
      </div>
      <div className={`notice${contrastFailed ? "" : " success"}`} role="status">
        {contrastFailed ? "Contrast needs attention. Adjust the marked tokens for WCAG AA (4.5:1) text contrast." : "Text contrast meets WCAG AA for the sampled combinations."}
      </div>
      {contrastFailed && <p style={{ color: "#8a5342", fontSize: 9, lineHeight: 1.4 }}>{checks.filter((item) => item.ratio < 4.5).map((item) => `${item.label}: ${item.ratio.toFixed(1)}:1`).join(" · ")}</p>}

      <div className="inline-actions"><button type="button" className="button-secondary" onClick={applyPhotoPalette}><Palette size={14} />Pick color from cover photo</button></div>
      {paletteMessage && <p role="status" className="notice">{paletteMessage}</p>}
      {palette.length > 0 && <div className="inline-actions">{palette.map((color) => <button key={color} type="button" aria-label={`Apply photo palette color ${color}`} onClick={() => onChange(autoPalette(color, theme))} style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid white", background: color, boxShadow: "0 0 0 1px #d8cbbf", cursor: "pointer" }} />)}</div>}

      <p className="field-label" style={{ marginTop: 17 }}>Custom colors</p>
      <div className="token-grid">{(Object.keys(tokenLabels) as TokenName[]).map((key) => <ColorTokenControl key={key} name={key} label={tokenLabels[key]} value={theme.tokens[key]} onChange={(value) => updateToken(key, value)} />)}</div>

      <div className="field-grid" style={{ marginTop: 15 }}>
        {(Object.keys(themeFontOptions) as (keyof typeof themeFontOptions)[]).map((group) => <div className="field" key={group}><label htmlFor={`font-${group}`}>{group} font</label><select id={`font-${group}`} value={theme.fonts[group]} onChange={(event) => onChange({ ...theme, fonts: { ...theme.fonts, [group]: event.target.value } })}>{themeFontOptions[group].map((font) => <option key={font.id} value={font.id}>{font.name}</option>)}</select></div>)}
        <div className="field"><label>Script size · {theme.scriptSize}px</label><input type="range" min="36" max="88" value={theme.scriptSize} onChange={(event) => onChange({ ...theme, scriptSize: Number(event.target.value) })} /></div>
        <div className="field"><label>Card radius · {theme.radius}px</label><input type="range" min="8" max="40" value={theme.radius} onChange={(event) => onChange({ ...theme, radius: Number(event.target.value) })} /></div>
        <div className="field"><label htmlFor="frame-style">Event frame</label><select id="frame-style" value={theme.frame} onChange={(event) => onChange({ ...theme, frame: event.target.value as InviteTheme["frame"] })}>{["arch", "rounded", "square", "scalloped"].map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></div>
        <div className="field"><label htmlFor="background-style">Background</label><select id="background-style" value={theme.bgStyle} onChange={(event) => onChange({ ...theme, bgStyle: event.target.value as InviteTheme["bgStyle"] })}><option value="grain">Paper grain</option><option value="plain">Plain</option><option value="gradient">Gradient</option><option value="pattern">Pattern</option></select></div>
        <div className="field"><label>Pattern opacity · {Math.round(theme.textureOpacity * 100)}%</label><input type="range" min="0" max="0.5" step="0.01" value={theme.textureOpacity} onChange={(event) => onChange({ ...theme, textureOpacity: Number(event.target.value) })} /></div>
        <div className="field"><label htmlFor="ornaments">Ornaments</label><select id="ornaments" value={theme.ornaments} onChange={(event) => onChange({ ...theme, ornaments: event.target.value as InviteTheme["ornaments"] })}>{["floral", "peacock", "minimal", "none"].map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></div>
        <div className="field full"><label htmlFor="section-background">Section background override</label><select id="section-background" value="" onChange={(event) => { const key = event.target.value as typeof sectionOptions[number]; if (!key) return; const next = { ...theme.sectionBackgrounds }; if (next[key]) delete next[key]; else next[key] = theme.tokens.paper; onChange({ ...theme, sectionBackgrounds: next }); }}><option value="">Toggle a section override…</option>{sectionOptions.map((section) => <option key={section} value={section}>{section[0].toUpperCase() + section.slice(1)}{theme.sectionBackgrounds[section] ? " · enabled" : ""}</option>)}</select></div>
        {(Object.entries(theme.sectionBackgrounds) as [typeof sectionOptions[number], string][]).map(([section, value]) => <SectionBackgroundControl key={section} section={section} value={value} fallback={theme.tokens.paper} onChange={(nextValue) => { const sectionBackgrounds = { ...theme.sectionBackgrounds }; if (nextValue) sectionBackgrounds[section] = nextValue; else delete sectionBackgrounds[section]; onChange({ ...theme, sectionBackgrounds }); }} />)}
        <label className="check-row"><input type="checkbox" checked={theme.butterflies} onChange={(event) => onChange({ ...theme, butterflies: event.target.checked })} />Floating butterflies</label>
        <label className="check-row"><input type="checkbox" checked={theme.darkMode} onChange={(event) => onChange({ ...theme, darkMode: event.target.checked })} />Dark / light invite</label>
      </div>
      <div className="inline-actions"><button type="button" className="button-secondary" onClick={() => onChange(themePresets[0])}>Reset to Rajasthani Rose</button><button type="button" className="button-secondary" onClick={() => onChange(themePresets.find((preset) => preset.id === theme.id) ?? themePresets[0])}>Reset to current preset</button></div>
    </div>
  );
}
