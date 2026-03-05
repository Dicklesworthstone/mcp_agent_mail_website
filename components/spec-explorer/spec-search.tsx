"use client";

import { useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { isTextInputLike } from "@/lib/utils";

interface SpecSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SpecSearch({ value, onChange }: SpecSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.repeat &&
        !event.isComposing &&
        !isTextInputLike(document.activeElement)
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        event.preventDefault();
        event.stopPropagation();
        handleClear();
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyboardShortcut);
    return () => document.removeEventListener("keydown", handleKeyboardShortcut);
  }, [handleClear]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search docs by title, category, or description"
        aria-label="Search spec documents"
        className="w-full rounded-xl border border-white/10 bg-black/35 py-2.5 pr-11 pl-10 text-sm font-medium text-slate-100 placeholder:text-slate-500 transition-all focus:border-blue-400/45 focus:bg-black/55 focus:outline-none"
      />

      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:border-white/25 hover:text-white"
        >
          <X className="h-3 w-3" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
          /
        </kbd>
      )}
    </div>
  );
}
