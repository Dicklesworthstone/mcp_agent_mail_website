"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, FileText, List, ChevronRight } from "lucide-react";
import {
  heroVideoPlaceholder,
  heroDemoTranscript,
} from "@/lib/content";

export default function HeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const seekTo = useCallback((time: string) => {
    if (!videoRef.current) return;
    const [mins, rest] = time.split(":");
    const [secs] = rest.split(".");
    videoRef.current.currentTime = parseInt(mins) * 60 + parseInt(secs);
    videoRef.current.play();
    setIsPlaying(true);
    setShowChapters(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="relative">
      {/* Video container */}
      <div className="relative bg-[#020a14] p-6 md:p-8 overflow-hidden min-h-[300px] md:min-h-[420px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.10),transparent_55%)]" />
        <div className="relative h-full rounded-2xl border border-blue-500/25 bg-black/40 overflow-hidden">
          {prefersReducedMotion ? (
            /* Reduced motion fallback — static poster */
            <div className="h-full w-full min-h-[260px] md:min-h-[340px] flex items-center justify-center bg-black/60">
              <Image
                src={heroVideoPlaceholder.reducedMotionFallback}
                alt={heroVideoPlaceholder.ariaLabel}
                width={heroVideoPlaceholder.width}
                height={heroVideoPlaceholder.height}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              className="h-full w-full min-h-[260px] md:min-h-[340px] object-cover bg-black/60"
              controls
              playsInline
              muted
              preload="metadata"
              poster={heroVideoPlaceholder.poster}
              aria-label={heroVideoPlaceholder.ariaLabel}
              width={heroVideoPlaceholder.width}
              height={heroVideoPlaceholder.height}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={heroVideoPlaceholder.mediaSrc} type={heroVideoPlaceholder.mediaType} />
              {heroVideoPlaceholder.captionsTrack.map((track) => (
                <track
                  key={track.src}
                  src={track.src}
                  srcLang={track.srcLang}
                  label={track.label}
                  kind={track.kind}
                />
              ))}
            </video>
          )}

          {/* Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/85 to-transparent">
            <p className="text-xs md:text-sm font-bold text-white tracking-wide uppercase">
              {heroVideoPlaceholder.overlayTitle}
            </p>
            <p className="text-[10px] md:text-xs text-slate-300 mt-1 font-mono">
              {heroVideoPlaceholder.overlaySubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Media controls bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-white/5 bg-black/40">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          type="button"
          onClick={() => { setShowChapters(!showChapters); setShowTranscript(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            showChapters
              ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Toggle chapter list"
          aria-expanded={showChapters}
        >
          <List className="h-3 w-3" />
          Chapters
        </button>

        <button
          type="button"
          onClick={() => { setShowTranscript(!showTranscript); setShowChapters(false); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
            showTranscript
              ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
          aria-label="Toggle transcript"
          aria-expanded={showTranscript}
        >
          <FileText className="h-3 w-3" />
          Transcript
        </button>
      </div>

      {/* Expandable panels */}
      <AnimatePresence>
        {showChapters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-black/30"
          >
            <div className="p-4 space-y-1">
              {heroDemoTranscript.chapters.map((ch) => (
                <button
                  key={ch.startTime}
                  type="button"
                  onClick={() => seekTo(ch.startTime)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm hover:bg-white/5 transition-colors group"
                >
                  <span className="text-xs font-mono text-blue-400/60 tabular-nums w-14 shrink-0">
                    {ch.startTime.slice(0, 5)}
                  </span>
                  <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
                    {ch.title}
                  </span>
                  <ChevronRight className="h-3 w-3 text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {showTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/5 bg-black/30"
          >
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                {heroDemoTranscript.fullTranscript}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
