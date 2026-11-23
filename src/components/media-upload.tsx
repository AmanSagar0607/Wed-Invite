"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { uploadInviteImage } from "@/lib/media-client";

async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not process this image.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not prepare this image.")), "image/jpeg", 0.84));
}

function asDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}

export function MediaUpload({ label, value, onChange, multiple = false }: { label: string; value?: string; onChange: (url: string) => void; multiple?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    setMessage("");
    setBusy(true);
    try {
      const optimized = await prepareImage(file);
      try {
        const upload = new File([optimized], `${file.name.replace(/\.[^.]+$/, "") || "invite"}.jpg`, { type: "image/jpeg" });
        onChange(await uploadInviteImage(upload));
        setMessage("Optimized and saved to Vercel Blob.");
      } catch (error) {
        onChange(await asDataUrl(optimized));
        setMessage(`${error instanceof Error ? error.message : "Photo upload failed."} Saved in this browser draft; retry before publishing.`);
      }
    } catch {
      setMessage("This image could not be processed. Try another photo.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="field full">
      <span className="field-label">{label}</span>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 8, border: "1px solid #eee3d9", borderRadius: 11, background: "#fffdfa" }}>
          <Image src={value} alt={`${label} preview`} width={58} height={52} unoptimized style={{ width: 58, height: 52, borderRadius: 8, objectFit: "contain", background: "#f6eee4" }} />
          <span style={{ flex: 1, minWidth: 0, color: "#7e6f65", fontSize: 10, overflowWrap: "anywhere" }}>{value.startsWith("data:") ? "Local browser image" : "Uploaded image"}</span>
          <button type="button" className="icon-button" aria-label={`Remove ${label.toLowerCase()}`} onClick={() => { onChange(""); setMessage(""); }}><Trash2 size={15} /></button>
        </div>
      ) : (
        <button className="button-secondary" type="button" onClick={() => inputRef.current?.click()} disabled={busy} style={{ justifyContent: "flex-start", minHeight: 44 }}>
          {busy ? <LoaderCircle size={15} className="spin" /> : <ImagePlus size={15} />}
          {busy ? "Preparing photo…" : "Choose a photo"}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} hidden onChange={(event) => {
        const files = Array.from(event.target.files ?? []);
        if (files.length > 1) {
          setMessage("Choose one image at a time here; use the gallery add button for multiple photos.");
          return;
        }
        void handleFile(files[0]);
      }} />
      {message && <span role="status" style={{ color: "#88766c", fontSize: 9, lineHeight: 1.4 }}>{message}</span>}
      {multiple && <span style={{ color: "#9a8b81", fontSize: 9 }}>Images are resized to a maximum 1600px before upload.</span>}
    </div>
  );
}

export function GalleryUploadButton({ onFiles }: { onFiles: (files: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const addFiles = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setMessage("");
    const uploaded: string[] = [];
    let localOnly = 0;
    try {
      for (const file of files.slice(0, 8)) {
        const optimized = await prepareImage(file);
        try {
          const upload = new File([optimized], `${file.name.replace(/\.[^.]+$/, "") || "moment"}.jpg`, { type: "image/jpeg" });
          uploaded.push(await uploadInviteImage(upload));
        } catch {
          uploaded.push(await asDataUrl(optimized));
          localOnly += 1;
        }
      }
      onFiles(uploaded);
      setMessage(localOnly ? `${localOnly} photo${localOnly === 1 ? "" : "s"} saved only in this browser draft; upload before publishing.` : `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded to Vercel Blob.`);
    } catch {
      setMessage("Some photos could not be prepared. Try smaller JPEG, PNG, or WebP images.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => void addFiles(Array.from(event.target.files ?? []))} />
      <button className="button-secondary" type="button" disabled={busy} onClick={() => inputRef.current?.click()}><Upload size={14} />{busy ? "Preparing photos…" : "Add photos"}</button>
      {message && <span role="status" style={{ display: "block", marginTop: 7, color: "#88766c", fontSize: 9, lineHeight: 1.5 }}>{message}</span>}
    </>
  );
}
