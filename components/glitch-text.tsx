"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";
import { cn } from "@/lib/utils";

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  trigger?: "hover" | "always" | "random";
  intensity?: "low" | "medium" | "high";
}

export default function GlitchText({
  children,
  className,
  trigger = "hover",
  intensity = "medium",
}: GlitchTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isRandomGlitching, setIsRandomGlitching] = useState(false);
  const randomOffTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (trigger !== "random") return undefined;

    const intervalId = window.setInterval(() => {
      if (Math.random() > 0.85) {
        setIsRandomGlitching(true);
        if (randomOffTimeoutRef.current !== null) {
          window.clearTimeout(randomOffTimeoutRef.current);
        }
        randomOffTimeoutRef.current = window.setTimeout(() => {
          setIsRandomGlitching(false);
          randomOffTimeoutRef.current = null;
        }, 150 + Math.random() * 200);
      }
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
      if (randomOffTimeoutRef.current !== null) {
        window.clearTimeout(randomOffTimeoutRef.current);
        randomOffTimeoutRef.current = null;
      }
    };
  }, [trigger, prefersReducedMotion]);

  const isGlitching =
    !prefersReducedMotion &&
    (trigger === "always" ||
      (trigger === "hover" ? isHovered : isRandomGlitching));

  const glitchVariants = useMemo(() => ({
    initial: { x: 0, y: 0, textShadow: "none" },
    glitch: () => {
      const offset = intensity === "low" ? 2 : intensity === "medium" ? 5 : 10;
      return {
        x: [0, -offset, offset, -offset/2, 0],
        y: [0, offset/2, -offset/2, offset, 0],
        textShadow: [
          "none",
          `${offset}px 0 rgba(249,115,22,0.5), -${offset}px 0 rgba(59,130,246,0.5)`,
          `-${offset}px 0 rgba(249,115,22,0.5), ${offset}px 0 rgba(59,130,246,0.5)`,
          "none",
        ],
        transition: {
          duration: 0.2,
          repeat: Infinity,
          repeatType: "mirror" as const,
        },
      };
    },
  }), [intensity]);

  const shouldHandleHover = trigger === "hover" && !prefersReducedMotion;
  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!shouldHandleHover) return;
    if (event.pointerType === "mouse") {
      setIsHovered(true);
    }
  };
  const handlePointerLeave = () => {
    if (shouldHandleHover) {
      setIsHovered(false);
    }
  };

  return (
    <div
      className={cn("relative inline-block will-change-transform", className)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      style={{ transform: "translateZ(0)" }}
    >
      <motion.div
        variants={glitchVariants}
        animate={isGlitching ? "glitch" : "initial"}
        className="relative z-10"
        style={{ backfaceVisibility: "hidden" }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isGlitching && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.5, x: 10 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 z-0 pointer-events-none text-orange-500/30 overflow-hidden"
              style={{ clipPath: "inset(0 0 70% 0)", transform: "translateZ(0)" }}
              aria-hidden="true"
            >
              {children}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 0.5, x: -10 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, repeat: Infinity, repeatType: "reverse", delay: 0.05 }}
              className="absolute inset-0 z-0 pointer-events-none text-blue-500/30 overflow-hidden"
              style={{ clipPath: "inset(70% 0 0 0)", transform: "translateZ(0)" }}
              aria-hidden="true"
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
