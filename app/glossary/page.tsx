"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GlitchText from "@/components/glitch-text";
import { SyncContainer } from "@/components/sync-elements";
import { glossaryTerms, generalFaq, glossaryCrossLinks } from "@/lib/content";

type GlossaryRow =
  | { id: string; type: "heading"; letter: string }
  | { id: string; type: "term"; letter: string; term: (typeof glossaryTerms)[number] };

function FaqAccordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-blue-500/20 hover:bg-white/[0.04] transition-all"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white pr-4">{question}</h3>
        <span aria-hidden="true" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest shrink-0">
          {open ? "\u25BC" : "\u25B6"}
        </span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-300 mt-4 pt-4 border-t border-white/5 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function GlossaryPage() {
  const searchForm = useForm({
    defaultValues: {
      query: "",
    },
    onSubmit: async () => {},
  });
  const search = useStore(searchForm.store, (state) => state.values.query);
  const [selected, setSelected] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return glossaryTerms;
    const q = search.toLowerCase();
    return glossaryTerms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.short.toLowerCase().includes(q) ||
        t.long.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof glossaryTerms> = {};
    for (const term of filtered) {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const virtualRows = useMemo<GlossaryRow[]>(() => {
    const rows: GlossaryRow[] = [];
    for (const [letter, terms] of grouped) {
      rows.push({ id: `heading-${letter}`, type: "heading", letter });
      for (const term of terms) {
        rows.push({ id: term.term, type: "term", letter, term });
      }
    }
    return rows;
  }, [grouped]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => listRef.current,
    estimateSize: (index) => {
      const row = virtualRows[index];
      if (!row) return 96;
      if (row.type === "heading") return 44;
      return selected === row.term.term ? 180 : 104;
    },
    overscan: 10,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowVirtualizer, selected, virtualRows.length]);

  return (
    <main id="main-content">
      <section
        id="glossary-hero"
        data-scaffold-slot="hero"
        className="relative pt-32 pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <GlitchText trigger="hover" intensity="medium">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
              Glossary
            </h1>
          </GlitchText>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Key terms and concepts in MCP Agent Mail.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 pb-32">
        <section id="glossary-search" data-scaffold-slot="search-controls">
          <div className="sticky top-24 z-30 mb-12">
            <SyncContainer withNodes={false} withLines={false} className="glass-modern p-2">
              <div className="flex items-center gap-3 px-4">
                <Search className="h-5 w-5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => searchForm.setFieldValue("query", e.target.value)}
                  placeholder="Search terms..."
                  className="flex-1 bg-transparent text-white placeholder:text-slate-600 text-sm font-medium py-3 outline-none"
                />
                {search && (
                  <button
                    onClick={() => searchForm.setFieldValue("query", "")}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </SyncContainer>
          </div>
        </section>

        <section id="glossary-index" data-scaffold-slot="term-index" className="space-y-12">
          {virtualRows.length > 0 && (
            <div ref={listRef} className="max-h-[72vh] overflow-y-auto pr-2 custom-scrollbar">
              <div
                className="relative w-full"
                style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const row = virtualRows[virtualItem.index]!;

                  return (
                    <div
                      key={row.id}
                      ref={rowVirtualizer.measureElement}
                      data-index={virtualItem.index}
                      className="absolute left-0 top-0 w-full"
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                    >
                      {row.type === "heading" ? (
                        <h2 className="text-sm font-black text-blue-500/60 uppercase tracking-[0.4em] pb-3 pt-5">
                          {row.letter}
                        </h2>
                      ) : (
                        <motion.button
                          onClick={() => setSelected(selected === row.term.term ? null : row.term.term)}
                          whileHover={{ x: 4 }}
                          aria-expanded={selected === row.term.term}
                          className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:border-blue-500/20 hover:bg-white/[0.04] transition-all mb-3"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">{row.term.term}</h3>
                            <span aria-hidden="true" className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                              {selected === row.term.term ? "▼" : "▶"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{row.term.short}</p>

                          <AnimatePresence>
                            {selected === row.term.term && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <p className="text-sm text-slate-300 mt-4 pt-4 border-t border-white/5 leading-relaxed">
                                  {row.term.long}
                                </p>
                                {(() => {
                                  const crossLink = glossaryCrossLinks.find(cl => cl.term === row.term.term);
                                  if (!crossLink) return null;
                                  return (
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">See also:</span>
                                      {crossLink.links.map(link => (
                                        <a key={link.href} href={link.href} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                                          {link.label}
                                        </a>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section
          id="glossary-empty-state"
          data-scaffold-slot="empty-state"
          aria-live="polite"
          className={filtered.length === 0 ? "text-center py-20" : "hidden"}
        >
          <p className="text-slate-500 text-lg">No terms match &ldquo;{search}&rdquo;</p>
        </section>

        <section
          id="glossary-faq"
          data-scaffold-slot="faq-module"
          className="mt-16"
        >
          <h2 className="text-3xl font-black tracking-tight text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {generalFaq.map((item, i) => (
              <FaqAccordion key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
