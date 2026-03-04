"use client";

import { useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const CIRCLE_RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const visible = scrollY > 400;
    setIsVisible(visible);
    if (visible) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    let rafId = 0;

    const onScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = window.requestAnimationFrame(handleScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(rafId);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/20 backdrop-blur-xl transition-all active:scale-95 hover:border-blue-500/60 hover:bg-blue-500/20"
          aria-label="Scroll to top"
        >
          <svg
            className="absolute inset-0 h-12 w-12 -rotate-90"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="scroll-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
            <circle
              cx="24"
              cy="24"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="url(#scroll-progress-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
            />
          </svg>
          <ArrowUp className="relative h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
