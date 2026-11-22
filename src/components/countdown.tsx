"use client";

import { useEffect, useState } from "react";

function getRemaining(targetDate: string) {
  const target = new Date(`${targetDate}T00:00:00`).getTime();
  if (Number.isNaN(target)) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const delta = Math.max(0, target - Date.now());
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta % 86_400_000) / 3_600_000),
    minutes: Math.floor((delta % 3_600_000) / 60_000),
    seconds: Math.floor((delta % 60_000) / 1_000),
  };
}

export function Countdown({ date }: { date: string }) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => setRemaining(getRemaining(date));
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [date]);

  return (
    <div className="countdown-grid" role="timer" aria-label="Countdown to the wedding" aria-live="off">
      {[
        ["Days", remaining.days],
        ["Hours", remaining.hours],
        ["Minutes", remaining.minutes],
        ["Seconds", remaining.seconds],
      ].map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <strong key={value}>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
