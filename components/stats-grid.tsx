"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { Stat } from "@/lib/content";
import { AnimatedNumber } from "@/components/animated-number";
import { SyncNode, SyncContainer, DataPulse } from "./sync-elements";
import GlitchText from "./glitch-text";

function parseStatValue(value: string): {
  number: number;
  suffix: string;
  isAnimatable: boolean;
} {
  const match = value.match(/^([0-9,.]+)(K|M|B)?(\+)?$/i);

  if (!match) {
    return { number: 0, suffix: value, isAnimatable: false };
  }

  const [, numStr, magnitude, plus] = match;
  const num = parseFloat(numStr.replace(/,/g, ""));
  const suffix = `${magnitude || ""}${plus || ""}`;

  return { number: num, suffix, isAnimatable: true };
}

export default function StatsGrid({ stats }: { stats: Stat[] }) {
  const containerRef = useRef<HTMLDListElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const parsedStats = useMemo(
    () => stats.map((stat) => ({ stat, parsed: parseStatValue(stat.value) })),
    [stats]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof IntersectionObserver === "undefined") {
      const hydrationId = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(hydrationId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: "0px" }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <SyncContainer withPulse={true} className="overflow-hidden border-blue-500/10">
      <dl
        ref={containerRef}
        className="grid gap-px overflow-hidden text-sm text-slate-200 sm:grid-cols-2 lg:grid-cols-4 bg-white/5"
      >
        {parsedStats.map(({ stat, parsed }, index) => (
          <div
            key={stat.label}
            className="group relative bg-[#020a14]/80 px-6 py-10 backdrop-blur transition-all duration-500 hover:bg-[#020a14]/40"
          >
            <DataPulse className="opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-x-0 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-blue-400 via-orange-400 to-blue-400 transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />

            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <SyncNode className="absolute top-2 right-2 opacity-10 group-hover:opacity-100 transition-opacity scale-75" />
            <SyncNode className="absolute bottom-2 left-2 opacity-10 group-hover:opacity-100 transition-opacity scale-75" />

            <dt className="relative z-10">
              <GlitchText trigger="hover" intensity="low">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 transition-colors group-hover:text-blue-400/70">
                  {stat.label}
                </span>
              </GlitchText>
            </dt>
            <dd className="relative z-10 mt-4 text-4xl font-black tracking-tight text-white transition-[filter] duration-500 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] sm:text-5xl tabular-nums">
              {parsed.isAnimatable ? (
                <AnimatedNumber
                  value={parsed.number}
                  suffix={parsed.suffix}
                  duration={2000 + index * 200}
                  isVisible={isVisible}
                />
              ) : (
                stat.value
              )}
            </dd>
            {stat.helper && (
              <p className="relative z-10 mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 leading-relaxed group-hover:text-slate-400 transition-colors">
                {stat.helper}
              </p>
            )}
          </div>
        ))}
      </dl>
    </SyncContainer>
  );
}
