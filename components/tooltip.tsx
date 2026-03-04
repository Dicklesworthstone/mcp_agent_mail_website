"use client";

import { ReactNode } from "react";
import { glossaryTerms } from "@/lib/content";
import { Info } from "lucide-react";

interface TooltipProps {
  term: string;
  children: ReactNode;
}

export function Tooltip({ term, children }: TooltipProps) {
  const glossaryItem = glossaryTerms.find((t) => t.term.toLowerCase() === term.toLowerCase());

  if (!glossaryItem) return <>{children}</>;

  return (
    <span className="group relative inline-block cursor-help border-b border-dashed border-blue-400/50 text-blue-100 transition-colors hover:border-blue-400 hover:text-blue-300">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 scale-95 opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 md:w-80">
        <span className="block rounded-xl border border-blue-500/20 bg-black/90 p-4 text-sm text-slate-300 shadow-xl shadow-blue-900/20 backdrop-blur-md">
          <strong className="mb-1 flex items-center gap-1.5 text-blue-400">
            <Info className="h-4 w-4" />
            {glossaryItem.term}
          </strong>
          <span className="block mb-2 text-xs font-medium text-slate-400">
            {glossaryItem.short}
          </span>
          <span className="block leading-relaxed">
            {glossaryItem.long}
          </span>
        </span>
        <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-blue-500/20 bg-black/90" />
      </span>
    </span>
  );
}
