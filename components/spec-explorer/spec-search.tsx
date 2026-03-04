"use client";

import { useRef, useEffect, useCallback } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { Search, X } from "lucide-react";

interface SpecSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SpecSearch({ value, onChange }: SpecSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: {
      query: value,
    },
    onSubmit: async () => {},
  });
  const query = useStore(form.store, (state) => state.values.query);

  useEffect(() => {
    if (query !== value) {
      onChange(query);
    }
  }, [onChange, query, value]);

  useEffect(() => {
    if (value !== query) {
      form.setFieldValue("query", value);
    }
  }, [form, query, value]);

  const handleClear = useCallback(() => {
    form.setFieldValue("query", "");
    inputRef.current?.focus();
  }, [form]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        handleClear();
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handleClear]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
      <form.Field name="query">
        {(field) => (
          <input
            ref={inputRef}
            type="text"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            placeholder="Search docs…"
            aria-label="Search spec documents"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.07] transition-all font-medium"
          />
        )}
      </form.Field>
      {query && (
        <button
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {!query && (
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-600 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded pointer-events-none">
          /
        </kbd>
      )}
    </div>
  );
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || (el as HTMLElement).isContentEditable;
}
