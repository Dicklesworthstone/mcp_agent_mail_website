"use client";

import React, { useRef, useCallback, useSyncExternalStore } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { createPortal } from "react-dom";

export function Magnetic({ children, strength = 0.2 }: { children: React.ReactNode, strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    x.set((clientX - centerX) * strength);
    y.set((clientY - centerY) * strength);
  }, [strength, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

export function BorderBeam({ className }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit] ${className ?? ""}`.trim()}
    >
      <div
        className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(59,130,246,0.1)_180deg,transparent_360deg)] animate-border-beam"
      />
    </div>
  );
}

const noop = () => () => {};

export function Portal({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(noop, () => true, () => false);

  if (!isClient) return null;
  return createPortal(children, document.body);
}
