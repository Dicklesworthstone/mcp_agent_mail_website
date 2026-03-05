"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ComponentType,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  Shield,
  Beaker,
  Wrench,
  Code2,
  Network,
  FlaskConical,
} from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { cn, isTextInputLike } from "@/lib/utils";
import {
  specDocs,
  specCategories,
  type SpecDoc,
  type SpecCategory,
} from "@/lib/spec-docs";
import { SyncContainer } from "@/components/sync-elements";
import GlitchText from "@/components/glitch-text";
import { Magnetic } from "@/components/motion-wrapper";
import SpecSearch from "./spec-search";

const categoryIcons: Record<SpecCategory, ComponentType<{ className?: string }>> = {
  "Formal Semantics": BookOpen,
  Testing: Beaker,
  Security: Shield,
  RaptorQ: Network,
  Spork: FlaskConical,
  Operations: Wrench,
  Development: Code2,
};

marked.setOptions({
  gfm: true,
  breaks: true,
});

const CATEGORY_COUNTS: Record<SpecCategory, number> = Object.fromEntries(
  specCategories.map((cat) => [cat, specDocs.filter((doc) => doc.category === cat).length]),
) as Record<SpecCategory, number>;

type GroupedDocs = Partial<Record<SpecCategory, SpecDoc[]>>;

type SidebarItem =
  | { id: string; type: "heading"; category: SpecCategory }
  | { id: string; type: "doc"; category: SpecCategory; doc: SpecDoc };

const PANEL_TRANSITION = { duration: 0.24, ease: "easeOut" } as const;
const SPEC_DOC_FILENAME_PATTERN = /^[A-Za-z0-9._-]+\.md$/;
const SANITIZED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|\/(?!\/)|#)/i;

async function loadSpecDocHtml(filename: string, signal?: AbortSignal): Promise<string> {
  if (!SPEC_DOC_FILENAME_PATTERN.test(filename)) {
    throw new Error("Invalid spec document filename");
  }

  const response = await fetch(`/spec-docs/${encodeURIComponent(filename)}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`);
  }

  const markdown = await response.text();
  const html = await marked.parse(markdown);
  const sanitized = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: [
      "script",
      "style",
      "form",
      "input",
      "button",
      "textarea",
      "select",
      "option",
      "fieldset",
      "legend",
    ],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick", "action", "formaction"],
    ALLOWED_URI_REGEXP: SANITIZED_URI_REGEXP,
  });
  return normalizeRenderedLinks(sanitized);
}

function normalizeRenderedLinks(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const anchor of doc.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href")?.trim() ?? "";
    if (!href || !/^(?:https?:)?\/\//i.test(href)) {
      continue;
    }

    anchor.setAttribute("target", "_blank");
    const rel = new Set((anchor.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    anchor.setAttribute("rel", Array.from(rel).join(" "));
  }

  return doc.body.innerHTML;
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
    [],
  );

  const categoryFilter = useMemo(
    () => activeCategory === "All" ? [] : [{ id: "category", value: activeCategory }],
    [activeCategory],
  );

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
      const query = String(filterValue ?? "").trim().toLowerCase();
      if (!query) return true;

      const { title, description, category } = row.original;
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query)
      );
    },
  });

  const filteredRows = specTable.getFilteredRowModel().rows;
  const filteredDocs = useMemo(
    () => filteredRows.map((row) => row.original).toSorted((a, b) => a.order - b.order),
    [filteredRows],
  );

  const groupedDocs = useMemo<GroupedDocs>(() => {
    const groups: GroupedDocs = {};
    for (const doc of filteredDocs) {
      const category = doc.category as SpecCategory;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category]!.push(doc);
    }
    return groups;
  }, [filteredDocs]);

  const activeFilename = activeDoc?.filename ?? null;
  const { data: markdown = "", isPending: loading, error: queryError } = useQuery({
    queryKey: ["spec-doc", activeFilename],
    queryFn: ({ signal }) => loadSpecDocHtml(activeFilename!, signal),
    enabled: Boolean(activeFilename),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const error = queryError instanceof Error ? queryError.message : null;

  const prefetchDoc = useCallback(
    (doc: SpecDoc) => {
      void queryClient.prefetchQuery({
        queryKey: ["spec-doc", doc.filename],
        queryFn: ({ signal }) => loadSpecDocHtml(doc.filename, signal),
        staleTime: Infinity,
        gcTime: Infinity,
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!activeDoc) return;
    const stillVisible = filteredDocs.some((doc) => doc.slug === activeDoc.slug);
    if (!stillVisible) {
      setActiveDoc(null);
    }
  }, [activeDoc, filteredDocs]);

  useEffect(() => {
    if (!activeDoc) return;

    const activeIndex = filteredDocs.findIndex((doc) => doc.slug === activeDoc.slug);
    if (activeIndex < 0) return;

    const neighbors = [filteredDocs[activeIndex - 1], filteredDocs[activeIndex + 1]].filter(
      (doc): doc is SpecDoc => Boolean(doc),
    );

    for (const doc of neighbors) {
      prefetchDoc(doc);
    }
  }, [activeDoc, filteredDocs, prefetchDoc]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTextInputLike(document.activeElement)) return;
      if (event.key === "Escape" && activeDoc) {
        setActiveDoc(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeDoc]);

  const visibleDocCount = filteredDocs.length;
  const activeDocIndex = activeDoc
    ? filteredDocs.findIndex((doc) => doc.slug === activeDoc.slug)
    : -1;

  return (
    <div
      id="spec-explorer-workspace"
      data-scaffold-slot="workspace"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_30px_90px_-55px_rgba(59,130,246,0.75)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(56,189,248,0.2),transparent_42%),radial-gradient(circle_at_88%_6%,rgba(59,130,246,0.16),transparent_34%)]" />

      <header className="relative border-b border-white/10 px-4 py-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
              Interactive Reader
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Filter by category, search instantly, and open docs in a dedicated reading pane.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label="Visible" value={`${visibleDocCount}/${specDocs.length}`} />
            <StatusPill label="Categories" value={String(specCategories.length)} />
            <StatusPill
              label="Selection"
              value={activeDocIndex >= 0 ? `${activeDocIndex + 1}/${visibleDocCount}` : "None"}
            />
          </div>
        </div>
      </header>

      <section id="spec-mobile-shell" className="relative p-4 lg:hidden">
        <AnimatePresence mode="wait">
          {activeDoc ? (
            <motion.div
              id="spec-mobile-reader"
              key={`mobile-${activeDoc.slug}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={PANEL_TRANSITION}
              className="space-y-4"
            >
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors hover:border-blue-400/40 hover:text-blue-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Documents
              </button>
              <article className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <DocHeader doc={activeDoc} />
                <DocContent html={markdown} loading={loading} error={error} />
              </article>
            </motion.div>
          ) : (
            <motion.div
              id="spec-mobile-index"
              key="mobile-index"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={PANEL_TRANSITION}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <Sidebar
                variant="mobile"
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

      <section
        id="spec-desktop-shell"
        className="relative hidden h-[78vh] min-h-[640px] lg:grid lg:grid-cols-[360px,minmax(0,1fr)]"
      >
        <aside
          id="spec-desktop-index"
          className="min-h-0 border-r border-white/10 bg-black/25 p-5"
        >
          <Sidebar
            variant="desktop"
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            groupedDocs={groupedDocs}
            activeDoc={activeDoc}
            onSelect={setActiveDoc}
            onPrefetch={prefetchDoc}
          />
        </aside>

        <section
          id="spec-desktop-reader"
          className="min-h-0 overflow-y-auto bg-slate-950/40 p-8 custom-scrollbar"
        >
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.article
                key={activeDoc.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={PANEL_TRANSITION}
                className="mx-auto max-w-4xl"
              >
                <DocHeader doc={activeDoc} />
                <DocContent html={markdown} loading={loading} error={error} />
              </motion.article>
            ) : (
              <motion.div
                id="spec-desktop-empty-state"
                key="desktop-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[520px] items-center justify-center"
              >
                <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/35 p-8 text-center">
                  <FileText className="mx-auto mb-5 h-14 w-14 text-blue-300/40" />
                  <h3 className="text-2xl font-black text-white">Select a Document</h3>
                  <p className="mt-3 text-sm text-slate-400">
                    Pick a spec from the left rail to load the rendered markdown view. Use
                    <kbd className="mx-1 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                      /
                    </kbd>
                    to jump into search.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </section>
    </div>
  );
}

function Sidebar({
  variant,
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  groupedDocs,
  activeDoc,
  onSelect,
  onPrefetch,
}: {
  variant: "desktop" | "mobile";
  activeCategory: SpecCategory | "All";
  setActiveCategory: (category: SpecCategory | "All") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
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
    estimateSize: (index) => (sidebarItems[index]?.type === "heading" ? 30 : 86),
    overscan: 8,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowVirtualizer, sidebarItems.length]);

  const visibleDocCount = useMemo(
    () => Object.values(groupedDocs).reduce((total, docs) => total + (docs?.length ?? 0), 0),
    [groupedDocs],
  );

  const listHeightClass = variant === "desktop" ? "max-h-[calc(78vh-16.5rem)]" : "max-h-[58vh]";

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
        <SpecSearch value={searchQuery} onChange={setSearchQuery} />
        <p className="mt-2 text-[11px] text-slate-400">
          Showing <span className="font-semibold text-slate-200">{visibleDocCount}</span> of {specDocs.length} documents
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <CategoryTab
          label="All"
          active={activeCategory === "All"}
          onClick={() => setActiveCategory("All")}
          count={specDocs.length}
        />
        {specCategories.map((category) => (
          <CategoryTab
            key={category}
            label={category}
            active={activeCategory === category}
            onClick={() => setActiveCategory(category)}
            count={CATEGORY_COUNTS[category]}
          />
        ))}
      </div>

      {sidebarItems.length > 0 ? (
        <div
          ref={listRef}
          className={cn("min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar", listHeightClass)}
        >
          <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
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
        <div className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-7 w-7 text-slate-500" />
          <p className="text-sm font-medium text-slate-300">No documents match this filter.</p>
          <p className="mt-1 text-xs text-slate-500">Try another category or search term.</p>
        </div>
      )}
    </div>
  );
}

function CategoryHeading({ category }: { category: SpecCategory }) {
  const Icon = categoryIcons[category] ?? FileText;

  return (
    <div className="px-1 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-blue-300/70" />
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          {category}
        </span>
      </div>
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
      <Magnetic strength={0.04}>
        <button
          type="button"
          data-spec-doc-item={doc.slug}
          onClick={() => onSelect(doc)}
          onMouseEnter={() => onPrefetch(doc)}
          onFocus={() => onPrefetch(doc)}
          className={cn(
            "group w-full rounded-xl border p-3 text-left transition-all",
            active
              ? "border-blue-400/40 bg-blue-500/10 shadow-[0_0_24px_-10px_rgba(59,130,246,0.9)]"
              : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.035]",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <h4
              className={cn(
                "line-clamp-1 text-sm font-bold transition-colors",
                active ? "text-blue-200" : "text-slate-100 group-hover:text-blue-100",
              )}
            >
              {doc.title}
            </h4>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-all",
                active ? "translate-x-0.5 text-blue-200" : "text-slate-600 group-hover:text-slate-300",
              )}
            />
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{doc.description}</p>
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
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] transition-all",
        active
          ? "border-blue-400/35 bg-blue-500/15 text-blue-200"
          : "border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/15 hover:text-slate-300",
      )}
    >
      {label}
      <span className="ml-1 opacity-70">{count}</span>
    </button>
  );
}

function DocHeader({ doc }: { doc: SpecDoc }) {
  const Icon = categoryIcons[doc.category as SpecCategory] ?? FileText;

  return (
    <header className="mb-7 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/30 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-blue-200">
          <Icon className="h-3.5 w-3.5" />
          {doc.category}
        </span>
        <span className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 font-mono text-[10px] text-slate-400">
          {doc.filename}
        </span>
      </div>

      <GlitchText trigger="hover" intensity="low">
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{doc.title}</h1>
      </GlitchText>
      <p className="mt-3 max-w-3xl text-sm font-medium text-slate-300">{doc.description}</p>
    </header>
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
      </div>
    );
  }

  if (error) {
    return (
      <SyncContainer className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-7 w-7 text-red-300" />
        <p className="text-sm font-semibold text-red-200">{error}</p>
      </SyncContainer>
    );
  }

  return <article className="spec-prose pb-16" dangerouslySetInnerHTML={{ __html: html }} />;
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-100">{value}</span>
    </span>
  );
}
