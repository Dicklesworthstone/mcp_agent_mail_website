"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";
import { useMotionValue, type MotionValue } from "framer-motion";

function prng(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function DataDebris({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const particles = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      char:
        prng(i * 17.1) > 0.5
          ? Math.floor(prng(i * 29.3) * 16).toString(16)
          : prng(i * 43.7) > 0.5
            ? "0"
            : "1",
      offsetX: (prng(i * 59.9) - 0.5) * 40,
      offsetY: (prng(i * 71.2) - 0.5) * 40,
      duration: 1 + prng(i * 83.1) * 2,
      drift1: (prng(i * 97.3) - 0.5) * 20,
      drift2: (prng(i * 101.9) - 0.5) * 40,
    }));
  }, []);

  return (
    <motion.div className="absolute pointer-events-none" style={{ x, y }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute text-[8px] font-mono text-blue-500/40 select-none"
          style={{
            left: p.offsetX,
            top: p.offsetY,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -20, -40],
            x: [0, p.drift1, p.drift2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.char}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function CustomCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isOverFlashlightSection, setIsOverFlashlightSection] = useState(false);
  const [isTechnicalArea, setIsTechnicalArea] = useState(false);
  const visibleRef = useRef(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const [magneticPos, setMagneticPos] = useState({ x: 0, y: 0 });
  const [isMagnetic, setIsMagnetic] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const media = window.matchMedia("(min-width: 768px)");
    let enabled = false;
    let rafId: number | null = null;
    let last: { clientX: number; clientY: number; target: HTMLElement | null } | null = null;

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleWindowBlur = () => setIsClicking(false);
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        setIsClicking(false);
      }
    };
    const handleMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
      setIsClicking(false);
    };
    const handleMouseEnter = () => {
      visibleRef.current = true;
      setIsVisible(true);
    };

    const flush = () => {
      rafId = null;
      if (!last) return;
      const { clientX, clientY, target } = last;
      if (!target) return;

      let closestButton: Element | null = null;
      let closestLink: Element | null = null;
      let closestPre: Element | null = null;
      let closestCode: Element | null = null;
      let closestTechnical: Element | null = null;
      let closestFlashlight: Element | null = null;
      let closestHeader: Element | null = null;
      let magneticElement: HTMLElement | null = null;
      let hasPointerRole = false;

      let el: HTMLElement | null = target;
      while (el) {
        const tag = el.tagName;
        if (!closestButton && tag === "BUTTON") closestButton = el;
        if (!closestLink && tag === "A") closestLink = el;
        if (!closestPre && tag === "PRE") closestPre = el;
        if (!closestCode && tag === "CODE") closestCode = el;
        if (!closestHeader && tag === "HEADER") closestHeader = el;
        if (!closestTechnical && el.dataset.technical === "true") closestTechnical = el;
        if (!closestFlashlight && el.dataset.flashlight === "true") closestFlashlight = el;
        if (!magneticElement && el.dataset.magnetic === "true") magneticElement = el;
        if (!hasPointerRole && (el.getAttribute("role") === "button" || el.dataset.cursor === "pointer")) hasPointerRole = true;
        el = el.parentElement;
      }

      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        Boolean(closestButton) ||
        Boolean(closestLink) ||
        hasPointerRole;

      setIsPointer((prev) => (prev === isClickable ? prev : isClickable));

      const isTech =
        Boolean(closestPre) ||
        Boolean(closestCode) ||
        Boolean(closestTechnical);
      setIsTechnicalArea((prev) => (prev === isTech ? prev : isTech));

      const isFlashlight = Boolean(closestFlashlight) && !closestHeader;
      setIsOverFlashlightSection((prev) => (prev === isFlashlight ? prev : isFlashlight));
      if (magneticElement) {
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(clientX - centerX, clientY - centerY);

        if (distance < 60) {
          setIsMagnetic((prev) => (prev ? prev : true));
          setMagneticPos((prev) => (prev.x === centerX && prev.y === centerY ? prev : { x: centerX, y: centerY }));
          return;
        }
      }

      setIsMagnetic((prev) => (prev ? false : prev));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enabled) return;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const target = e.target instanceof HTMLElement ? e.target : null;
      last = { clientX: e.clientX, clientY: e.clientY, target };
      if (rafId === null) rafId = window.requestAnimationFrame(flush);
    };

    const enable = () => {
      if (enabled) return;
      enabled = true;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("blur", handleWindowBlur);
      document.addEventListener("mouseleave", handleMouseLeave);
      document.addEventListener("mouseenter", handleMouseEnter);
      document.addEventListener("visibilitychange", handleVisibilityChange);
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
      last = null;
      visibleRef.current = false;
      setIsVisible(false);
      setIsMagnetic(false);
      setIsClicking(false);
    };

    const onMediaChange = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) enable();
      else disable();
    };

    onMediaChange(media);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onMediaChange);
      return () => {
        media.removeEventListener("change", onMediaChange);
        disable();
      };
    } else {
      media.addListener(onMediaChange as (ev: MediaQueryListEvent) => void);
      return () => {
        media.removeListener(onMediaChange as (ev: MediaQueryListEvent) => void);
        disable();
      };
    }
  }, [mouseX, mouseY, prefersReducedMotion]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[10000] hidden md:block" style={{ willChange: "transform" }}>
        {isVisible && isOverFlashlightSection && (
          <motion.div
            key="flashlight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute h-[600px] w-[600px] rounded-full"
            style={{
              x: mouseX,
              y: mouseY,
              translateX: "-50%",
              translateY: "-50%",
              background: "radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.9) 70%)",
              boxShadow: "0 0 0 3000px rgba(0, 0, 0, 0.9)",
            }}
          />
        )}

        {isVisible && isTechnicalArea && <DataDebris x={mouseX} y={mouseY} />}

        {isVisible && (
          <>
            <motion.div
              className="absolute left-0 top-0 h-10 w-10 rounded-full border border-blue-500/40"
              style={{
                x: isMagnetic ? magneticPos.x : mouseX,
                y: isMagnetic ? magneticPos.y : mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                scale: isPointer ? 1.4 : isClicking ? 0.7 : 1,
                rotate: isClicking ? 45 : 0,
                borderRadius: isClicking ? "20%" : "50%",
                borderColor: isPointer ? "rgba(96, 165, 250, 0.8)" : "rgba(96, 165, 250, 0.4)",
                borderWidth: isPointer ? 2 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 0.5
              }}
            >
               <AnimatePresence>
                 {isClicking && (
                   <motion.div
                     key="click-glitch"
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1.5 }}
                     exit={{ opacity: 0 }}
                     className="absolute inset-[-10px] border border-orange-500/50 rounded-full"
                   />
                 )}
               </AnimatePresence>
            </motion.div>

            <motion.div
              className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
              animate={{
                scale: isClicking ? 3 : 1,
                backgroundColor: isClicking ? "#ef4444" : "#60A5FA",
              }}
            />
          </>
        )}

        <AnimatePresence>
          {isVisible && isPointer && !isMagnetic && (
            <motion.div
              key="crosshair"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              className="absolute left-0 top-0 pointer-events-none"
              style={{
                x: mouseX,
                y: mouseY,
                translateX: "-50%",
                translateY: "-50%",
              }}
            >
              <div className="absolute top-[-15px] left-1/2 h-[8px] w-[1px] bg-blue-500/60 -translate-x-1/2" />
              <div className="absolute bottom-[-15px] left-1/2 h-[8px] w-[1px] bg-blue-500/60 -translate-x-1/2" />
              <div className="absolute left-[-15px] top-1/2 w-[8px] h-[1px] bg-blue-500/60 -translate-y-1/2" />
              <div className="absolute right-[-15px] top-1/2 w-[8px] h-[1px] bg-blue-500/60 -translate-y-1/2" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
