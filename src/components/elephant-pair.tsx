"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

const springConfig = { stiffness: 90, damping: 12, mass: 1 };

function TrunkSegment({ path }: { path: string }) {
  return (
    <g className="elephant-trunk-segment">
      <path d={path} fill="none" stroke="#51342b" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="url(#trunk-shade)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#f4d5aa" strokeWidth="2.5" strokeLinecap="round" opacity=".9" />
    </g>
  );
}

function ElephantTrunk({ side, angles }: { side: "left" | "right"; angles: ReturnType<typeof useSpring>[] }) {
  const x = side === "left" ? 574 : 802;
  return (
    <g transform={`translate(${x} 397)${side === "right" ? " scale(-1 1)" : ""}`}>
      <motion.g className="elephant-trunk-joint" style={{ rotate: angles[0] }}>
        <TrunkSegment path="M0 0 C8 12 13 24 12 38" />
        <motion.g transform="translate(12 38)" className="elephant-trunk-joint" style={{ rotate: angles[1] }}>
          <TrunkSegment path="M0 0 C4 12 6 24 5 38" />
          <motion.g transform="translate(5 38)" className="elephant-trunk-joint" style={{ rotate: angles[2] }}>
            <TrunkSegment path="M0 0 C-2 12 -3 25 -1 38" />
            <motion.g transform="translate(-1 38)" className="elephant-trunk-joint" style={{ rotate: angles[3] }}>
              <TrunkSegment path="M0 0 C1 12 -2 24 -8 36" />
              <motion.g transform="translate(-8 36)" className="elephant-trunk-joint" style={{ rotate: angles[4] }}>
                <TrunkSegment path="M0 0 C-10 8 -16 15 -13 22 C-10 29 -1 29 2 22" />
                <motion.g transform="translate(2 22)" className="elephant-trunk-joint" style={{ rotate: angles[5] }}>
                  <TrunkSegment path="M0 0 C4 5 3 10 -1 14" />
                  <motion.g transform="translate(-1 14)" className="elephant-trunk-joint" style={{ rotate: angles[6] }}>
                    <TrunkSegment path="M0 0 C-2 4 -1 7 2 9" />
                  </motion.g>
                </motion.g>
              </motion.g>
            </motion.g>
          </motion.g>
        </motion.g>
      </motion.g>
    </g>
  );
}

export function ElephantPair() {
  const stageRef = useRef<HTMLDivElement>(null);
  const visible = useInView(stageRef, { amount: 0.18 });
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const scrollVelocity = useVelocity(scrollYProgress);
  const scrollSwing = useTransform(scrollVelocity, [-0.8, 0, 0.8], [-7, 0, 7]);
  const easedScrollSwing = useSpring(scrollSwing, springConfig);

  const target0 = useMotionValue(0);
  const target1 = useMotionValue(0);
  const target2 = useMotionValue(0);
  const target3 = useMotionValue(0);
  const target4 = useMotionValue(0);
  const target5 = useMotionValue(0);
  const target6 = useMotionValue(0);
  const angle0 = useSpring(target0, springConfig);
  const angle1 = useSpring(target1, springConfig);
  const angle2 = useSpring(target2, springConfig);
  const angle3 = useSpring(target3, springConfig);
  const angle4 = useSpring(target4, springConfig);
  const angle5 = useSpring(target5, springConfig);
  const angle6 = useSpring(target6, springConfig);
  const tiltTarget = useMotionValue(0);
  const tilt = useSpring(tiltTarget, { stiffness: 140, damping: 18, mass: 0.8 });

  useEffect(() => {
    if (!visible || reducedMotion) {
      target0.set(0);
      target1.set(0);
      target2.set(0);
      target3.set(0);
      target4.set(0);
      target5.set(0);
      target6.set(0);
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const phase = ((now - startedAt) % 7_000) / 7_000;
      const ease = (value: number) => value * value * (3 - 2 * value);
      let curl = 0;
      if (phase < 0.27) curl = -22 * ease(phase / 0.27);
      else if (phase < 0.41) curl = -22;
      else if (phase < 0.68) curl = -22 + 39 * ease((phase - 0.41) / 0.27);
      else curl = 17 * (1 - ease((phase - 0.68) / 0.32));

      const scroll = Math.max(-7, Math.min(7, easedScrollSwing.get()));
      target0.set(curl * 0.24 + scroll * 0.32);
      target1.set(angle0.get() * 0.62 + curl * 0.16 + scroll * 0.22);
      target2.set(angle1.get() * 0.62 + curl * 0.12 + scroll * 0.16);
      target3.set(angle2.get() * 0.62 + curl * 0.1 + scroll * 0.12);
      target4.set(angle3.get() * 0.58 + curl * 0.08 + scroll * 0.08);
      target5.set(angle4.get() * 0.54 + curl * 0.06 + scroll * 0.06);
      target6.set(angle5.get() * 0.5 + curl * 0.04 + scroll * 0.04);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [visible, reducedMotion, easedScrollSwing, target0, target1, target2, target3, target4, target5, target6, angle0, angle1, angle2, angle3, angle4, angle5]);

  const angles = [angle0, angle1, angle2, angle3, angle4, angle5, angle6];
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reducedMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const normalized = (event.clientX - bounds.left) / bounds.width - 0.5;
    tiltTarget.set(normalized * 16);
  };

  return (
    <div
      ref={stageRef}
      className={`countdown-elephants elephant-pair-stage${visible && !reducedMotion ? " is-animating" : ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => tiltTarget.set(0)}
      aria-hidden="true"
    >
      <motion.div className="elephant-pair-tilt" style={{ rotateY: tilt, transformStyle: "preserve-3d" }}>
        <Image src="/wedding/elephant-pair-v2.webp" alt="" width={1376} height={768} sizes="(max-width: 640px) 92vw, (max-width: 1100px) 62vw, 680px" quality={70} />
        <svg className="elephant-trunk-rig" viewBox="0 0 1376 768" preserveAspectRatio="none">
          <defs>
            <linearGradient id="trunk-shade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#51352d" />
              <stop offset=".44" stopColor="#ad8969" />
              <stop offset=".78" stopColor="#8f674c" />
              <stop offset="1" stopColor="#50342b" />
            </linearGradient>
          </defs>
          <path className="elephant-trunk-mask" d="M0 0 C18 28 24 60 20 88 C15 116 28 144 17 169 C13 180 2 184 -8 177" transform="translate(574 397)" />
          <path className="elephant-trunk-mask" d="M0 0 C18 28 24 60 20 88 C15 116 28 144 17 169 C13 180 2 184 -8 177" transform="translate(802 397) scale(-1 1)" />
          <ElephantTrunk side="left" angles={angles} />
          <ElephantTrunk side="right" angles={angles} />
        </svg>
      </motion.div>
    </div>
  );
}
