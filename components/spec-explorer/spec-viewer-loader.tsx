"use client";

import dynamic from "next/dynamic";
import { motion, staggerContainer, staggerFast, fadeUp } from "@/components/motion";
import { cn } from "@/lib/utils";

const SpecViewer = dynamic(
  () => import("@/components/spec-explorer/spec-viewer"),
  {
    ssr: false,
    loading: () => <SpecViewerSkeleton />,
  }
);

export default function SpecViewerLoader() {
  return <SpecViewer />;
}

function SpecViewerSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_20px_80px_-45px_rgba(59,130,246,0.45)]"
    >
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-white/5 bg-white/[0.02] p-4">
          <div className="h-10 rounded-2xl bg-white/[0.05]" />
          <div className="space-y-3">
            <div className="h-16 rounded-2xl bg-white/[0.04]" />
            <div className="h-16 rounded-2xl bg-white/[0.04]" />
            <div className="h-16 rounded-2xl bg-white/[0.04]" />
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/5 bg-black/30 p-5">
          <div className="h-8 w-40 rounded-full bg-blue-500/10" />
          <div className="h-12 w-3/4 rounded-2xl bg-white/[0.05]" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-full bg-white/[0.04]" />
            <div className="h-4 w-11/12 rounded-full bg-white/[0.04]" />
            <div className="h-4 w-5/6 rounded-full bg-white/[0.04]" />
          </div>
          <div className="h-36 rounded-[1.5rem] border border-dashed border-blue-500/20 bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}

export function AnimatedHeroContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

export function AnimatedSurfaceSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const ACCENT_HOVER: Record<string, string> = {
  blue: "hover:border-blue-500/30 hover:shadow-[0_0_30px_-12px_rgba(59,130,246,0.4)]",
  green: "hover:border-green-500/30 hover:shadow-[0_0_30px_-12px_rgba(34,197,94,0.4)]",
  orange: "hover:border-orange-500/30 hover:shadow-[0_0_30px_-12px_rgba(249,115,22,0.4)]",
  purple: "hover:border-purple-500/30 hover:shadow-[0_0_30px_-12px_rgba(168,85,247,0.4)]",
};

export function SurfaceGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerFast} className={className}>
      {children}
    </motion.div>
  );
}

export function SurfaceCard({
  children,
  className,
  accentColor = "blue",
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "green" | "orange" | "purple";
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300",
        "hover:-translate-y-1 hover:bg-white/[0.04]",
        ACCENT_HOVER[accentColor],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
