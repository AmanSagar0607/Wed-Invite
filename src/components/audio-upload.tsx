"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Trash2, Upload } from "lucide-react";

export function AudioUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setMessage("Audio files must be smaller than 15 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: form });
      if (!response.ok) throw new Error("Upload unavailable");
      const result = await response.json() as { url: string };
      onChange(result.url);
      setMessage("Audio uploaded to your media store.");
    } catch {
      setMessage("The audio could not be uploaded. Use a hosted MP3 URL instead.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="field full">
      <span className="field-label">Upload music (MP3, M4A, OGG, or WAV)</span>
      <input ref={inputRef} type="file" accept="audio/mpeg,audio/mp4,audio/aac,audio/ogg,audio/wav,audio/x-wav" hidden onChange={(event) => void handleFile(event.target.files?.[0])} />
      <div className="inline-actions" style={{ marginTop: 0 }}>
        <button className="button-secondary" type="button" disabled={busy} onClick={() => inputRef.current?.click()}>{busy ? <LoaderCircle size={14} className="spin" /> : <Upload size={14} />}{busy ? "Uploading…" : "Choose audio"}</button>
        {value && <button className="button-secondary" type="button" onClick={() => { onChange(""); setMessage(""); }}><Trash2 size={14} />Remove music</button>}
      </div>
      {value && <audio controls preload="none" src={value} style={{ width: "100%", height: 36, marginTop: 7 }} aria-label="Music preview" />}
      {message && <span role="status" style={{ color: "#88766c", fontSize: 9 }}>{message}</span>}
    </div>
  );
}
