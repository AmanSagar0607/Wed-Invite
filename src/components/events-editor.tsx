"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { InviteEvent } from "@/lib/invite-schema";
import { MediaUpload } from "@/components/media-upload";

const blankEvent = (): InviteEvent => ({ id: crypto.randomUUID(), title: "New celebration", dateLabel: "", calendarDate: "", time: "", venue: "", city: "", dressCode: "", mapsUrl: "", imageUrl: "" });

export function EventsEditor({ events, onChange }: { events: InviteEvent[]; onChange: (events: InviteEvent[]) => void }) {
  const update = (index: number, patch: Partial<InviteEvent>) => onChange(events.map((event, itemIndex) => itemIndex === index ? { ...event, ...patch } : event));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...events];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      {events.map((event, index) => <article className="event-editor-card" key={event.id}>
        <div className="event-editor-header"><span>{event.title || `Celebration ${index + 1}`}</span><div className="event-editor-actions"><button type="button" aria-label={`Move ${event.title} up`} onClick={() => move(index, -1)} disabled={index === 0}><ChevronUp size={15} /></button><button type="button" aria-label={`Move ${event.title} down`} onClick={() => move(index, 1)} disabled={index === events.length - 1}><ChevronDown size={15} /></button><button type="button" aria-label={`Remove ${event.title}`} onClick={() => onChange(events.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={14} /></button></div></div>
        <div className="field-grid">
          <div className="field"><label htmlFor={`event-title-${event.id}`}>Event name</label><input id={`event-title-${event.id}`} maxLength={80} value={event.title} onChange={(item) => update(index, { title: item.target.value })} /></div>
          <div className="field"><label htmlFor={`event-date-${event.id}`}>Date label</label><input id={`event-date-${event.id}`} value={event.dateLabel} onChange={(item) => update(index, { dateLabel: item.target.value })} placeholder="Friday, 1 January" /></div>
          <div className="field"><label htmlFor={`event-calendar-${event.id}`}>Calendar date</label><input id={`event-calendar-${event.id}`} type="date" value={event.calendarDate} onChange={(item) => update(index, { calendarDate: item.target.value })} /></div>
          <div className="field"><label htmlFor={`event-time-${event.id}`}>Time</label><input id={`event-time-${event.id}`} value={event.time} onChange={(item) => update(index, { time: item.target.value })} placeholder="7:00 PM onwards" /></div>
          <div className="field"><label htmlFor={`event-venue-${event.id}`}>Venue</label><input id={`event-venue-${event.id}`} value={event.venue} onChange={(item) => update(index, { venue: item.target.value })} /></div>
          <div className="field"><label htmlFor={`event-city-${event.id}`}>City / address</label><input id={`event-city-${event.id}`} value={event.city} onChange={(item) => update(index, { city: item.target.value })} /></div>
          <div className="field"><label htmlFor={`event-dress-${event.id}`}>Dress code</label><input id={`event-dress-${event.id}`} value={event.dressCode} onChange={(item) => update(index, { dressCode: item.target.value })} /></div>
          <div className="field"><label htmlFor={`event-maps-${event.id}`}>Google Maps link</label><input id={`event-maps-${event.id}`} type="url" value={event.mapsUrl} onChange={(item) => update(index, { mapsUrl: item.target.value })} placeholder="https://maps.google.com/…" /></div>
          <MediaUpload label="Event photo" value={event.imageUrl} onChange={(url) => update(index, { imageUrl: url })} />
        </div>
      </article>)}
      <button type="button" className="button-secondary" onClick={() => onChange([...events, blankEvent()])} disabled={events.length >= 12}>+ Add celebration</button>
      {events.length >= 12 && <p className="notice">You can add up to 12 celebrations.</p>}
    </div>
  );
}
