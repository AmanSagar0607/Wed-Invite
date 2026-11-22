"use client";

import { useEffect, useRef, useState } from "react";

type Butterfly = {
  x: number;
  y: number;
  previousY: number;
  scale: number;
  speed: number;
  amplitude: number;
  phase: number;
  flapRate: number;
  color: string;
  nextLanding: number;
  landedUntil: number;
};

type Petal = { x: number; y: number; size: number; speed: number; sway: number; phase: number; rotation: number; color: string };

const butterflyColors = ["#a66b2d", "#4e8790", "#d78085", "#c98b46"];
const petalColors = ["#d88b32", "#e0a340", "#d57b45", "#bf6a5d", "#edbd69"];

function makeButterflies(count: number, width: number, height: number): Butterfly[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    previousY: 0,
    scale: 0.62 + Math.random() * 0.48,
    speed: 5 + Math.random() * 12,
    amplitude: 8 + Math.random() * 23,
    phase: Math.random() * Math.PI * 2,
    flapRate: 6 + Math.random() * 3,
    color: butterflyColors[Math.floor(Math.random() * butterflyColors.length)],
    nextLanding: 8 + Math.random() * 15,
    landedUntil: 0,
  }));
}

function makePetals(count: number, width: number, height: number): Petal[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 2 + Math.random() * 3,
    speed: 9 + Math.random() * 19,
    sway: 5 + Math.random() * 15,
    phase: Math.random() * Math.PI * 2,
    rotation: Math.random() * Math.PI * 2,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
  }));
}

function drawButterfly(context: CanvasRenderingContext2D, butterfly: Butterfly, time: number, reducedMotion: boolean) {
  const flap = reducedMotion ? 0.86 : 0.28 + Math.abs(Math.sin(time * butterfly.flapRate)) * 0.72;
  context.save();
  context.translate(butterfly.x, butterfly.y);
  context.rotate(Math.atan2(butterfly.y - butterfly.previousY, Math.max(8, butterfly.speed)));
  context.scale(butterfly.scale, butterfly.scale);
  context.globalAlpha = 0.78;

  context.save();
  context.scale(flap, 1);
  context.fillStyle = butterfly.color;
  context.strokeStyle = "rgba(111, 72, 40, .48)";
  context.lineWidth = 0.75;
  context.beginPath();
  context.ellipse(-4.5, -2.8, 5.3, 7.1, -0.48, 0, Math.PI * 2);
  context.ellipse(4.5, -2.8, 5.3, 7.1, 0.48, 0, Math.PI * 2);
  context.ellipse(-3.3, 3.8, 3.6, 5.1, 0.45, 0, Math.PI * 2);
  context.ellipse(3.3, 3.8, 3.6, 5.1, -0.45, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();

  context.fillStyle = "#6f4934";
  context.beginPath();
  context.ellipse(0, 0, 1.1, 5.5, 0, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = "rgba(111, 73, 52, .7)";
  context.lineWidth = 0.7;
  context.beginPath();
  context.moveTo(-0.4, -4);
  context.quadraticCurveTo(-4, -9, -5.1, -8.1);
  context.moveTo(0.4, -4);
  context.quadraticCurveTo(4, -9, 5.1, -8.1);
  context.stroke();
  context.restore();
}

function drawPetal(context: CanvasRenderingContext2D, petal: Petal) {
  context.save();
  context.translate(petal.x, petal.y);
  context.rotate(petal.rotation);
  context.fillStyle = petal.color;
  context.globalAlpha = 0.38;
  context.beginPath();
  context.moveTo(0, -petal.size * 1.8);
  context.bezierCurveTo(petal.size * 1.1, -petal.size, petal.size * 1.05, petal.size, 0, petal.size * 1.6);
  context.bezierCurveTo(-petal.size * 1.05, petal.size, -petal.size * 1.1, -petal.size, 0, -petal.size * 1.8);
  context.fill();
  context.restore();
}

export function InviteMotionLayer({ butterflies: showButterflies = true }: { butterflies?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ count: 0, fps: 0 });
  const showStats = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!showButterflies) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionPreference.matches;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let butterflies: Butterfly[] = [];
    let petals: Petal[] = [];
    let pointer: { x: number; y: number } | null = null;
    let visible = true;
    let running = false;
    let frame = 0;
    let previousFrame = 0;
    let fpsWindowStart = 0;
    let fpsFrames = 0;
    let degraded = false;

    const createParticles = () => {
      const count = reducedMotion ? 4 : window.innerWidth < 640 ? 8 : 18;
      butterflies = makeButterflies(count, width, height);
      petals = makePetals(reducedMotion ? 0 : window.innerWidth < 640 ? 11 : 20, width, height);
      setStats((current) => ({ ...current, count }));
      degraded = false;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      createParticles();
      if (reducedMotion) render(0, 0);
    };

    const render = (time: number, delta: number) => {
      context.clearRect(0, 0, width, height);
      for (const petal of petals) {
        if (!reducedMotion) {
          petal.y += petal.speed * delta;
          petal.x += Math.sin(time * 0.55 + petal.phase) * petal.sway * delta;
          petal.rotation += delta * 0.22;
          if (petal.y > height + 12) {
            petal.y = -12;
            petal.x = Math.random() * width;
          }
        }
        drawPetal(context, petal);
      }

      for (const butterfly of butterflies) {
        const oldY = butterfly.y;
        const landed = !reducedMotion && time < butterfly.landedUntil;
        if (!reducedMotion) {
          if (!landed) butterfly.x += butterfly.speed * delta;
          butterfly.y += (Math.sin(time * 0.72 + butterfly.phase) * butterfly.amplitude - (butterfly.y - height * 0.5)) * delta * 0.14;

          if (!landed && time > butterfly.nextLanding) {
            butterfly.landedUntil = time + 2 + Math.random() * 2;
            butterfly.nextLanding = time + 12 + Math.random() * 18;
          }
          if (pointer) {
            const dx = butterfly.x - pointer.x;
            const dy = butterfly.y - pointer.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance < 95) {
              const nudge = (1 - distance / 95) * 15 * delta;
              butterfly.x += (dx / distance) * nudge;
              butterfly.y += (dy / distance) * nudge;
            }
          }
          if (butterfly.x > width + 24) {
            butterfly.x = -24;
            butterfly.y = Math.random() * height;
          }
        }
        butterfly.previousY = oldY;
        drawButterfly(context, butterfly, landed ? time * 0.25 : time, reducedMotion);
      }
    };

    const animate = (timestamp: number) => {
      if (!running || !visible || reducedMotion) return;
      const delta = previousFrame ? Math.min((timestamp - previousFrame) / 1000, 0.05) : 0;
      previousFrame = timestamp;
      render(timestamp / 1000, delta);
      fpsFrames += 1;
      if (timestamp - fpsWindowStart >= 700) {
        const fps = Math.round((fpsFrames * 1000) / (timestamp - fpsWindowStart));
        setStats({ count: butterflies.length, fps });
        if (fps < 40 && butterflies.length > 4 && !degraded) {
          butterflies = butterflies.slice(0, Math.max(4, Math.floor(butterflies.length * 0.65)));
          petals = petals.slice(0, Math.ceil(petals.length * 0.6));
          degraded = true;
        }
        fpsWindowStart = timestamp;
        fpsFrames = 0;
      }
      frame = window.requestAnimationFrame(animate);
    };

    const start = () => {
      if (running || !visible || document.visibilityState === "hidden") return;
      running = true;
      previousFrame = 0;
      fpsWindowStart = performance.now();
      if (reducedMotion) render(0, 0);
      else frame = window.requestAnimationFrame(animate);
    };

    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousFrame = 0;
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      resize();
      stop();
      if (visible) start();
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };
    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };
    const handlePointerLeave = () => { pointer = null; };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    observer.observe(canvas);
    motionPreference.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    resize();
    start();

    return () => {
      stop();
      observer.disconnect();
      motionPreference.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [showButterflies]);

  return (
    <>
      {showButterflies && <canvas ref={canvasRef} className="wedding-atmosphere" aria-hidden="true" />}
      {showButterflies && showStats && <span className="atmosphere-stats" aria-hidden="true">{stats.count} butterflies · {stats.fps || 60} FPS</span>}
      <InviteRevealController />
    </>
  );
}

function InviteRevealController() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".invite-root");
    if (!root) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scrollRoot = root.closest<HTMLElement>(".phone-screen");
    const scrollTarget: HTMLElement | Window = scrollRoot ?? window;
    const targets = new Set<HTMLElement>();
    let revealObserver: IntersectionObserver | undefined;
    let scrollFrame = 0;

    const revealImmediately = (element: HTMLElement) => element.classList.add("is-visible");
    const observe = (element: HTMLElement) => {
      if (element.matches(".motion-reveal") && !targets.has(element)) {
        targets.add(element);
        if (media.matches || !revealObserver) revealImmediately(element);
        else revealObserver.observe(element);
      }
    };

    if ("IntersectionObserver" in window && !media.matches) {
      revealObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver?.unobserve(entry.target);
          }
        }
      }, { root: scrollRoot, threshold: 0.08, rootMargin: "0px 0px 70px 0px" });
      root.classList.add("motion-ready");
    }

    root.querySelectorAll<HTMLElement>(".motion-reveal").forEach(observe);

    const mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          observe(node);
          node.querySelectorAll<HTMLElement>(".motion-reveal").forEach(observe);
        });
      }
    });
    mutationObserver.observe(root, { childList: true, subtree: true });

    const updateParallax = () => {
      scrollFrame = 0;
      const canParallax = window.innerWidth >= 1024 && !media.matches;
      root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((element) => {
        if (!canParallax) {
          element.style.removeProperty("--parallax-y");
          return;
        }
        const bounds = element.getBoundingClientRect();
        const offset = (window.innerHeight * 0.52 - (bounds.top + bounds.height * 0.5)) * 0.045;
        element.style.setProperty("--parallax-y", `${Math.max(-24, Math.min(24, offset))}px`);
      });
    };
    const requestParallax = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateParallax);
    };
    scrollTarget.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    updateParallax();

    return () => {
      mutationObserver.disconnect();
      revealObserver?.disconnect();
      targets.clear();
      root.classList.remove("motion-ready");
      scrollTarget.removeEventListener("scroll", requestParallax);
      window.removeEventListener("resize", requestParallax);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    };
  }, []);

  return null;
}
