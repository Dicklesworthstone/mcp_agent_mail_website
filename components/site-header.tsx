"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Eye, Cpu, Zap, ChevronRight, Globe, Sparkles, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { navItems, siteConfig } from "@/lib/content";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";
import { SyncNode, DataPulse } from "./sync-elements";
import { useSite } from "@/lib/site-state";
import { Magnetic } from "./motion-wrapper";

const ICON_MAP: Record<string, React.ElementType> = {
  home: Home,
  showcase: Sparkles,
  architecture: Cpu,
  'spec explorer': BookOpen,
  glossary: BookOpen,
  'get started': Zap,
};

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toggleLabMode, isLabMode, isAudioEnabled, toggleAudio } = useSite();
  const brandGlyph = siteConfig.name.charAt(0).toUpperCase();

  useBodyScrollLock(open);

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 20;
      setScrolled((prev) => (prev === next ? prev : next));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <div className="fixed top-0 left-0 right-0 z-50 hidden md:block pointer-events-none h-24">
        <header
          className={cn(
            "absolute top-6 left-1/2 -translate-x-1/2 flex items-center transition-all duration-500 pointer-events-auto",
            "w-[95%] lg:w-[1200px] h-16 px-8 rounded-full border border-white/5",
            scrolled ? "glass-modern shadow-2xl scale-[0.98] border-blue-500/20" : "bg-transparent border-transparent"
          )}
        >
          {scrolled && (
            <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
              <DataPulse color="#3B82F6" className="opacity-40" />
              <motion.div
                animate={{ left: ["-10%", "110%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 h-[1.5px] w-[80px] bg-gradient-to-r from-transparent via-blue-400 to-transparent z-20"
              />
              <motion.div
                animate={{ left: ["110%", "-10%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                className="absolute bottom-0 h-[1.5px] w-[100px] bg-gradient-to-r from-transparent via-orange-400 to-transparent z-20"
              />
              <div className="absolute inset-0 bg-blue-500/[0.02] shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]" />
            </div>
          )}

          <div className="grid grid-cols-3 w-full relative z-10 h-full items-center">
            {/* Logo */}
            <div className="flex justify-start">
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 shadow-lg transition-transform group-hover:scale-105 active:scale-95 overflow-visible">
                  <SyncNode color="#3B82F6" baseScale={0.5} className="absolute -left-1 -top-1 z-20" />
                  <SyncNode color="#3B82F6" baseScale={0.5} className="absolute -right-1 -bottom-1 z-20" />
                  <span className="text-lg font-black text-white select-none">{brandGlyph}</span>
                </div>
                <div className="flex flex-col text-left justify-center">
                  <span className="text-sm font-black tracking-tight text-white uppercase leading-none">
                    {siteConfig.name}
                  </span>
                  <motion.span
                    animate={{ opacity: [1, 0.4, 1, 0.8, 1] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.15, 0.2, 1] }}
                    className="text-[7px] font-black text-blue-500 uppercase tracking-widest leading-none mt-1"
                  >
                    AGENT_MAIL_ACTIVE
                  </motion.span>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex items-center justify-center gap-1 h-full">
              {navItems.map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 h-9 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.15em] transition-colors rounded-full relative",
                      active ? "text-blue-400 bg-blue-500/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-4 right-4 h-px bg-blue-500 shadow-[0_0_8px_#3B82F6]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Tools */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <button onClick={toggleLabMode} aria-label="Toggle Lab Mode" aria-pressed={isLabMode} className={cn("p-2 rounded-lg transition-colors", isLabMode ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-white hover:bg-white/5")}>
                <Eye className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <Magnetic strength={0.1}>
                <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full bg-white text-black text-[10px] font-black hover:bg-blue-400 transition-all active:scale-95 uppercase tracking-widest">
                  GITHUB
                </a>
              </Magnetic>
            </div>
          </div>
        </header>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] pointer-events-none">
        <nav className="glass-modern h-16 rounded-2xl border border-white/10 flex items-center justify-around px-2 pointer-events-auto shadow-2xl">
          {navItems.slice(0, 4).map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = ICON_MAP[item.label.toLowerCase()] ?? Globe;
            const shortLabel: Record<string, string> = {
              "Home": "Home",
              "Showcase": "Show",
              "Architecture": "Arch.",
              "Get Started": "Start",
              "Glossary": "Gloss.",
            };
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90",
                  active ? "text-blue-400" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-[7px] font-black uppercase tracking-tighter">{shortLabel[item.label] ?? item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-slate-500 active:scale-90"
          >
            <Menu className="h-5 w-5 mb-1" />
            <span className="text-[7px] font-black uppercase tracking-tighter">MORE</span>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md z-[70] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] z-[80] bg-[#020a14] border-l border-blue-500/20 p-8 flex flex-col md:hidden pointer-events-auto text-left"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-xs font-black text-blue-500 uppercase tracking-[0.4em]">MAIL_MENU</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation menu" className="p-2 text-slate-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between"
                  >
                    <span className={cn("text-2xl font-black uppercase tracking-tighter", pathname === item.href ? "text-blue-400" : "text-slate-500")}>
                      {item.label}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-800" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={toggleLabMode} aria-pressed={isLabMode} className={cn("p-4 rounded-xl border text-[10px] font-black transition-all", isLabMode ? "bg-blue-500 text-white border-blue-400" : "bg-white/5 border-white/10 text-slate-400")}>LAB MODE</button>
                  <button type="button" onClick={toggleAudio} aria-pressed={isAudioEnabled} className={cn("p-4 rounded-xl border text-[10px] font-black transition-all", isAudioEnabled ? "bg-blue-500 text-white border-blue-400" : "bg-white/5 border-white/10 text-slate-400")}>AUDIO</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
