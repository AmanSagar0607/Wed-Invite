import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import type { InviteEvent, InviteTheme } from "@/lib/invite-schema";

function calendarFile(event: InviteEvent) {
  const date = event.calendarDate ? new Date(`${event.calendarDate}T19:00:00.000Z`) : new Date("2027-01-01T19:00:00.000Z");
  const end = new Date(date.getTime() + 90 * 60_000);
  const stamp = (value: Date) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const details = `${event.venue}${event.city ? `, ${event.city}` : ""}${event.dressCode ? `\\nDress: ${event.dressCode}` : ""}`;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invite Studio//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@wedding-invite.studio`,
    `DTSTAMP:${stamp(date)}`,
    `DTSTART:${stamp(date)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${details}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(content)}`;
}

export function EventCard({ event, theme }: { event: InviteEvent; theme: InviteTheme }) {
  const eventImage = event.imageUrl || (theme.id === "rajasthani-rose" ? "/wedding/palace-vignette-v2.webp" : "");

  return (
    <article className={`event-card frame-${theme.frame} motion-reveal`}>
      <p className="event-date-label">{event.dateLabel || "A day to remember"}</p>
      <h3>{event.title}</h3>
      {event.time && <p className="event-time">{event.time}</p>}
      <p className="event-meta">
        {event.venue && <><strong>{event.venue}</strong><br /></>}
        {event.city && <>{event.city}<br /></>}
        {event.dressCode && <>Dress: {event.dressCode}</>}
      </p>
      <div className="event-actions">
        {event.mapsUrl && <a className="round-link" href={event.mapsUrl} target="_blank" rel="noreferrer" aria-label={`Open map for ${event.title}`}><MapPin size={17} /></a>}
        <a className="round-link" href={calendarFile(event)} download={`${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`} aria-label={`Add ${event.title} to calendar`}><CalendarDays size={16} /></a>
      </div>
      {eventImage && <div className="event-photo-frame"><Image className="event-photo" src={eventImage} alt={event.imageUrl ? `${event.title} celebration` : `${event.title} palace illustration`} width={1376} height={768} sizes="(max-width: 640px) calc(100vw - 64px), (max-width: 1000px) 42vw, 320px" quality={70} unoptimized={Boolean(event.imageUrl)} loading="lazy" /></div>}
    </article>
  );
}
