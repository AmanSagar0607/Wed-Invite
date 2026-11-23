"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { InviteData } from "@/lib/invite-schema";

export function EnvelopeIntro({ invite, onOpen, onComplete }: { invite: InviteData; onOpen: () => void; onComplete: () => void }) {
  const [opening, setOpening] = useState(false);
  const sealRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    sealRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(onComplete, reducedMotion ? 180 : 1_600);
    return () => window.clearTimeout(timer);
  }, [opening, onComplete, reducedMotion]);

  const startOpening = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
  };

  return (
    <motion.section
      className="envelope-intro"
      role="dialog"
      aria-modal="true"
      aria-label={`Open the wedding invitation for ${invite.couple.bride} and ${invite.couple.groom}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: opening ? 0 : 1 }}
      transition={{ duration: reducedMotion ? 0.12 : 0.32, delay: opening && !reducedMotion ? 1.2 : 0 }}
    >
      <div className="envelope-stage">
        <div className="envelope-ambient" aria-hidden="true" />
        <p className="envelope-kicker">A little note, sealed with love</p>
        <div className="envelope-scene">
          <motion.div
            className="envelope-card"
            animate={opening ? { y: "-28vh", scale: 1.42, opacity: 1 } : { y: 20, scale: 0.94, opacity: 0.92 }}
            transition={reducedMotion ? { duration: 0.12 } : { duration: 0.8, delay: opening ? 0.54 : 0, type: "spring", stiffness: 90, damping: 16 }}
            aria-hidden="true"
          >
            <span className="envelope-card-overline">A journey to forever</span>
            <strong>{invite.couple.bride}<span aria-hidden="true">&amp;</span>{invite.couple.groom}</strong>
            <span className="envelope-card-date">{invite.weddingDate || "Our special day"}</span>
          </motion.div>
          <div className="envelope-back" aria-hidden="true" />
          <div className="envelope-pocket" aria-hidden="true" />
          <motion.div
            className="envelope-flap"
            aria-hidden="true"
            style={{ transformPerspective: 900 }}
            animate={{ rotateX: opening && !reducedMotion ? -180 : 0 }}
            transition={{ duration: reducedMotion ? 0.1 : 0.72, ease: [0.22, 0.72, 0.24, 1] }}
          >
            <svg viewBox="0 0 480 248" preserveAspectRatio="none">
              <defs>
                <pattern id="envelope-paisley" width="42" height="42" patternUnits="userSpaceOnUse">
                  <path d="M21 4c9 6 9 15 0 22-9-7-9-16 0-22Zm0 15c5 4 5 9 0 13-5-4-5-9 0-13Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="5" cy="5" r="1.2" fill="currentColor" />
                  <circle cx="37" cy="37" r="1.2" fill="currentColor" />
                </pattern>
              </defs>
              <path d="M8 4h464L240 236 8 4Z" fill="var(--paper)" stroke="var(--accent-2)" strokeWidth="2" />
              <path d="M8 4h464L240 236 8 4Z" fill="url(#envelope-paisley)" opacity=".35" />
            </svg>
          </motion.div>
          <motion.button
            ref={sealRef}
            className={`envelope-seal${opening ? " is-cracking" : ""}`}
            type="button"
            aria-label={`Open ${invite.couple.bride} and ${invite.couple.groom}'s invitation`}
            disabled={opening}
            onClick={startOpening}
            whileHover={opening || reducedMotion ? undefined : { scale: 1.06 }}
            whileTap={opening || reducedMotion ? undefined : { scale: 0.94 }}
            animate={opening ? { scale: 1.2, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ duration: reducedMotion ? 0.12 : 0.34 }}
          >
            <Heart size={24} fill="currentColor" strokeWidth={1.4} />
          </motion.button>
        </div>
        <p className="envelope-prompt">Tap the seal to open your invitation</p>
        <button className="envelope-skip" type="button" onClick={onComplete}>Skip intro</button>
      </div>
    </motion.section>
  );
}
