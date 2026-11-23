"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { InviteData } from "@/lib/invite-schema";
const countryCodes = [
  { code: "+91", label: "India (+91)" }, { code: "+1", label: "United States (+1)" },
  { code: "+44", label: "United Kingdom (+44)" }, { code: "+61", label: "Australia (+61)" },
  { code: "+971", label: "United Arab Emirates (+971)" }, { code: "+65", label: "Singapore (+65)" },
  { code: "+64", label: "New Zealand (+64)" }, { code: "+49", label: "Germany (+49)" },
  { code: "+33", label: "France (+33)" }, { code: "+81", label: "Japan (+81)" },
];
function ChoiceChip({ label, checked, onChange, type = "checkbox", mixed = false, name }: {
  label: string; checked: boolean; onChange: (checked: boolean) => void;
  type?: "checkbox" | "radio"; mixed?: boolean; name?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (inputRef.current) inputRef.current.indeterminate = mixed; }, [mixed]);
  return <label className={`choice-chip${checked || mixed ? " selected" : ""}`}>
    <input ref={inputRef} type={type} name={name} checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span className="choice-chip-control" aria-hidden="true">{checked && !mixed ? "✓" : mixed ? "−" : ""}</span>
    <span>{label}</span>
  </label>;
}
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
  const eligibleIds = invite.events.map((event) => event.id);
  const selectedCount = eligibleIds.filter((id) => selectedEvents.includes(id)).length;
  const allSelected = eligibleIds.length > 0 && selectedCount === eligibleIds.length;
  const partlySelected = selectedCount > 0 && !allSelected;
  const total = adults + children;
  const eventNames = useMemo(() => allSelected ? "All functions" : invite.events.filter((event) => selectedEvents.includes(event.id)).map((event) => event.title).join(", ") || "Not specified", [allSelected, invite.events, selectedEvents]);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const recipient = invite.whatsappNumber.replace(/\D/g, "");
    if (!recipient) { setFeedback("The hosts can add a WhatsApp number in the invitation editor."); return; }
    const text = [`Wedding RSVP — ${invite.couple.bride} & ${invite.couple.groom}`, `Name: ${name}`, `Phone: ${countryCode} ${phone}`, `Response: ${attendance}`, `Functions: ${eventNames}`, `Guests: ${adults} adult${adults === 1 ? "" : "s"}, ${children} child${children === 1 ? "" : "ren"} (${total} total)`, message ? `Message: ${message}` : ""].filter(Boolean).join("\n");
    window.open(`https://wa.me/${recipient}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setFeedback("Your RSVP is ready to send in WhatsApp.");
  };
  const toggleEvent = (id: string, checked: boolean) => setSelectedEvents((current) => checked ? [...new Set([...current, id])] : current.filter((value) => value !== id));
  const setAllEvents = (checked: boolean) => setSelectedEvents(checked ? eligibleIds : []);
  return (
    <form className="rsvp-card" onSubmit={submit}>
      <div className="rsvp-grid">
        <div className="rsvp-field"><label htmlFor="rsvp-name">Your name</label><input id="rsvp-name" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" /></div>
        <div className="rsvp-field"><label htmlFor="rsvp-phone">Phone number</label><div className="phone-control"><input className="country-code-input" aria-label="Search country calling code" list="rsvp-country-codes" value={countryCode} onChange={(event) => setCountryCode(event.target.value)} /><datalist id="rsvp-country-codes">{countryCodes.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</datalist><input id="rsvp-phone" autoComplete="tel-national" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" /></div></div>
        <fieldset className="rsvp-field full"><legend>Will you join us?</legend><div className="choice-row">{[["Accept", "Joyfully accept"], ["Decline", "Regretfully decline"]].map(([value, label]) => <ChoiceChip key={value} name="attendance" type="radio" label={label} checked={attendance === value} onChange={() => setAttendance(value)} />)}</div></fieldset>
        {invite.events.length > 0 && <fieldset className="rsvp-field full"><legend>Functions</legend><div className="event-checks"><ChoiceChip label="All functions" checked={allSelected} mixed={partlySelected} onChange={setAllEvents} />{invite.events.map((item) => <ChoiceChip key={item.id} label={item.title} checked={selectedEvents.includes(item.id)} onChange={(checked) => toggleEvent(item.id, checked)} />)}</div></fieldset>}
        <div className="rsvp-field full"><span className="field-label">Guests</span><div className="stepper-row"><span>Adults</span><div className="stepper"><button type="button" aria-label="Remove adult" onClick={() => setAdults((value) => Math.max(0, value - 1))}>−</button><strong>{adults}</strong><button type="button" aria-label="Add adult" onClick={() => setAdults((value) => Math.min(20, value + 1))}>+</button></div></div><div className="stepper-row"><span>Children</span><div className="stepper"><button type="button" aria-label="Remove child" onClick={() => setChildren((value) => Math.max(0, value - 1))}>−</button><strong>{children}</strong><button type="button" aria-label="Add child" onClick={() => setChildren((value) => Math.min(20, value + 1))}>+</button></div></div><div className="total-attendees"><span>Total guests</span><strong>{total}</strong></div></div>
        <div className="rsvp-field full"><label htmlFor="rsvp-message">A note for the couple</label><textarea id="rsvp-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a little note" /></div>
      </div>
      <button className="rsvp-submit" type="submit">Send RSVP on WhatsApp</button>
      {feedback && <p className="invite-copy" role="status" style={{ fontSize: 13, marginBottom: 0 }}>{feedback}</p>}
    </form>
  );
}
