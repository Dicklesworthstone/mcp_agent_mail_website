"use client";

import { useEffect, useRef, useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { motion, useTransform, useSpring, useMotionValue, useReducedMotion } from "framer-motion";

const SPECTRUM = ["#3B82F6", "#60A5FA", "#F97316", "#93C5FD", "#2563EB", "#FB923C", "#1D4ED8", "#38bdf8"];

export default function GlowOrbits() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { ref: observerRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    triggerOnce: false,
  });
  const prefersReducedMotion = useReducedMotion();
  const [parallaxReady, setParallaxReady] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 100 });

  const parallaxX = useTransform(springX, (val) => {
    if (typeof window === "undefined") return 0;
    return (val / window.innerWidth - 0.5) * -60;
  });
  const parallaxY = useTransform(springY, (val) => {
    if (typeof window === "undefined") return 0;
    return (val / window.innerHeight - 0.5) * -60;
  });

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) {
      setParallaxReady(false);
      return;
    }

    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
    setParallaxReady(true);
  }, [mouseX, mouseY, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    if (!isIntersecting) return undefined;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, isIntersecting, prefersReducedMotion]);

  useEffect(() => {
    if (!rootRef.current) return;
    if (prefersReducedMotion) return;
    if (!isIntersecting) return;

    const rings = rootRef.current.querySelectorAll<HTMLElement>(".glow-ring");
    if (rings.length === 0) return;

    const animations: Animation[] = [];

    rings.forEach((ring, i) => {
      const animation = ring.animate(
        [
          { transform: "rotate(0deg) scale(1)", opacity: 0.1 },
          { transform: "rotate(180deg) scale(1.15)", opacity: 0.25 },
          { transform: "rotate(360deg) scale(1)", opacity: 0.1 },
        ],
        {
          duration: 30000 + i * 8000,
          iterations: Infinity,
          easing: "ease-in-out",
        }
      );
      animations.push(animation);
    });

    return () => animations.forEach(a => a.cancel());
  }, [prefersReducedMotion, isIntersecting]);

  return (
    <motion.div
      ref={(node) => {
        rootRef.current = node as HTMLDivElement;
        observerRef(node as HTMLDivElement);
      }}
      style={!prefersReducedMotion && parallaxReady ? { x: parallaxX, y: parallaxY } : undefined}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="glow-ring absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full blur-[120px]"
           style={{ background: `radial-gradient(circle at center, ${SPECTRUM[0]}33, transparent 70%)` }} />
      <div className="glow-ring absolute -bottom-[20%] -right-[10%] h-[70%] w-[70%] rounded-full blur-[140px]"
           style={{ background: `radial-gradient(circle at center, ${SPECTRUM[2]}22, transparent 70%)` }} />
      <div className="glow-ring absolute top-1/2 left-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
           style={{ background: `radial-gradient(circle at center, ${SPECTRUM[4]}11, transparent 70%)` }} />

      <motion.div
        animate={isIntersecting
          ? { scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }
          : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 10, repeat: isIntersecting ? Infinity : 0 }}
        className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-[100px]"
      />
      <motion.div
        animate={isIntersecting
          ? { scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }
          : { scale: 1, opacity: 0.1 }}
        transition={{ duration: 12, repeat: isIntersecting ? Infinity : 0, delay: isIntersecting ? 2 : 0 }}
        className="absolute bottom-1/4 left-1/3 h-80 w-80 rounded-full bg-orange-500/15 blur-[110px]"
      />
    </motion.div>
  );
}
