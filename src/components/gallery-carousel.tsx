"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function GalleryCarousel({ images, coupleName }: { images: string[]; coupleName: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox]);

  const moveTo = (index: number) => {
    const next = (index + images.length) % images.length;
    setActive(next);
    const track = trackRef.current;
    const card = track?.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  if (!images.length) {
    return <div className="share-card"><p className="invite-copy">A gallery of your favorite moments will be right here.</p></div>;
  }

  return (
    <>
      <div className="gallery-track" ref={trackRef} onScroll={(event) => {
        const track = event.currentTarget;
        const child = track.children[0] as HTMLElement | undefined;
        if (!child) return;
        const gap = Number.parseFloat(getComputedStyle(track).columnGap || "15");
        const next = Math.round(track.scrollLeft / (child.offsetWidth + gap));
        setActive(Math.max(0, Math.min(images.length - 1, next)));
      }}>
        {images.map((image, index) => (
          <button className="gallery-image-button" key={`${image}-${index}`} type="button" onClick={() => setLightbox(image)} aria-label={`View moment ${index + 1} of ${images.length}`}>
            <Image className="gallery-image" src={image} alt={`${coupleName} — celebration moment ${index + 1}`} width={900} height={1200} unoptimized loading="lazy" sizes="(max-width: 640px) 82vw, (max-width: 1000px) 45vw, 620px" />
          </button>
        ))}
      </div>
      <div className="gallery-controls" aria-label="Gallery navigation">
        <button className="gallery-arrow" type="button" onClick={() => moveTo(active - 1)} aria-label="Previous photo"><ChevronLeft size={18} /></button>
        <div className="gallery-dots">
          {images.map((_, index) => <button key={index} className={`gallery-dot${active === index ? " active" : ""}`} type="button" aria-label={`Go to photo ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => moveTo(index)} />)}
        </div>
        <button className="gallery-arrow" type="button" onClick={() => moveTo(active + 1)} aria-label="Next photo"><ChevronRight size={18} /></button>
      </div>
      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setLightbox(null)}>
          <button type="button" aria-label="Close photo viewer" onClick={() => setLightbox(null)}><X size={20} /></button>
          <Image className="lightbox-image" src={lightbox} alt={`${coupleName} celebration`} width={1800} height={1400} unoptimized onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </>
  );
}
