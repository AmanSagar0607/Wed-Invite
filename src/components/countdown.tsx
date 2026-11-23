"use client";

import { useEffect, useState } from "react";
type Remaining = { days: number; hours: number; minutes: number; seconds: number; started: boolean };
function getRemaining(targetDate: string, now = Date.now()): Remaining {
  const target = new Date(`${targetDate}T00:00:00Z`).getTime();
  if (Number.isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: false };
  const delta = target - now;
  if (delta <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta % 86_400_000) / 3_600_000),
    minutes: Math.floor((delta % 3_600_000) / 60_000),
    seconds: Math.floor((delta % 60_000) / 1_000),
    started: false,
  };
}

export function Countdown({ date, initialNow }: { date: string; initialNow?: number }) {
  const [remaining, setRemaining] = useState<Remaining | null>(() => initialNow === undefined ? null : getRemaining(date, initialNow));

  useEffect(() => {
    const update = () => setRemaining(getRemaining(date));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [date]);

  if (remaining?.started) return <p className="countdown-complete" role="status">The celebration is underway. Wishing you a lifetime of happiness.</p>;
  return (
    <div className="countdown-grid" role="timer" aria-label="Countdown to the wedding" aria-live="off">
      {(["Days", "Hours", "Minutes", "Seconds"] as const).map((label) => (
        <div className="countdown-unit" key={label}>
          <strong className="tabular-nums">{remaining ? String(remaining[label.toLowerCase() as "days" | "hours" | "minutes" | "seconds"]).padStart(2, "0") : "—"}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
