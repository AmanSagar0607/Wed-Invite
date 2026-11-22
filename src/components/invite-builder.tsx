"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Heart,
  ImageIcon,
  Palette,
  PartyPopper,
  Save,
  Sparkles,
  Upload,
  UsersRound,
} from "lucide-react";
import { publishInvite } from "@/app/actions/invites";
import { AudioUpload } from "@/components/audio-upload";
import { EventsEditor } from "@/components/events-editor";
import { GalleryEditor } from "@/components/gallery-editor";
import { InviteRenderer } from "@/components/invite-renderer";
import { MediaUpload } from "@/components/media-upload";
import { ThemeEditor } from "@/components/theme-editor";
import { inviteSchema, type InviteData } from "@/lib/invite-schema";
import { sampleInvite } from "@/lib/sample-invite";
import { getThemeById } from "@/lib/themes";

type InputType = "text" | "date" | "url" | "tel";

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: InputType;
  placeholder?: string;
  maxLength?: number;
};

function TextField({ id, label, value, onChange, type = "text", placeholder, maxLength }: TextFieldProps) {
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function TextAreaField({ id, label, value, onChange, placeholder, maxLength }: Omit<TextFieldProps, "type">) {
  return <div className="field full"><label htmlFor={id}>{label}</label><textarea id={id} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></div>;
}

function Accordion({ title, icon, open, onToggle, children }: { title: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return <section className="editor-section"><button className="accordion-trigger" type="button" aria-expanded={open} onClick={onToggle}><span className="accordion-label"><span className="accordion-icon">{icon}</span>{title}</span>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>{open && <div className="accordion-body">{children}</div>}</section>;
}

const sectionNames: Record<string, string> = {
  hero: "Cover",
  blessing: "Blessing & family",
  date: "Scratch the date",
  countdown: "Countdown",
  events: "Events",
  gallery: "Photo gallery",
  rsvp: "RSVP form",
  share: "Share & contact",
  footer: "Closing note",
};

function initialData(themeId?: string): InviteData {
  return themeId ? { ...sampleInvite, theme: getThemeById(themeId) } : sampleInvite;
}

export function InviteBuilder({ initialThemeId }: { initialThemeId?: string }) {
  const importRef = useRef<HTMLInputElement>(null);
  const [invite, setInvite] = useState<InviteData>(() => initialData(initialThemeId));
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ couple: true, words: false, date: false, events: false, gallery: false, theme: false, order: false, contacts: false });
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Preparing your draft…");
  const [publishError, setPublishError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("wedding-invite-draft");
      if (saved) {
        const parsed = inviteSchema.parse(JSON.parse(saved));
        setInvite(initialThemeId ? { ...parsed, theme: getThemeById(initialThemeId) } : parsed);
      } else if (initialThemeId) {
        setInvite(initialData(initialThemeId));
      }
    } catch {
      localStorage.removeItem("wedding-invite-draft");
      if (initialThemeId) setInvite(initialData(initialThemeId));
    }
    setHydrated(true);
  }, [initialThemeId]);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus("Saving draft…");
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem("wedding-invite-draft", JSON.stringify(invite));
        setSaveStatus("Draft saved in this browser");
      } catch {
        setSaveStatus("Draft is too large for browser storage; upload photos to R2");
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [hydrated, invite]);

  const togglePanel = (key: string) => setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  const updateCouple = (key: keyof InviteData["couple"], value: string) => setInvite((current) => ({ ...current, couple: { ...current.couple, [key]: value } }));
  const updateWording = (key: keyof InviteData["wording"], value: string) => setInvite((current) => ({ ...current, wording: { ...current.wording, [key]: value } }));
  const updateTop = <Key extends keyof InviteData>(key: Key, value: InviteData[Key]) => setInvite((current) => ({ ...current, [key]: value }));

  const exportDraft = () => {
    const file = new Blob([JSON.stringify(invite, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invite.couple.bride}-${invite.couple.groom}-invitation.json`.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDraft = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = inviteSchema.parse(JSON.parse(await file.text()));
      setInvite(parsed);
      setPublishedUrl("");
      setPublishError("");
      setSaveStatus("Imported draft · saving locally…");
    } catch {
      setPublishError("That file is not a valid Wedding Invite Studio draft.");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  };

  const resetDraft = () => {
    if (!window.confirm("Start a fresh invitation? Your current saved draft will be replaced.")) return;
    setInvite(initialData());
    setPublishedUrl("");
    setPublishError("");
  };

  const handlePublish = async () => {
    setPublishError("");
    setPublishing(true);
    try {
      const result = await publishInvite(invite);
      if (!result.ok) {
        setPublishError(result.error);
        return;
      }
      const url = `${window.location.origin}/i/${result.slug}`;
      setPublishedUrl(url);
      setSaveStatus("Invitation published");
    } catch {
      setPublishError("We could not publish this invitation. Your local draft is safe to keep editing.");
    } finally {
      setPublishing(false);
    }
  };

  const copyPublishedLink = async () => {
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const reorderSection = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= invite.sectionOrder.length || to >= invite.sectionOrder.length) return;
    const next = [...invite.sectionOrder];
    const [section] = next.splice(from, 1);
    next.splice(to, 0, section);
    updateTop("sectionOrder", next);
  };

  const moveSection = (index: number, direction: -1 | 1) => reorderSection(index, index + direction);

  const addContact = () => updateTop("contacts", [...invite.contacts, { name: "", phone: "" }]);

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <Link href="/create" className="brand" style={{ color: "inherit", textDecoration: "none" }}><span className="brand-mark">W</span><span>Wedding Invite Studio</span></Link>
        <div className="header-actions">
          <Link href="/templates" className="text-link">Explore templates</Link>
          <button className="header-button" type="button" onClick={handlePublish} disabled={publishing}><Save size={14} />{publishing ? "Publishing…" : "Publish invite"}</button>
        </div>
      </header>

      <div className="mobile-tabs" role="tablist" aria-label="Editor and preview">
        <button type="button" role="tab" aria-selected={mode === "edit"} className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>Edit invitation</button>
        <button type="button" role="tab" aria-selected={mode === "preview"} className={mode === "preview" ? "active" : ""} onClick={() => setMode("preview")}>Live preview</button>
      </div>

      <div className={`editor-layout${mode === "preview" ? " show-preview" : ""}`}>
        <aside className="editor-panel" aria-label="Invitation editor">
          <div className="editor-intro">
            <p className="eyebrow">Your celebration, your story</p>
            <h1>Make it yours</h1>
            <p>Every change appears in the live invitation. Your working draft stays in this browser until you publish it.</p>
            <div className="draft-status" role="status" style={{ marginTop: 10 }}><span className="status-dot" />{saveStatus}</div>
          </div>

          <div className="editor-toolbar">
            <button className="button-secondary" type="button" onClick={exportDraft}><Download size={14} />Export JSON</button>
            <button className="button-secondary" type="button" onClick={() => importRef.current?.click()}><Upload size={14} />Import JSON</button>
            <button className="button-secondary" type="button" onClick={resetDraft}>New invitation</button>
            <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(event) => void importDraft(event.target.files?.[0])} />
          </div>

          {publishedUrl && <div className="notice success"><strong>Your invitation is live.</strong><div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8 }}><a href={publishedUrl} target="_blank" rel="noreferrer" style={{ color: "inherit", fontSize: 10, overflowWrap: "anywhere" }}>{publishedUrl}</a><button type="button" className="icon-button" aria-label="Copy invitation link" onClick={copyPublishedLink}><Save size={14} /></button></div>{copied && <span> Link copied</span>}</div>}
          {publishError && <div className="notice" role="alert">{publishError}</div>}

          <Accordion title="The couple" icon={<Heart size={15} />} open={openSections.couple} onToggle={() => togglePanel("couple")}>
            <div className="field-grid">
              <TextField id="bride-name" label="Bride's name" value={invite.couple.bride} onChange={(value) => updateCouple("bride", value)} maxLength={80} />
              <TextField id="groom-name" label="Groom's name" value={invite.couple.groom} onChange={(value) => updateCouple("groom", value)} maxLength={80} />
              <TextField id="bride-family" label="Bride's family line" value={invite.couple.brideFamily} onChange={(value) => updateCouple("brideFamily", value)} maxLength={160} />
              <TextField id="groom-family" label="Groom's family line" value={invite.couple.groomFamily} onChange={(value) => updateCouple("groomFamily", value)} maxLength={160} />
              <TextField id="tagline" label="Short tagline" value={invite.couple.tagline} onChange={(value) => updateCouple("tagline", value)} maxLength={180} />
            </div>
          </Accordion>

          <Accordion title="Blessings & wording" icon={<FileText size={15} />} open={openSections.words} onToggle={() => togglePanel("words")}>
            <div className="field-grid">
              <TextField id="host-heading" label="Family heading" value={invite.wording.hostHeading} onChange={(value) => updateWording("hostHeading", value)} maxLength={120} />
              <TextAreaField id="blessing" label="Blessing and invitation" value={invite.wording.blessing} onChange={(value) => updateWording("blessing", value)} maxLength={600} />
              <TextAreaField id="invitation-wording" label="Invitation message" value={invite.wording.invitation} onChange={(value) => updateWording("invitation", value)} maxLength={500} />
            </div>
          </Accordion>

          <Accordion title="Date, cover & music" icon={<CalendarDays size={15} />} open={openSections.date} onToggle={() => togglePanel("date")}>
            <div className="field-grid">
              <TextField id="wedding-date" label="Wedding date" type="date" value={invite.weddingDate} onChange={(value) => updateTop("weddingDate", value)} />
              <TextField id="invite-hashtag" label="Celebration hashtag" value={invite.hashtag} onChange={(value) => updateTop("hashtag", value)} maxLength={80} />
              <TextField id="whatsapp-number" label="Host WhatsApp number" type="tel" value={invite.whatsappNumber} onChange={(value) => updateTop("whatsappNumber", value)} placeholder="Country code + number" maxLength={24} />
              <TextField id="hero-video" label="Hero video URL" value={invite.heroVideo} onChange={(value) => updateTop("heroVideo", value)} placeholder="/short-ambient-clip.mp4 or a video URL" maxLength={500} />
              <TextField id="music-url" label="Music URL (MP3)" value={invite.musicUrl} onChange={(value) => updateTop("musicUrl", value)} placeholder="Paste a licensed audio URL" maxLength={500} />
              <AudioUpload value={invite.musicUrl} onChange={(value) => updateTop("musicUrl", value)} />
              <div className="field full"><span className="field-label">Hero video guidance</span><p style={{ margin: 0, color: "#88776d", fontSize: 9, lineHeight: 1.5 }}>{invite.heroVideo === "/wedding.mp4" ? "The supplied sample is a complete invitation film, so it is not layered beneath the live sections. Add a short, text-free ambient clip instead." : "Use a short, text-free ambient clip so the invitation details remain clear."}</p>{invite.heroVideo && <div className="inline-actions" style={{ marginTop: 0 }}><button className="button-secondary" type="button" onClick={() => updateTop("heroVideo", "")}>Remove video</button></div>}</div>
              <MediaUpload label="Cover photo" value={invite.heroImage} onChange={(value) => updateTop("heroImage", value)} />
              <p className="field full" style={{ color: "#88776d", fontSize: 9, lineHeight: 1.5 }}>Photo uploads are compressed in your browser and stored privately in R2. They are served through this app only when used in a published invite.</p>
            </div>
          </Accordion>

          <Accordion title="Celebration events" icon={<PartyPopper size={15} />} open={openSections.events} onToggle={() => togglePanel("events")}>
            <EventsEditor events={invite.events} onChange={(events) => updateTop("events", events)} />
          </Accordion>

          <Accordion title="Photo gallery" icon={<ImageIcon size={15} />} open={openSections.gallery} onToggle={() => togglePanel("gallery")}>
            <GalleryEditor images={invite.gallery} onChange={(images) => updateTop("gallery", images)} />
          </Accordion>

          <Accordion title="Design & color studio" icon={<Palette size={15} />} open={openSections.theme} onToggle={() => togglePanel("theme")}>
            <ThemeEditor theme={invite.theme} coverPhoto={invite.heroImage} onChange={(theme) => updateTop("theme", theme)} />
          </Accordion>

          <Accordion title="Sections & order" icon={<Sparkles size={15} />} open={openSections.order} onToggle={() => togglePanel("order")}>
            <p style={{ margin: "0 0 12px", color: "#8c7c72", fontSize: 10 }}>Drag sections to reorder, or use the arrow buttons. The preview updates as you go.</p>
            {invite.sectionOrder.map((section, index) => <div key={section} className="contact-row section-sort-row" draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(index)); event.dataTransfer.effectAllowed = "move"; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData("text/plain")); if (Number.isInteger(from)) reorderSection(from, index); }} style={{ gridTemplateColumns: "1fr auto auto" }}>
              <label className="check-row" style={{ margin: 0 }}><input type="checkbox" checked={invite.sections[section] !== false} onChange={(event) => updateTop("sections", { ...invite.sections, [section]: event.target.checked })} />{sectionNames[section] || section}</label>
              <button className="icon-button" type="button" aria-label={`Move ${sectionNames[section]} up`} disabled={index === 0} onClick={() => moveSection(index, -1)}><ChevronUp size={14} /></button>
              <button className="icon-button" type="button" aria-label={`Move ${sectionNames[section]} down`} disabled={index === invite.sectionOrder.length - 1} onClick={() => moveSection(index, 1)}><ChevronDown size={14} /></button>
            </div>)}
          </Accordion>

          <Accordion title="Family contacts" icon={<UsersRound size={15} />} open={openSections.contacts} onToggle={() => togglePanel("contacts")}>
            <p style={{ marginTop: 0, color: "#8c7c72", fontSize: 10, lineHeight: 1.5 }}>These details appear on the public invitation. Add only numbers you want guests to contact.</p>
            {invite.contacts.map((contact, index) => <div className="contact-row" key={index}>
              <input aria-label={`Contact ${index + 1} name`} value={contact.name} onChange={(event) => updateTop("contacts", invite.contacts.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="Name" maxLength={80} />
              <input aria-label={`Contact ${index + 1} phone`} value={contact.phone} onChange={(event) => updateTop("contacts", invite.contacts.map((item, itemIndex) => itemIndex === index ? { ...item, phone: event.target.value } : item))} placeholder="Phone" type="tel" maxLength={24} />
              <button className="icon-button" type="button" aria-label={`Remove contact ${index + 1}`} onClick={() => updateTop("contacts", invite.contacts.filter((_, itemIndex) => itemIndex !== index))}>×</button>
            </div>)}
            <button className="button-secondary" type="button" onClick={addContact} disabled={invite.contacts.length >= 8}>+ Add family contact</button>
          </Accordion>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 20 }}>
            <Link href="/templates" className="button-secondary" style={{ textDecoration: "none" }}>Browse templates</Link>
            <button className="button-primary" type="button" onClick={handlePublish} disabled={publishing}><Save size={14} />{publishing ? "Publishing…" : "Publish invitation"}</button>
          </div>
        </aside>

        <section className="preview-panel" aria-label="Live invitation preview">
          <div className="preview-heading"><span>Live preview</span><div style={{ display: "flex", gap: 7 }}><button className={`button-secondary${previewDevice === "mobile" ? " active" : ""}`} type="button" onClick={() => setPreviewDevice("mobile")} style={previewDevice === "mobile" ? { borderColor: "#9b1b4b", color: "#9b1b4b" } : undefined}>Mobile</button><button className={`button-secondary${previewDevice === "desktop" ? " active" : ""}`} type="button" onClick={() => setPreviewDevice("desktop")} style={previewDevice === "desktop" ? { borderColor: "#9b1b4b", color: "#9b1b4b" } : undefined}>Desktop</button></div></div>
          <div className={`phone-frame${previewDevice === "desktop" ? " desktop-view" : ""}`}>
            <div className="phone-screen"><InviteRenderer invite={invite} compact /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
