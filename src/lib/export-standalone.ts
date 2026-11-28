import type { InviteData } from "@/lib/invite-schema";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function imageMarkup(src: string, alt: string, className: string) {
  return src ? `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">` : "";
}

export function createStandaloneInviteHtml(invite: InviteData) {
  const names = `${invite.couple.bride} & ${invite.couple.groom}`;
  const events = invite.events.map((event) => `
    <article class="event-card">
      ${imageMarkup(event.imageUrl, `${event.title} celebration`, "event-image")}
      <p class="eyebrow">${escapeHtml(event.dateLabel)}</p>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.time)}</p>
      <p>${escapeHtml([event.venue, event.city].filter(Boolean).join(" · "))}</p>
      ${event.mapsUrl ? `<a href="${escapeHtml(event.mapsUrl)}" target="_blank" rel="noreferrer">View map</a>` : ""}
    </article>`).join("");
  const gallery = invite.gallery.map((image, index) => imageMarkup(image, `Wedding memory ${index + 1}`, "gallery-image")).join("");
  const targetDate = JSON.stringify(`${invite.weddingDate}T00:00:00`).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="${escapeHtml(invite.theme.tokens.bg)}">
  <title>${escapeHtml(names)} — Wedding invitation</title>
  <style>
    *{box-sizing:border-box}body{margin:0;color:${escapeHtml(invite.theme.tokens.ink)};background:${escapeHtml(invite.theme.tokens.bg)};font-family:Georgia,serif}main{max-width:900px;margin:auto;padding:24px}.hero,.section{margin:0 auto 22px;padding:clamp(28px,7vw,64px);border:1px solid ${escapeHtml(invite.theme.tokens.accent2)};border-radius:28px;background:${escapeHtml(invite.theme.tokens.paper)};text-align:center}.hero-image{display:block;width:min(100%,720px);max-height:48vh;margin:0 auto 24px;object-fit:contain;border-radius:18px}.eyebrow{color:${escapeHtml(invite.theme.tokens.muted)};font:700 10px/1.7 Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase}.names{margin:10px 0;color:${escapeHtml(invite.theme.tokens.primary)};font-size:clamp(46px,11vw,92px);font-style:italic;line-height:1}.copy{max-width:620px;margin:16px auto;font-size:18px;line-height:1.7}.families,.countdown,.events,.gallery{display:grid;gap:14px}.families{grid-template-columns:repeat(2,minmax(0,1fr))}.family{padding:20px;border:1px solid ${escapeHtml(invite.theme.tokens.border)};border-radius:18px}.family strong{display:block;color:${escapeHtml(invite.theme.tokens.primary)};font-size:26px}.countdown{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:28px}.countdown div{padding:16px 6px;border:1px solid ${escapeHtml(invite.theme.tokens.border)};border-radius:14px;font-variant-numeric:tabular-nums}.countdown strong{display:block;color:${escapeHtml(invite.theme.tokens.primary)};font-size:clamp(21px,5vw,38px)}.countdown span{font:700 9px Arial,sans-serif;letter-spacing:.1em}.events{grid-template-columns:repeat(auto-fit,minmax(210px,1fr));margin-top:20px}.event-card{padding:20px;border:1px solid ${escapeHtml(invite.theme.tokens.border)};border-radius:18px}.event-card h3{color:${escapeHtml(invite.theme.tokens.primary)}}.event-image{width:100%;aspect-ratio:1.7;object-fit:contain}.gallery{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}.gallery-image{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px}.footer{padding:22px;text-align:center;color:${escapeHtml(invite.theme.tokens.muted)}}a{color:${escapeHtml(invite.theme.tokens.primary)}}@media(max-width:420px){main{padding:12px}.families{grid-template-columns:1fr}.countdown{gap:6px}.countdown div{padding:13px 3px}.countdown span{font-size:8px}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      ${imageMarkup(invite.heroImage, `${names} wedding portrait`, "hero-image")}
      <p class="eyebrow">A journey to forever</p>
      <h1 class="names">${escapeHtml(invite.couple.bride)}<br>&amp;<br>${escapeHtml(invite.couple.groom)}</h1>
      <p class="copy">${escapeHtml(invite.couple.tagline)}</p>
      <p class="eyebrow">${escapeHtml(invite.weddingDate)}${invite.events[0]?.venue ? ` · ${escapeHtml(invite.events[0].venue)}` : ""}</p>
    </section>
    ${invite.sections.blessing !== false ? `<section class="section"><p class="eyebrow">With divine blessings</p><h2>ॐ श्री गणेशाय नमः</h2><p class="copy">${escapeHtml(invite.wording.blessing)}</p><div class="families"><div class="family"><strong>${escapeHtml(invite.couple.bride)}</strong>${escapeHtml(invite.couple.brideFamily)}</div><div class="family"><strong>${escapeHtml(invite.couple.groom)}</strong>${escapeHtml(invite.couple.groomFamily)}</div></div><p class="copy">${escapeHtml(invite.wording.invitation)}</p></section>` : ""}
    ${invite.sections.countdown !== false ? `<section class="section"><p class="eyebrow">The days are getting closer</p><h2>Counting down to forever</h2><div class="countdown" role="timer"><div><strong data-unit="days">00</strong><span>Days</span></div><div><strong data-unit="hours">00</strong><span>Hours</span></div><div><strong data-unit="minutes">00</strong><span>Minutes</span></div><div><strong data-unit="seconds">00</strong><span>Seconds</span></div></div></section>` : ""}
    ${invite.sections.events !== false && events ? `<section class="section"><p class="eyebrow">The celebration</p><h2>Join us for every moment</h2><div class="events">${events}</div></section>` : ""}
    ${invite.sections.gallery !== false && gallery ? `<section class="section"><p class="eyebrow">Little moments, big memories</p><h2>Our moments</h2><div class="gallery">${gallery}</div></section>` : ""}
    <footer class="footer">Made with love for ${escapeHtml(names)}<br><small>Created with ❤️ by Aman Sagar</small></footer>
  </main>
  <script>
    const target = new Date(${targetDate}).getTime();
    function updateCountdown(){const left=Math.max(0,target-Date.now());const values={days:Math.floor(left/86400000),hours:Math.floor(left%86400000/3600000),minutes:Math.floor(left%3600000/60000),seconds:Math.floor(left%60000/1000)};for(const [unit,value] of Object.entries(values)){const node=document.querySelector('[data-unit="'+unit+'"]');if(node)node.textContent=String(value).padStart(2,'0')}}
    updateCountdown();setInterval(updateCountdown,1000);
  </script>
</body>
</html>`;
}
