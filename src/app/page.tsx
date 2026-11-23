import Link from "next/link";
import { ArrowRight, Cake, Heart, Sparkles } from "lucide-react";
import { eventTypes } from "@/lib/event-types";

const icons = { rings: Heart, sparkles: Sparkles, cake: Cake };

export default function HomePage() {
  return (
    <main className="studio-home">
      <header className="studio-home-header">
        <Link href="/" className="studio-home-brand"><span className="studio-home-mark">W</span> Wedding Invite Studio</Link>
        <Link className="studio-home-login" href="/templates">Explore designs <ArrowRight size={15} /></Link>
      </header>
      <section className="studio-home-hero" aria-labelledby="studio-title">
        <p className="studio-home-eyebrow">A little something for your big day</p>
        <h1 id="studio-title">Make the moment<br /><em>beautifully yours.</em></h1>
        <p className="studio-home-subtitle">Choose the celebration. We’ll help you make an invitation worth keeping.</p>
      </section>
      <section className="event-type-section" aria-label="Choose an event type">
        <div className="event-type-heading"><span>01 / YOUR CELEBRATION</span><p>What are we celebrating?</p></div>
        <div className="event-type-grid">
          {eventTypes.map((event) => {
            const Icon = icons[event.icon];
            const card = <><span className="event-type-icon"><Icon size={23} strokeWidth={1.5} /></span><span className="event-type-copy"><strong>{event.name}</strong><span>{event.description}</span></span><span className={`event-type-status ${event.availability}`}>{event.availability === "live" ? "Create now" : "Coming soon"}</span>{event.availability === "live" && <ArrowRight className="event-type-arrow" size={18} />}</>;
            return event.availability === "live" ? <Link className="event-type-card is-live" key={event.id} href="/templates" aria-label="Wedding invitation templates">{card}</Link> : <div className="event-type-card is-soon" key={event.id} aria-disabled="true">{card}</div>;
          })}
        </div>
      </section>
      <footer className="studio-home-footer"><span>Thoughtfully made for the days you’ll remember.</span><Link href="/templates">Browse wedding templates <ArrowRight size={14} /></Link></footer>
    </main>
  );
}
