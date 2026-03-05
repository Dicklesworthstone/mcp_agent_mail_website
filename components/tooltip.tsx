"use client";

import { ReactNode, useId } from "react";
import { glossaryTerms } from "@/lib/content";
import { Info } from "lucide-react";

interface TooltipProps {
  term: string;
  children: ReactNode;
}

const glossaryByTerm = new Map(
  glossaryTerms.map((item) => [item.term.toLowerCase(), item] as const)
);
const warnedMissingTerms = new Set<string>();

export function Tooltip({ term, children }: TooltipProps) {
  const tooltipId = useId();
  const glossaryItem = glossaryByTerm.get(term.toLowerCase());
  if (!glossaryItem) {
    if (process.env.NODE_ENV !== "production") {
      const key = term.toLowerCase();
      if (!warnedMissingTerms.has(key)) {
        warnedMissingTerms.add(key);
        // Surface missing glossary coverage during development without breaking UX.
        console.warn(`[Tooltip] Missing glossary definition for term: "${term}"`);
      }
    }
    return <>{children}</>;
  }

  return (
    <span
      tabIndex={0}
      aria-describedby={tooltipId}
      className="group relative inline-block cursor-help border-b border-dashed transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-400/50 focus-visible:rounded-sm"
      style={{
        borderColor: "rgba(96,165,250,0.5)",
        color: "rgb(219 234 254)",
      }}
    >
      {children}
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 scale-95 select-none opacity-0 transition-all duration-200 [@media(hover:hover)]:group-hover:visible [@media(hover:hover)]:group-hover:scale-100 [@media(hover:hover)]:group-hover:opacity-100 group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100 md:w-80"
      >
        <span className="block rounded-xl border border-blue-500/20 bg-black/90 p-4 text-sm text-slate-300 shadow-xl shadow-blue-900/20 backdrop-blur-md break-words">
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
