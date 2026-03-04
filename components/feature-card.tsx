"use client";

import React, { useCallback, useMemo } from "react";
import { Terminal, Cpu, Lock, Shield, Blocks, Sparkles, Activity, Globe } from "lucide-react";
import type { Feature } from "@/lib/content";
import { SyncNode, SyncContainer } from "./sync-elements";
import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import GlitchText from "./glitch-text";
import { useSite } from "@/lib/site-state";

const iconMap: Record<string, React.ElementType> = {
  terminal: Terminal, cpu: Cpu, lock: Lock, shield: Shield,
  blocks: Blocks, sparkles: Sparkles, activity: Activity, globe: Globe,
};

const SPECTRUM = ["#3B82F6", "#60A5FA", "#F97316", "#93C5FD", "#2563EB", "#FB923C", "#38bdf8", "#1D4ED8"];

export default function FeatureCard({ feature }: { feature: Feature }) {
  const { isLabMode } = useSite();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const titleId = `feature-title-${feature.title.toLowerCase().replace(/\s+/g, "-")}`;

  const accentColor = useMemo(() => {
    const hash = feature.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return SPECTRUM[hash % SPECTRUM.length];
  }, [feature.title]);

  const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, ${accentColor}15, transparent 80%)`;

  const updateMousePos = useCallback((clientX: number, clientY: number, currentTarget: HTMLElement) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }, [mouseX, mouseY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    updateMousePos(e.clientX, e.clientY, e.currentTarget);
  }, [updateMousePos]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    updateMousePos(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
  }, [updateMousePos]);

  const anatomyData = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      left: Math.random().toString(16).substring(2, 40),
      right: Math.random().toString(16).substring(2, 40),
    }));
  }, []);

  const Icon = iconMap[feature.icon] || Sparkles;

  return (
    <article
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchMove}
      aria-labelledby={titleId}
      className="group relative h-full rounded-[2rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden kinetic-card"
    >
      <SyncContainer withPulse={true} accentColor={accentColor} className="h-full border-none bg-white/[0.02] group-hover:bg-white/[0.04] transition-all duration-500 p-8 md:p-10 group-hover:border-white/10">
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background }}
        />

      <AnimatePresence>
        {isLabMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0 p-8 pointer-events-none overflow-hidden"
          >
            <div className="w-full h-full font-mono text-[8px] whitespace-pre leading-none" style={{ color: `${accentColor}33` }}>
              {anatomyData.map((data, i) => (
                <div key={i}>{data.left}{data.right}</div>
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" style={{ color: accentColor }}>
              <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <path d="M 10 10 L 90 90 M 90 10 L 10 90" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-10">
          <GlitchText trigger="hover" intensity="medium">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                backgroundColor: `${accentColor}20`,
                borderColor: `${accentColor}30`,
                color: accentColor,
                boxShadow: `0 0 20px ${accentColor}20`
              }}
            >
              <Icon className="h-6 w-6" />
            </div>
          </GlitchText>
          <div className="h-px w-12 bg-gradient-to-r from-white/10 to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${accentColor}40, transparent)` }} />
        </div>

        <motion.h3
          id={titleId}
          className="text-2xl font-black tracking-tight text-white mb-4 transition-colors"
          whileHover={{ color: accentColor }}
        >
          {feature.title}
        </motion.h3>

        <p className="text-slate-400 font-medium leading-relaxed mb-8 flex-1">
          {feature.description}
        </p>

        <motion.div
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition-colors"
          whileHover={{ color: accentColor }}
        >
          <Activity className="h-3 w-3" />
          <span>{feature.category ?? "Core Runtime Protocol"}</span>
        </motion.div>
      </div>

      <SyncNode color={accentColor} className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
      <SyncNode color={accentColor} className="absolute bottom-4 left-4 opacity-20 group-hover:opacity-100 transition-opacity" />
      </SyncContainer>
    </article>
  );
}
