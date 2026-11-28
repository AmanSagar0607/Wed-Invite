"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { ChevronDown, Copy, Feather, Flower2, Heart, Minus, Music2, Pause, Phone, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { InviteData } from "@/lib/invite-schema";
import { ThemeProvider } from "@/components/theme-provider";
import { Countdown } from "@/components/countdown";
import { EventCard } from "@/components/event-card";
import { GalleryCarousel } from "@/components/gallery-carousel";
import { RsvpForm } from "@/components/rsvp-form";
import { ScratchHeart } from "@/components/scratch-heart";
import { EnvelopeIntro } from "@/components/envelope-intro";
import { ElephantPair } from "@/components/elephant-pair";
import { LoveDivider } from "@/components/love-divider";
import { InviteMotionLayer } from "@/components/wedding-atmosphere";

function backgroundValue(value: string) {
  if (/^#[\da-fA-F]{6}$/.test(value)) return value;
  const escaped = encodeURI(value).replace(/[\"'()\\\\]/g, (character) => encodeURIComponent(character));
  return `url("${escaped}") center / cover no-repeat`;
}

function formatWeddingDate(date: string) {
  if (!date) return "The date is almost here";
  const value = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return date;
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(value);
}

function HeroArtwork({ invite }: { invite: InviteData }) {
  const sampleInvitationFilm = invite.heroVideo === "/wedding.mp4";
  const heroVideo = sampleInvitationFilm ? "" : invite.heroVideo;
  const illustratedTheme = invite.theme.id === "rajasthani-rose";

  if (heroVideo) {
    return <div className="hero-artwork"><video src={heroVideo} poster={invite.heroImage || undefined} autoPlay muted loop playsInline aria-label={`${invite.couple.bride} and ${invite.couple.groom} wedding film`} /></div>;
  }
  if (invite.heroImage) {
    return <div className="hero-artwork"><Image src={invite.heroImage} alt={`${invite.couple.bride} and ${invite.couple.groom} wedding photo`} fill sizes="(max-width: 760px) 92vw, 780px" priority unoptimized /></div>;
  }
  if (!illustratedTheme) return null;

  return (
    <div className="hero-artwork hero-arch-art" data-parallax="arch" aria-hidden="true">
      <Image src="/wedding/hero-arch-v2.webp" alt="" width={1264} height={848} sizes="(max-width: 760px) 96vw, 840px" priority />
      <span className="hero-lantern hero-lantern-left" aria-hidden="true"><i /></span>
      <span className="hero-lantern hero-lantern-right" aria-hidden="true"><i /></span>
    </div>
  );
}

function Hero({ invite, onStartMusic }: { invite: InviteData; onStartMusic: () => void }) {
  const hasMedia = Boolean(invite.heroImage || invite.heroVideo);
  return (
    <section className={`invite-hero${hasMedia ? " has-media" : ""}`} id="hero" tabIndex={-1}>
      <HeroArtwork invite={invite} />
      <div className="hero-content">
        <p className="hero-overline">A journey to forever</p>
        <h1 className="hero-couple" aria-label={`${invite.couple.bride} and ${invite.couple.groom}`}>
          <span className="script-name">{invite.couple.bride}</span>
          <span className="couple-heart" aria-hidden="true"><Heart size={16} fill="currentColor" strokeWidth={1.6} /></span>
          <span className="script-name">{invite.couple.groom}</span>
        </h1>
        <p className="hero-tagline">{invite.couple.tagline}</p>
        <p className="hero-date">{formatWeddingDate(invite.weddingDate)} · {invite.events.find((event) => event.title.toLowerCase().includes("wedding"))?.venue || "Together with our families"}</p>
        <a className="continue-link" href="#blessing" onClick={(event) => { event.stopPropagation(); onStartMusic(); }}>
          <span>Continue</span><ChevronDown size={16} />
        </a>
      </div>
    </section>
  );
}

function OrnamentDivider({ invite }: { invite: InviteData }) {
  const ornament = invite.theme.ornaments === "floral"
    ? <Flower2 size={18} strokeWidth={1.4} />
    : invite.theme.ornaments === "peacock"
      ? <Feather size={18} strokeWidth={1.4} />
      : invite.theme.ornaments === "minimal"
        ? <Minus size={16} strokeWidth={1.4} />
        : null;
  return <div className={`gold-divider ornament-${invite.theme.ornaments}`} aria-hidden="true">{ornament}</div>;
}

function Blessing({ invite }: { invite: InviteData }) {
  return (
    <section className="invite-section" id="blessing">
      <div className="invite-content narrow motion-reveal">
        <p className="invite-eyebrow">With divine blessings</p>
        <h2 className="invite-heading devanagari blessing-heading">ॐ श्री गणेशाय नमः</h2>
        <p className="invite-copy">{invite.wording.blessing}</p>
        <OrnamentDivider invite={invite} />
        <p className="invite-eyebrow">{invite.wording.hostHeading}</p>
        <div className="family-stack">
          <div className="family-name"><strong>{invite.couple.bride}</strong><span>{invite.couple.brideFamily}</span></div>
          <LoveDivider />
          <div className="family-name"><strong>{invite.couple.groom}</strong><span>{invite.couple.groomFamily}</span></div>
        </div>
        <p className="invite-copy">{invite.wording.invitation}</p>
      </div>
    </section>
  );
}

function SaveTheDate({ invite }: { invite: InviteData }) {
  const date = invite.weddingDate ? new Date(`${invite.weddingDate}T00:00:00Z`) : null;
  const [revealedHearts, setRevealedHearts] = useState<string[]>([]);
  const handleHeartReveal = useCallback((label: string) => {
    setRevealedHearts((current) => current.includes(label) ? current : [...current, label]);
  }, []);
  const values = date && !Number.isNaN(date.getTime())
    ? [String(date.getUTCDate()).padStart(2, "0"), date.toLocaleDateString("en", { month: "short", timeZone: "UTC" }), String(date.getUTCFullYear())]
    : ["—", "—", "—"];
  const day = date?.getUTCDate();
  const ordinal = day ? `${day}${day % 100 >= 11 && day % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][day % 10] || "th"}` : "";
  const fullDate = date && !Number.isNaN(date.getTime())
    ? `${ordinal} ${date.toLocaleDateString("en", { month: "long", timeZone: "UTC" })} ${date.getUTCFullYear()}`
    : "Our special day";
  const labels = ["Day", "Month", "Year"] as const;
  const allRevealed = labels.every((label) => revealedHearts.includes(label));

  return (
    <section className="invite-section" id="date">
      <div className="invite-content motion-reveal">
        <p className="invite-eyebrow">A moment worth remembering</p>
        <h2 className="invite-heading">Save the date</h2>
        <OrnamentDivider invite={invite} />
        <div className="date-wreath">
          <div className="date-hearts">
            {labels.map((label, index) => <ScratchHeart key={label} label={label} value={values[index]} first={invite.theme.tokens.heartScratch1} second={invite.theme.tokens.heartScratch2} storageKey={invite.weddingDate} onReveal={() => handleHeartReveal(label)} />)}
          </div>
          <p className="scratch-hint" aria-live="polite">{allRevealed ? fullDate : "Scratch each heart to reveal our special day"}</p>
        </div>
        <p className="sr-only">Wedding date: {fullDate}</p>
      </div>
    </section>
  );
}

function ShareCard({ invite }: { invite: InviteData }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => setShareUrl(window.location.href), []);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  const cleanNumber = invite.whatsappNumber.replace(/\D/g, "");
  return (
    <section className="invite-section" id="share">
      <div className="invite-content narrow">
        <p className="invite-eyebrow">Save a little space in your camera roll</p>
        <h2 className="invite-heading">Celebrate with us</h2>
        <div className="share-card">
          <p className="share-hashtag">{invite.hashtag}</p>
          <div className="share-actions">
            <button className="share-action" type="button" onClick={copyLink}><Copy size={15} />{copied ? "Link copied" : "Copy invitation link"}</button>
            <button className="share-action share-action-primary" type="button" onClick={() => setModalOpen(true)}><Share2 size={15} />Send invite</button>
          </div>
          <p className="share-preview"><strong>{invite.couple.bride} &amp; {invite.couple.groom}</strong><span>{invite.couple.tagline}</span><small>{shareUrl || "Your live invitation link"}</small></p>
          {invite.contacts.length > 0 && <div className="contact-list">{invite.contacts.filter((contact) => contact.phone).map((contact, index) => {
            const number = contact.phone.replace(/\D/g, "");
            return <span className="contact-link" key={`${contact.name}-${index}`}><span>{contact.name}</span><a className="contact-link" href={`tel:${contact.phone}`} aria-label={`Call ${contact.name}`}><Phone size={14} /></a><a className="contact-link" href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${contact.name}`}><Share2 size={14} /></a></span>;
          })}</div>}
          {cleanNumber && <a className="share-action" href={`https://wa.me/${cleanNumber}`} target="_blank" rel="noreferrer" style={{ marginTop: 16, textDecoration: "none" }}>Get in touch on WhatsApp</a>}
        </div>
      </div>
      {modalOpen && <div className="share-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
        <div className="share-modal" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
          <button className="share-modal-close" type="button" onClick={() => setModalOpen(false)} aria-label="Close share invitation popup">×</button>
          <p className="invite-eyebrow">Share the celebration</p>
          <h3 id="share-modal-title">Send this invitation</h3>
          <p className="share-modal-preview"><strong>{invite.couple.bride} &amp; {invite.couple.groom}</strong><span>{invite.couple.tagline}</span><small>{shareUrl || "Loading invitation link…"}</small></p>
          {shareUrl && <QRCodeSVG value={shareUrl} size={164} level="Q" title="QR code for this invitation" />}
          <div className="share-modal-actions">
            <button className="share-action share-action-primary" type="button" onClick={() => {
              if (navigator.share) void navigator.share({ title: `${invite.couple.bride} & ${invite.couple.groom}`, text: invite.couple.tagline, url: shareUrl });
              else void copyLink();
            }}><Share2 size={15} />Share now</button>
            <button className="share-action" type="button" onClick={copyLink}><Copy size={15} />{copied ? "Link copied" : "Copy link"}</button>
          </div>
        </div>
      </div>}
    </section>
  );
}

function InviteFooter({ invite }: { invite: InviteData }) {
  const initials = `${invite.couple.bride.trim().charAt(0)}${invite.couple.groom.trim().charAt(0)}`;
  return (
    <footer className="invite-footer" id="footer">
      <div className="footer-monogram" aria-label={`Monogram ${initials}`}>{initials}</div>
      <p className="footer-blessing">Your presence is our greatest blessing</p>
      <p className="footer-names">{invite.couple.bride} &amp; {invite.couple.groom}</p>
      <p className="invite-eyebrow" style={{ marginTop: 15 }}>{formatWeddingDate(invite.weddingDate)}</p>
      <p className="footer-credit">Created with ❤️ by Aman Sagar</p>
    </footer>
  );
}

export function InviteRenderer({ invite, compact = false }: { invite: InviteData; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicTimerRef = useRef<number | null>(null);
  const [musicOn, setMusicOn] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const [introDismissed, setIntroDismissed] = useState(false);
  const hasMusic = Boolean(invite.musicUrl);

  const toggleMusic = () => {
    if (!hasMusic) return;
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      if (musicTimerRef.current) window.clearTimeout(musicTimerRef.current);
      setMusicOn(false);
    } else {
      audio.currentTime = 0;
      void audio.play().then(() => {
        setMusicOn(true);
        setMusicStarted(true);
        musicTimerRef.current = window.setTimeout(() => {
          audio.pause();
          setMusicOn(false);
        }, 20_000);
      }).catch(() => setMusicOn(false));
    }
  };

  useEffect(() => () => {
    if (musicTimerRef.current) window.clearTimeout(musicTimerRef.current);
  }, []);

  useEffect(() => {
    if (!compact && introDismissed) document.getElementById("hero")?.focus();
  }, [compact, introDismissed]);

  const sections: Record<string, ReactNode> = {
    hero: <Hero invite={invite} onStartMusic={() => { if (!musicStarted) toggleMusic(); }} />,
    blessing: <Blessing invite={invite} />,
    date: <SaveTheDate invite={invite} />,
    countdown: <section className="invite-section" id="countdown"><div className="invite-content motion-reveal"><div className="countdown-frame"><p className="invite-eyebrow">The days are getting closer</p><h2 className="invite-heading">Counting down to forever</h2><Countdown date={invite.weddingDate} />{invite.theme.id === "rajasthani-rose" && <ElephantPair />}</div></div></section>,
    events: <section className="invite-section" id="events"><div className="invite-content motion-reveal"><p className="invite-eyebrow">The celebration</p><h2 className="invite-heading">Join us for every moment</h2><p className="invite-copy">We would love to celebrate each part of this beautiful beginning with you.</p><div className="events-grid">{invite.events.filter((event, index, all) => all.findIndex((item) => item.id === event.id) === index).map((event, index) => <EventCard key={`${event.id}-${index}`} event={event} theme={invite.theme} />)}</div></div></section>,
    gallery: <section className="invite-section" id="gallery"><div className="invite-content motion-reveal"><p className="invite-eyebrow">Little moments, big memories</p><h2 className="invite-heading">Our moments</h2><div style={{ marginTop: 28 }}><GalleryCarousel images={invite.gallery} coupleName={`${invite.couple.bride} & ${invite.couple.groom}`} /></div></div></section>,
    rsvp: <section className="invite-section" id="rsvp"><div className="invite-content narrow"><p className="invite-eyebrow">Kindly reply</p><h2 className="invite-heading">Will you join us?</h2><p className="invite-copy">Your reply helps us make the day special for everyone.</p><RsvpForm invite={invite} /></div></section>,
    share: <ShareCard invite={invite} />,
    footer: <InviteFooter invite={invite} />,
  };

  return (
    <ThemeProvider theme={invite.theme}>
      <InviteMotionLayer butterflies={invite.theme.butterflies} />
      {!compact && !introDismissed && <EnvelopeIntro invite={invite} onOpen={toggleMusic} onComplete={() => setIntroDismissed(true)} />}
      <div className="invite-sections" aria-hidden={!compact && !introDismissed} inert={!compact && !introDismissed}>
        {Array.from(new Set(invite.sectionOrder)).filter((id) => invite.sections[id] !== false && sections[id]).map((id) => <div key={id} style={invite.theme.sectionBackgrounds[id] ? { "--section-bg": backgroundValue(invite.theme.sectionBackgrounds[id]) } as CSSProperties : undefined}>{sections[id]}</div>)}
      </div>
      {hasMusic && <><audio ref={audioRef} src={invite.musicUrl} preload="metadata" onEnded={() => setMusicOn(false)} /><button className="music-toggle" onClick={toggleMusic} type="button" aria-label={musicOn ? "Pause wedding music" : "Play wedding music"}>{musicOn ? <Pause size={18} /> : <Music2 size={18} />}</button></>}
      {compact && <span className="sr-only">Live invitation preview</span>}
    </ThemeProvider>
  );
}
