"use client";

import Image from "next/image";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { GalleryUploadButton } from "@/components/media-upload";

export function GalleryEditor({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const move = (index: number, direction: -1 | 1) => {
    const next = [...images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return (
    <div>
      <p style={{ marginTop: 0, color: "#8c7c72", fontSize: 10, lineHeight: 1.5 }}>Upload up to 24 photos. Drag a photo to reorder, or use the arrows for keyboard-friendly controls.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 9, marginBottom: 12 }}>
        {images.map((image, index) => <div key={`${image.slice(0, 32)}-${index}`} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
          event.preventDefault();
          const from = Number(event.dataTransfer.getData("text/plain"));
          if (!Number.isInteger(from) || from === index) return;
          const next = [...images];
          const [item] = next.splice(from, 1);
          next.splice(index, 0, item);
          onChange(next);
        }} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "#f0e7de", cursor: "grab" }}>
          <Image src={image} alt={`Gallery photo ${index + 1}`} width={180} height={180} unoptimized style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          <div style={{ position: "absolute", right: 4, bottom: 4, display: "flex", gap: 3 }}>
            <button type="button" aria-label={`Move photo ${index + 1} up`} onClick={() => move(index, -1)} disabled={index === 0} style={{ width: 25, height: 25, border: 0, borderRadius: "50%", background: "#fffF", color: "#5d473e", cursor: "pointer" }}><ChevronUp size={14} /></button>
            <button type="button" aria-label={`Move photo ${index + 1} down`} onClick={() => move(index, 1)} disabled={index === images.length - 1} style={{ width: 25, height: 25, border: 0, borderRadius: "50%", background: "#fffF", color: "#5d473e", cursor: "pointer" }}><ChevronDown size={14} /></button>
            <button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => onChange(images.filter((_, itemIndex) => index !== itemIndex))} style={{ width: 25, height: 25, border: 0, borderRadius: "50%", background: "#fffF", color: "#8e3650", cursor: "pointer" }}><Trash2 size={13} /></button>
          </div>
        </div>)}
      </div>
      <GalleryUploadButton onFiles={(files) => onChange([...images, ...files].slice(0, 24))} />
      {images.length >= 24 && <p className="notice">You have reached the 24-photo limit.</p>}
    </div>
  );
}
