"use client";

import { useEffect, useId, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

/**
 * An interactive robot mascot with cursor-tracking eyes.
 * Inspired by the Agent Mail illustration: blue body, orange cap, green eyes.
 */
export default function RobotMascot({ className }: { className?: string }) {
  const uid = useId();
  const glowId = `robot-glow-${uid}`;
  const bodyGradId = `body-grad-${uid}`;
  const capGradId = `cap-grad-${uid}`;
  const prefersReducedMotion = useReducedMotion();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const robotRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const frameRef = useRef<number | null>(null);
  const rectRafRef = useRef<number | null>(null);
  const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBlinkingRef = useRef(false);
  const isVisibleRef = useRef(false);
  const enableMotion = !prefersReducedMotion;

  const updateRect = useCallback((force = false) => {
    if (!force && !isVisibleRef.current) return;
    if (robotRef.current) {
      rectRef.current = robotRef.current.getBoundingClientRect();
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const el = robotRef.current;
    if (!el) return;

    const scheduleRectUpdate = () => {
      if (rectRafRef.current !== null) return;
      rectRafRef.current = requestAnimationFrame(() => {
        rectRafRef.current = null;
        updateRect();
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisibleRef.current || frameRef.current) return;

      frameRef.current = requestAnimationFrame(() => {
        if (!rectRef.current) {
          frameRef.current = null;
          return;
        }

        const rect = rectRef.current;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.hypot(deltaX, deltaY);

        const angle = Math.atan2(deltaY, deltaX);
        const moveDist = Math.min(rect.width / 8, distance / 20);

        setMousePos({
          x: Math.cos(angle) * moveDist,
          y: Math.sin(angle) * moveDist,
        });

        frameRef.current = null;
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          updateRect(true);
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);

    updateRect(true);
    window.addEventListener("scroll", scheduleRectUpdate, { passive: true });
    window.addEventListener("resize", scheduleRectUpdate, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", scheduleRectUpdate);
      window.removeEventListener("resize", scheduleRectUpdate);
      if (rectRafRef.current) cancelAnimationFrame(rectRafRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [updateRect, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const blinkInterval = setInterval(() => {
      if (isVisibleRef.current && Math.random() > 0.8 && !isBlinkingRef.current) {
        isBlinkingRef.current = true;
        setIsBlinking(true);
        if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
        blinkTimeoutRef.current = setTimeout(() => {
          isBlinkingRef.current = false;
          setIsBlinking(false);
        }, 120);
      }
    }, 2500);

    return () => {
      clearInterval(blinkInterval);
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <motion.div
      ref={robotRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={enableMotion ? { scale: 1.05 } : undefined}
      className={cn("relative select-none", className)}
    >
      <svg
        viewBox="0 0 120 140"
        className="w-full h-full"
        aria-label="Agent Mail robot mascot"
      >
        {/* Glow behind robot */}
        <defs>
          <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id={capGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <circle cx="60" cy="75" r="55" fill={`url(#${glowId})`} />

        {/* Antenna */}
        <line x1="60" y1="18" x2="60" y2="8" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
        <circle cx="60" cy="6" r="3" fill={isHovered ? "#FB923C" : "#F97316"} />

        {/* Cap / dome top */}
        <path
          d="M 30 45 Q 30 18 60 18 Q 90 18 90 45"
          fill={`url(#${capGradId})`}
          stroke="#FB923C"
          strokeWidth="1"
        />

        {/* Main body / head */}
        <rect
          x="25" y="42" width="70" height="60" rx="16"
          fill={`url(#${bodyGradId})`}
          stroke="#93C5FD"
          strokeWidth="1"
          opacity="0.95"
        />

        {/* Glass dome visor */}
        <rect
          x="32" y="48" width="56" height="34" rx="10"
          fill="#0A1628"
          stroke="#60A5FA"
          strokeWidth="0.5"
          opacity="0.9"
        />

        {/* Left eye */}
        <g>
          <circle cx="48" cy="65" r="8" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <motion.g
            style={{ x: mousePos.x * 0.6, y: mousePos.y * 0.6 }}
            transition={enableMotion ? { type: "spring", stiffness: 250, damping: 20 } : { duration: 0 }}
          >
            <circle cx="48" cy="65" r="4" fill="#22c55e" />
            <motion.g
              animate={{ scale: isHovered ? 1.3 : 1 }}
              transition={enableMotion ? { type: "spring", stiffness: 250, damping: 20 } : { duration: 0 }}
              style={{ transformOrigin: "48px 65px" }}
            >
              <circle cx="48" cy="65" r="2" fill="#0f172a" />
            </motion.g>
          </motion.g>
          {/* Eye shine */}
          <circle cx="46" cy="63" r="1.5" fill="white" opacity="0.5" />

          {/* Eyelid (blink) */}
          <motion.rect
            x="39" y="56" width="18" height="18" rx="8"
            fill="#2563EB"
            animate={{ scaleY: isBlinking ? 1 : 0 }}
            style={{ originY: "50%" }}
            transition={{ duration: 0.08 }}
          />
        </g>

        {/* Right eye */}
        <g>
          <circle cx="72" cy="65" r="8" fill="#0f172a" stroke="#22c55e" strokeWidth="1" />
          <motion.g
            style={{ x: mousePos.x * 0.6, y: mousePos.y * 0.6 }}
            transition={enableMotion ? { type: "spring", stiffness: 250, damping: 20 } : { duration: 0 }}
          >
            <circle cx="72" cy="65" r="4" fill="#22c55e" />
            <motion.g
              animate={{ scale: isHovered ? 1.3 : 1 }}
              transition={enableMotion ? { type: "spring", stiffness: 250, damping: 20 } : { duration: 0 }}
              style={{ transformOrigin: "72px 65px" }}
            >
              <circle cx="72" cy="65" r="2" fill="#0f172a" />
            </motion.g>
          </motion.g>
          <circle cx="70" cy="63" r="1.5" fill="white" opacity="0.5" />

          <motion.rect
            x="63" y="56" width="18" height="18" rx="8"
            fill="#2563EB"
            animate={{ scaleY: isBlinking ? 1 : 0 }}
            style={{ originY: "50%" }}
            transition={{ duration: 0.08 }}
          />
        </g>

        {/* Mouth / status indicator */}
        <rect x="45" y="80" width="30" height="3" rx="1.5" fill="#93C5FD" opacity="0.6" />

        {/* Rust badge on body */}
        <g transform="translate(52, 108)">
          <rect width="16" height="10" rx="2" fill="#0A1628" stroke="#F97316" strokeWidth="0.5" />
          <text x="8" y="7.5" textAnchor="middle" fill="#F97316" fontSize="5" fontWeight="bold" fontFamily="monospace">Rs</text>
        </g>

        {/* Side ear / antenna left */}
        <rect x="18" y="55" width="8" height="14" rx="3" fill="#2563EB" stroke="#93C5FD" strokeWidth="0.5" />

        {/* Side ear / antenna right */}
        <rect x="94" y="55" width="8" height="14" rx="3" fill="#2563EB" stroke="#93C5FD" strokeWidth="0.5" />

        {/* Floating Cx key icon - left */}
        <motion.g
          animate={enableMotion ? { y: [0, -3, 0] } : undefined}
          transition={enableMotion ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        >
          <rect x="5" y="35" width="14" height="10" rx="2" fill="#0A1628" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
          <text x="12" y="42.5" textAnchor="middle" fill="#60A5FA" fontSize="5" fontWeight="bold" fontFamily="monospace" opacity="0.6">Cx</text>
        </motion.g>

        {/* Floating Cx key icon - right */}
        <motion.g
          animate={enableMotion ? { y: [0, -3, 0] } : undefined}
          transition={enableMotion ? { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 } : { duration: 0 }}
        >
          <rect x="101" y="35" width="14" height="10" rx="2" fill="#0A1628" stroke="#60A5FA" strokeWidth="0.5" opacity="0.6" />
          <text x="108" y="42.5" textAnchor="middle" fill="#60A5FA" fontSize="5" fontWeight="bold" fontFamily="monospace" opacity="0.6">Cx</text>
        </motion.g>
      </svg>
    </motion.div>
  );
}
