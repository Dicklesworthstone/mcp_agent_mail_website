"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState, useRef, useMemo } from "react";
import { useReducedMotion } from "@/components/motion";

const GLYPHS = "0123456789ABCDEF$#@&*<>[]{}";

export default function DecodingText({
  text,
  className,
  delay = 0,
  duration = 1000,
}: {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [animatedText, setAnimatedText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const displayText = prefersReducedMotion ? text : animatedText;
  const chars = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const startAnimation = () => {
      setIsAnimating(true);
      startTimeRef.current = null;
      frameRef.current = requestAnimationFrame(animate);
    };

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      let nextText = "";
      for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        if (char === " ") {
          nextText += " ";
          continue;
        }
        const revealThreshold = i / chars.length;
        if (progress > revealThreshold) {
          nextText += char;
        } else {
          nextText += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }

      setAnimatedText(nextText);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedText(text);
        setIsAnimating(false);
      }
    };

    const timer = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timer);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      setIsAnimating(false);
    };
  }, [text, chars, delay, duration, prefersReducedMotion]);

  return (
    <span
      className={cn(
        "inline-block font-mono",
        isAnimating ? "text-blue-400/80" : className
      )}
    >
      {displayText}
    </span>
  );
}
