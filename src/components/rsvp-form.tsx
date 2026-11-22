"use client";

import { useMemo, useState } from "react";
import type { InviteData } from "@/lib/invite-schema";

const countryCodes = [
  { code: "+91", label: "India +91" },
  { code: "+1", label: "US +1" },
  { code: "+44", label: "UK +44" },
  { code: "+61", label: "Australia +61" },
  { code: "+971", label: "UAE +971" },
];

export function RsvpForm({ invite }: { invite: InviteData }) {
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [attendance, setAttendance] = useState("Accept");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const allSelected = invite.events.length > 0 && selectedEvents.length === invite.events.length;
  const total = adults + children;

  const eventNames = useMemo(() => {
    if (allSelected) return "All functions";
    return invite.events.filter((event) => selectedEvents.includes(event.id)).map((event) => event.title).join(", ") || "Not specified";
  }, [allSelected, invite.events, selectedEvents]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const recipient = invite.whatsappNumber.replace(/\D/g, "");
    if (!recipient) {
      setFeedback("The hosts can add a WhatsApp number in the invitation editor.");
      return;
    }
    const text = [
      `Wedding RSVP — ${invite.couple.bride} & ${invite.couple.groom}`,
      `Name: ${name}`,
      `Phone: ${countryCode} ${phone}`,
      `Response: ${attendance}`,
      `Functions: ${eventNames}`,
      `Guests: ${adults} adult${adults === 1 ? "" : "s"}, ${children} child${children === 1 ? "" : "ren"} (${total} total)`,
      message ? `Message: ${message}` : "",
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${recipient}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setFeedback("Your RSVP is ready to send in WhatsApp.");
  };

  const toggleEvent = (id: string) => setSelectedEvents((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const setAllEvents = (checked: boolean) => setSelectedEvents(checked ? invite.events.map((item) => item.id) : []);

  return (
    <form className="rsvp-card" onSubmit={submit}>
      <div className="rsvp-grid">
        <div className="rsvp-field"><label htmlFor="rsvp-name">Your name</label><input id="rsvp-name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></div>
        <div className="rsvp-field"><label htmlFor="rsvp-phone">Phone number</label><div className="phone-control"><select aria-label="Country calling code" value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>{countryCodes.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}</select><input id="rsvp-phone" autoComplete="tel-national" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" /></div></div>
        <div className="rsvp-field full"><label>Will you join us?</label><div className="choice-row">{["Accept", "Decline"].map((choice) => <label key={choice}><input type="radio" name="attendance" value={choice} checked={attendance === choice} onChange={() => setAttendance(choice)} />{choice === "Accept" ? "Joyfully accept" : "Regretfully decline"}</label>)}</div></div>
        <div className="rsvp-field full"><label>Functions</label><div className="event-checks"><label><input type="checkbox" checked={allSelected} onChange={(event) => setAllEvents(event.target.checked)} />All Functions</label>{invite.events.map((item) => <label key={item.id}><input type="checkbox" checked={selectedEvents.includes(item.id)} onChange={() => toggleEvent(item.id)} />{item.title}</label>)}</div></div>
        <div className="rsvp-field full"><label>Guests</label><div className="stepper-row"><span>Adults</span><div className="stepper"><button type="button" aria-label="Remove adult" onClick={() => setAdults((value) => Math.max(0, value - 1))}>−</button><strong>{adults}</strong><button type="button" aria-label="Add adult" onClick={() => setAdults((value) => Math.min(20, value + 1))}>+</button></div></div><div className="stepper-row"><span>Children</span><div className="stepper"><button type="button" aria-label="Remove child" onClick={() => setChildren((value) => Math.max(0, value - 1))}>−</button><strong>{children}</strong><button type="button" aria-label="Add child" onClick={() => setChildren((value) => Math.min(20, value + 1))}>+</button></div></div><div className="total-attendees"><span>Total guests</span><strong>{total}</strong></div></div>
        <div className="rsvp-field full"><label htmlFor="rsvp-message">A note for the couple</label><textarea id="rsvp-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a little note" /></div>
      </div>
      <button className="rsvp-submit" type="submit">Send RSVP on WhatsApp</button>
      {feedback && <p className="invite-copy" role="status" style={{ fontSize: 13, marginBottom: 0 }}>{feedback}</p>}
    </form>
  );
}
