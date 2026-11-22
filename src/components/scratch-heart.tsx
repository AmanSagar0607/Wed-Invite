"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type ScratchPoint = { x: number; y: number };
type ScratchStroke = { points: ScratchPoint[]; radius: number };

function heartPath(context: CanvasRenderingContext2D, width: number, height: number) {
  const x = width / 2;
  const y = height * 0.48;
  context.beginPath();
  context.moveTo(x, y + height * 0.34);
  context.bezierCurveTo(x - width * 0.05, y + height * 0.27, x - width * 0.42, y + height * 0.04, x - width * 0.38, y - height * 0.12);
  context.bezierCurveTo(x - width * 0.34, y - height * 0.34, x - width * 0.07, y - height * 0.34, x, y - height * 0.17);
  context.bezierCurveTo(x + width * 0.08, y - height * 0.35, x + width * 0.36, y - height * 0.32, x + width * 0.39, y - height * 0.1);
  context.bezierCurveTo(x + width * 0.41, y + height * 0.06, x + width * 0.06, y + height * 0.3, x, y + height * 0.34);
  context.closePath();
}

export function ScratchHeart({ label, value, first, second, storageKey, onReveal }: {
  label: string;
  value: string;
  first: string;
  second: string;
  storageKey: string;
  onReveal: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<ScratchStroke[]>([]);
  const activeStrokeRef = useRef<ScratchStroke | null>(null);
  const sampleMaskRef = useRef<Uint8Array>(new Uint8Array());
  const sampledHeartPixelsRef = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`wedding-date:${storageKey}:${label.toLowerCase()}`) === "revealed";
      setRevealed(saved);
      if (saved) onReveal();
    } catch {
      setRevealed(false);
    }
    setStorageReady(true);
  }, [label, onReveal, storageKey]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      const key = `wedding-date:${storageKey}:${label.toLowerCase()}`;
      if (revealed) window.localStorage.setItem(key, "revealed");
      else window.localStorage.removeItem(key);
    } catch {
      return;
    }
  }, [label, revealed, storageKey, storageReady]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, bounds.width, bounds.height);

    const gradient = context.createLinearGradient(0, 0, bounds.width, bounds.height);
    gradient.addColorStop(0, first);
    gradient.addColorStop(0.52, "#d9a441");
    gradient.addColorStop(1, second);
    heartPath(context, bounds.width, bounds.height);
    context.fillStyle = gradient;
    context.shadowColor = "rgba(85, 43, 22, .22)";
    context.shadowBlur = 9;
    context.shadowOffsetY = 3;
    context.fill();
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.strokeStyle = "rgba(255, 242, 205, .88)";
    context.lineWidth = 1.2;
    context.stroke();

    const heartPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    sampledHeartPixelsRef.current = 0;
    const sampleMask = new Uint8Array(Math.ceil((canvas.width * canvas.height) / 10));
    let sampleIndex = 0;
    for (let pixel = 0; pixel < canvas.width * canvas.height; pixel += 10) {
      if (heartPixels[pixel * 4 + 3] > 20) {
        sampleMask[sampleIndex] = 1;
        sampledHeartPixelsRef.current += 1;
      }
      sampleIndex += 1;
    }
    sampleMaskRef.current = sampleMask;

    context.globalCompositeOperation = "destination-out";
    for (const stroke of strokesRef.current) {
      if (!stroke.points.length) continue;
      const lineWidth = Math.max(1, stroke.radius * Math.min(bounds.width, bounds.height) * 2);
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.lineJoin = "round";
      const points = stroke.points.map((point) => ({ x: point.x * bounds.width, y: point.y * bounds.height }));
      context.beginPath();
      if (points.length === 1) {
        context.arc(points[0].x, points[0].y, lineWidth / 2, 0, Math.PI * 2);
      } else {
        context.moveTo(points[0].x, points[0].y);
        for (let index = 1; index < points.length; index += 1) {
          const point = points[index];
          const previous = points[index - 1];
          const midX = (previous.x + point.x) / 2;
          const midY = (previous.y + point.y) / 2;
          context.quadraticCurveTo(previous.x, previous.y, midX, midY);
        }
        const last = points[points.length - 1];
        context.lineTo(last.x, last.y);
        context.stroke();
        continue;
      }
      context.fill();
    }
    context.globalCompositeOperation = "source-over";
    if (revealed) context.clearRect(0, 0, bounds.width, bounds.height);
  }, [first, second, revealed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sampledHeartPixelsRef.current = 0;
    redraw();
    const observer = new ResizeObserver(() => {
      sampledHeartPixelsRef.current = 0;
      redraw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>): ScratchPoint => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)), y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)) };
  };

  const startScratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const bounds = event.currentTarget.getBoundingClientRect();
    const stroke: ScratchStroke = { points: [pointFromEvent(event)], radius: 22 / Math.min(bounds.width, bounds.height) };
    strokesRef.current.push(stroke);
    activeStrokeRef.current = stroke;
    redraw();
  };

  const scratch = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = activeStrokeRef.current;
    if (!stroke || revealed) return;
    const point = pointFromEvent(event);
    const previous = stroke.points[stroke.points.length - 1];
    const distance = Math.hypot((point.x - previous.x) * 100, (point.y - previous.y) * 100);
    const steps = Math.max(1, Math.ceil(distance / 2));
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      stroke.points.push({ x: previous.x + (point.x - previous.x) * progress, y: previous.y + (point.y - previous.y) * progress });
    }
    redraw();
  };

  const checkReveal = () => {
    activeStrokeRef.current = null;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const mask = sampleMaskRef.current;
    if (!canvas || !context || !sampledHeartPixelsRef.current || revealed) return;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let cleared = 0;
    let sampleIndex = 0;
    for (let pixel = 0; pixel < canvas.width * canvas.height; pixel += 10) {
      if (mask[sampleIndex] && pixels[pixel * 4 + 3] < 20) cleared += 1;
      sampleIndex += 1;
    }
    if (cleared / sampledHeartPixelsRef.current >= 0.55) reveal();
  };

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    onReveal();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      reveal();
    }
  };

  return (
    <div className="heart-wrap">
      <p className="heart-hint">{label}</p>
      <div className={`heart-canvas-wrap${revealed ? " is-revealed" : ""}`}>
        <div className="heart-reveal" aria-hidden="true"><strong>{value}</strong></div>
        <canvas
          ref={canvasRef}
          className="scratch-heart"
          role="button"
          tabIndex={0}
          aria-label={`Reveal ${label.toLowerCase()}`}
          onKeyDown={handleKeyDown}
          onPointerDown={startScratch}
          onPointerMove={scratch}
          onPointerUp={checkReveal}
          onPointerCancel={checkReveal}
          onLostPointerCapture={checkReveal}
        />
      </div>
      {!revealed && <button className="scratch-reveal-button" type="button" onClick={reveal}>Tap to reveal</button>}
    </div>
  );
}
