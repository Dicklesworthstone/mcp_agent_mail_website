"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ColumnDef, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ChevronRight, ArrowLeft, Loader2, AlertCircle,
  BookOpen, Shield, Beaker, Wrench, Code2, Network, FlaskConical,
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";
import { specDocs, specCategories, type SpecDoc, type SpecCategory } from "@/lib/spec-docs";
import { SyncContainer } from "@/components/sync-elements";
import GlitchText from "@/components/glitch-text";
import { Magnetic } from "@/components/motion-wrapper";
import SpecSearch from "./spec-search";

const categoryIcons: Record<SpecCategory, React.ComponentType<{ className?: string }>> = {
  "Formal Semantics": BookOpen,
  "Testing": Beaker,
  "Security": Shield,
  "RaptorQ": Network,
  "Spork": FlaskConical,
  "Operations": Wrench,
  "Development": Code2,
};

marked.setOptions({
  gfm: true,
  breaks: true,
});

type GroupedDocs = Partial<Record<SpecCategory, SpecDoc[]>>;

type SidebarItem =
  | { id: string; type: "heading"; category: SpecCategory }
  | { id: string; type: "doc"; category: SpecCategory; doc: SpecDoc };

async function loadSpecDocHtml(filename: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch(`/spec-docs/${filename}`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load ${filename}`);
  }

  const text = await res.text();
  const html = await marked.parse(text);
  return DOMPurify.sanitize(html);
}

export default function SpecViewer() {
  const queryClient = useQueryClient();
  const [activeDoc, setActiveDoc] = useState<SpecDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SpecCategory | "All">("All");
  const specColumns = useMemo<ColumnDef<SpecDoc>[]>(
    () => [
      { accessorKey: "title" },
      { accessorKey: "description" },
      { accessorKey: "category" },
      { accessorKey: "order" },
      { accessorKey: "filename" },
    ],
    []
  );
  const categoryFilter = activeCategory === "All"
    ? []
    : [{ id: "category", value: activeCategory }];
  // eslint-disable-next-line react-hooks/incompatible-library
  const specTable = useReactTable({
    data: specDocs,
    columns: specColumns,
    state: {
      globalFilter: searchQuery,
      columnFilters: categoryFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "").trim().toLowerCase();
      if (!q) return true;

      const { title, description, category } = row.original;
      return (
        title.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q)
      );
    },
  });

  const filteredDocs = specTable
    .getFilteredRowModel()
    .rows
    .map((row) => row.original)
    .toSorted((a, b) => a.order - b.order);

  const groupedDocs = useMemo<GroupedDocs>(() => {
    const groups: GroupedDocs = {};
    for (const doc of filteredDocs) {
      const category = doc.category as SpecCategory;
      if (!groups[category]) groups[category] = [];
      groups[category]!.push(doc);
    }
    return groups;
  }, [filteredDocs]);

  const activeFilename = activeDoc?.filename ?? null;
  const { data: markdown = "", isPending: loading, error: queryError } = useQuery({
    queryKey: ["spec-doc", activeFilename],
    queryFn: ({ signal }) => loadSpecDocHtml(activeFilename!, signal),
    enabled: !!activeFilename,
    staleTime: Infinity,
  });
  const error = queryError instanceof Error ? queryError.message : null;

  const prefetchDoc = (doc: SpecDoc) => {
    void queryClient.prefetchQuery({
      queryKey: ["spec-doc", doc.filename],
      queryFn: ({ signal }) => loadSpecDocHtml(doc.filename, signal),
      staleTime: Infinity,
    });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeDoc) {
        setActiveDoc(null);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [activeDoc]);

  return (
    <div
      id="spec-explorer-workspace"
      data-scaffold-slot="workspace"
      className="min-h-[80vh]"
    >
      {/* Mobile: full-width list → detail pattern */}
      <section id="spec-mobile-shell" className="lg:hidden">
        <AnimatePresence mode="wait">
          {activeDoc ? (
            <motion.div
              id="spec-mobile-reader"
              key="detail"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setActiveDoc(null)}
                className="flex items-center gap-2 text-sm font-bold text-blue-400 mb-6 hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to docs
              </button>
              <DocHeader doc={activeDoc} />
              <DocContent html={markdown} loading={loading} error={error} />
            </motion.div>
          ) : (
            <motion.div
              id="spec-mobile-index"
              key="list"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <Sidebar
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                groupedDocs={groupedDocs}
                activeDoc={activeDoc}
                onSelect={setActiveDoc}
                onPrefetch={prefetchDoc}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Desktop: sidebar + panel */}
      <section id="spec-desktop-shell" className="hidden lg:grid lg:grid-cols-[340px,1fr] gap-0">
        <aside id="spec-desktop-index" className="border-r border-white/5 pr-0 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <div className="pr-6">
            <Sidebar
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              groupedDocs={groupedDocs}
              activeDoc={activeDoc}
              onSelect={setActiveDoc}
              onPrefetch={prefetchDoc}
            />
          </div>
        </aside>
        <section id="spec-desktop-reader" className="pl-8 overflow-y-auto max-h-[85vh] custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                key={activeDoc.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DocHeader doc={activeDoc} />
                <DocContent html={markdown} loading={loading} error={error} />
              </motion.div>
            ) : (
              <motion.div
                id="spec-desktop-empty-state"
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center"
              >
                <FileText className="h-16 w-16 text-blue-500/20 mb-6" />
                <h3 className="text-2xl font-black text-white mb-3">Select a Document</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  Choose a spec doc from the sidebar to view its contents.
                  Use <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold">/</kbd> to search.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </section>
    </div>
  );
}

function Sidebar({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  groupedDocs,
  activeDoc,
  onSelect,
  onPrefetch,
}: {
  activeCategory: SpecCategory | "All";
  setActiveCategory: (c: SpecCategory | "All") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  groupedDocs: GroupedDocs;
  activeDoc: SpecDoc | null;
  onSelect: (doc: SpecDoc) => void;
  onPrefetch: (doc: SpecDoc) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  const sidebarItems = useMemo<SidebarItem[]>(() => {
    const items: SidebarItem[] = [];

    for (const category of specCategories) {
      const docs = groupedDocs[category];
      if (!docs || docs.length === 0) continue;

      items.push({ id: `heading-${category}`, type: "heading", category });
      for (const doc of docs) {
        items.push({ id: doc.slug, type: "doc", category, doc });
      }
    }

    return items;
  }, [groupedDocs]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: sidebarItems.length,
    getScrollElement: () => listRef.current,
    estimateSize: (index) => (sidebarItems[index]?.type === "heading" ? 34 : 82),
    overscan: 8,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowVirtualizer, sidebarItems.length]);

  return (
    <div className="space-y-6">
      <SpecSearch value={searchQuery} onChange={setSearchQuery} />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5">
        <CategoryTab
          label="All"
          active={activeCategory === "All"}
          onClick={() => setActiveCategory("All")}
          count={specDocs.length}
        />
        {specCategories.map((cat) => {
          const count = specDocs.filter((d) => d.category === cat).length;
          return (
            <CategoryTab
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              count={count}
            />
          );
        })}
      </div>

      {/* Doc list */}
      {sidebarItems.length > 0 ? (
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          <div
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const item = sidebarItems[virtualItem.index]!;

              return (
                <div
                  key={item.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualItem.index}
                  className="absolute left-0 top-0 w-full"
                  style={{ transform: `translateY(${virtualItem.start}px)` }}
                >
                  {item.type === "heading" ? (
                    <CategoryHeading category={item.category} />
                  ) : (
                    <DocListItem
                      doc={item.doc}
                      active={activeDoc?.slug === item.doc.slug}
                      onSelect={onSelect}
                      onPrefetch={onPrefetch}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-600">No docs match your search.</p>
        </div>
      )}
    </div>
  );
}

function CategoryHeading({ category }: { category: SpecCategory }) {
  const CatIcon = categoryIcons[category] || FileText;

  return (
    <div className="flex items-center gap-2 pb-2 pt-4 px-1">
      <CatIcon className="h-3.5 w-3.5 text-blue-500/60" />
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
        {category}
      </span>
    </div>
  );
}

function DocListItem({
  doc,
  active,
  onSelect,
  onPrefetch,
}: {
  doc: SpecDoc;
  active: boolean;
  onSelect: (doc: SpecDoc) => void;
  onPrefetch: (doc: SpecDoc) => void;
}) {
  return (
    <div className="pb-1">
      <Magnetic strength={0.05}>
        <button
          onClick={() => onSelect(doc)}
          onMouseEnter={() => onPrefetch(doc)}
          onFocus={() => onPrefetch(doc)}
          className={cn(
            "w-full text-left p-3 rounded-xl border transition-all group",
            active
              ? "bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
              : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
          )}
        >
          <div className="flex items-center justify-between">
            <h4
              className={cn(
                "text-sm font-bold transition-colors line-clamp-1",
                active ? "text-blue-400" : "text-white group-hover:text-blue-400"
              )}
            >
              {doc.title}
            </h4>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-all",
                active ? "text-blue-400 translate-x-0.5" : "text-slate-700 group-hover:text-slate-500"
              )}
            />
          </div>
          <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{doc.description}</p>
        </button>
      </Magnetic>
    </div>
  );
}

function CategoryTab({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
        active
          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
          : "bg-white/[0.03] text-slate-500 border border-transparent hover:bg-white/[0.06] hover:text-slate-400"
      )}
    >
      {label}
      <span className="ml-1 opacity-50">{count}</span>
    </button>
  );
}

function DocHeader({ doc }: { doc: SpecDoc }) {
  const CatIcon = categoryIcons[doc.category as SpecCategory] || FileText;
  return (
    <div className="mb-8 pb-8 border-b border-white/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <CatIcon className="h-3 w-3 text-blue-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">{doc.category}</span>
        </div>
        <span className="text-[9px] font-mono text-slate-700">{doc.filename}</span>
      </div>
      <GlitchText trigger="hover" intensity="low">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{doc.title}</h1>
      </GlitchText>
      <p className="text-sm text-slate-400 mt-3 font-medium">{doc.description}</p>
    </div>
  );
}

function DocContent({
  html,
  loading,
  error,
}: {
  html: string;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <SyncContainer className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-4" />
        <p className="text-sm text-red-400 font-bold">{error}</p>
      </SyncContainer>
    );
  }

  return (
    <div
      className="spec-prose pb-16"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
