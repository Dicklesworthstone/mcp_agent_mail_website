"use client";

import { useEffect, useId, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Activity } from "lucide-react";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { Portal } from "@/components/motion-wrapper";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const prefersReducedMotion = useReducedMotion();
  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[999] flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={onClose}
              aria-hidden
            />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-label={title ? undefined : "Details"}
              aria-labelledby={title ? headingId : undefined}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: "spring", damping: 30, stiffness: 300, mass: 0.8 }
              }
              className="relative z-10 w-full max-h-[92vh] overflow-hidden rounded-t-[2.5rem] border-t border-blue-500/20 bg-[#020a14] shadow-[0_-20px_80px_rgba(0,0,0,0.8)] flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/5 bg-[#020a14]/90 px-8 py-6 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Activity size={20} />
                  </div>
                  {title && (
                    <h3 id={headingId} className="text-xl font-black uppercase tracking-widest text-white">
                      {title}
                    </h3>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all group"
                  aria-label="Close"
                >
                  <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div className="mx-auto max-w-4xl w-full">
                  {children}
                </div>
              </div>

              {/* Decorative Footer Detail */}
              <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500/40" />
                  <span>Sync_Protocol_Secure</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-1 w-4 rounded-full bg-white/5" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
