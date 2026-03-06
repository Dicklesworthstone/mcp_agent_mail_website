"use client";

import Link from "next/link";
import {
  Fragment,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type ComponentType,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FileText,
  ChevronRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  BookOpen,
  Shield,
  Search,
  Network,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  ArrowUpRight,
  Hash,
  Quote,
  Code2,
  TableProperties,
  Workflow,
} from "lucide-react";
import { marked } from "marked";
import { cn, isInternalHref, isTextInputLike, toSafeHref } from "@/lib/utils";
import {
  specDocs,
  specCategories,
  type SpecDoc,
  type SpecCategory,
  resolveSpecDocFromHref,
  toSpecExplorerHref,
} from "@/lib/spec-docs";
import { SyncContainer } from "@/components/sync-elements";
import GlitchText from "@/components/glitch-text";
import { Magnetic } from "@/components/motion-wrapper";
import SpecSearch from "./spec-search";

const categoryIcons: Record<SpecCategory, ComponentType<{ className?: string }>> = {
  "Core Concepts": BookOpen,
  "Coordination Flows": Network,
  "Storage & Search": Search,
  "Interface Surfaces": Shield,
  "Reliability & Safety": AlertTriangle,
  "Migration & Parity": RefreshCw,
};

marked.setOptions({
  gfm: true,
  breaks: true,
});

const CATEGORY_COUNTS: Record<SpecCategory, number> = Object.fromEntries(
  specCategories.map((cat) => [cat, specDocs.filter((doc) => doc.category === cat).length]),
) as Record<SpecCategory, number>;

const PANEL_TRANSITION = { duration: 0.24, ease: "easeOut" } as const;
const SPEC_DOC_FILENAME_PATTERN = /^[A-Za-z0-9._-]+\.md$/;
const DOC_QUERY_PARAM = "doc";
const CATEGORY_QUERY_PARAM = "category";
const SEARCH_QUERY_PARAM = "q";
const DESKTOP_SPEC_MEDIA_QUERY = "(min-width: 1024px)";

type GroupedDocs = Partial<Record<SpecCategory, SpecDoc[]>>;

type SidebarItem =
  | { id: string; type: "heading"; category: SpecCategory }
  | { id: string; type: "doc"; category: SpecCategory; doc: SpecDoc };

type MarkdownToken = ReturnType<typeof marked.lexer>[number];

type MarkdownInlineToken = {
  type: string;
  raw?: string;
  text?: string;
  href?: string;
  title?: string | null;
  depth?: number;
  tokens?: MarkdownInlineToken[];
};

type MarkdownListItem = {
  text?: string;
  tokens?: MarkdownToken[];
};

type MarkdownTableCell = {
  text?: string;
  tokens?: MarkdownInlineToken[];
};

type ParsedDocSection = {
  id: string;
  title: string;
  blocks: MarkdownToken[];
};

type ParsedSpecDoc = {
  leadQuote: Extract<MarkdownToken, { type: "blockquote" }> | null;
  preamble: MarkdownToken[];
  sections: ParsedDocSection[];
  stats: {
    sectionCount: number;
    codeBlocks: number;
    tableCount: number;
    linkCount: number;
    wordCount: number;
    readMinutes: number;
  };
};

type SectionTone = {
  accentColor: string;
  borderClass: string;
  chipClass: string;
  iconClass: string;
  navClass: string;
  haloClass: string;
  textClass: string;
};

type ViewerUrlState = {
  category: SpecCategory | "All";
  docSlug: string | null;
  fragment: string | null;
  query: string;
};

const SECTION_TONES: SectionTone[] = [
  {
    accentColor: "#60A5FA",
    borderClass: "border-blue-500/20",
    chipClass: "border-blue-400/30 bg-blue-500/10 text-blue-200",
    iconClass: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    navClass: "border-blue-400/25 bg-blue-500/10 text-blue-100",
    haloClass:
      "bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.1),transparent_42%)]",
    textClass: "text-blue-200",
  },
  {
    accentColor: "#22D3EE",
    borderClass: "border-cyan-500/20",
    chipClass: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",
    iconClass: "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
    navClass: "border-cyan-400/25 bg-cyan-500/10 text-cyan-100",
    haloClass:
      "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.08),transparent_40%)]",
    textClass: "text-cyan-200",
  },
  {
    accentColor: "#F59E0B",
    borderClass: "border-amber-500/20",
    chipClass: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    iconClass: "border-amber-400/20 bg-amber-500/10 text-amber-200",
    navClass: "border-amber-400/25 bg-amber-500/10 text-amber-100",
    haloClass:
      "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.08),transparent_40%)]",
    textClass: "text-amber-200",
  },
  {
    accentColor: "#34D399",
    borderClass: "border-emerald-500/20",
    chipClass: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    iconClass: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    navClass: "border-emerald-400/25 bg-emerald-500/10 text-emerald-100",
    haloClass:
      "bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.14),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_40%)]",
    textClass: "text-emerald-200",
  },
];

const DOC_INDEX_BY_FILENAME = new Map(specDocs.map((doc) => [doc.filename.toLowerCase(), doc]));
const DOC_INDEX_BY_SLUG = new Map(specDocs.map((doc) => [doc.slug, doc]));

function isSpecCategory(value: string): value is SpecCategory {
  return specCategories.includes(value as SpecCategory);
}

function defaultViewerUrlState(): ViewerUrlState {
  return {
    category: "All",
    docSlug: null,
    fragment: null,
    query: "",
  };
}

function parseViewerUrlState(url: URL): ViewerUrlState {
  const nextState = defaultViewerUrlState();
  const docSlug = url.searchParams.get(DOC_QUERY_PARAM)?.trim() ?? "";
  const category = url.searchParams.get(CATEGORY_QUERY_PARAM)?.trim() ?? "";
  const query = url.searchParams.get(SEARCH_QUERY_PARAM) ?? "";
  const fragment = url.hash.replace(/^#/, "").trim();

  if (docSlug && DOC_INDEX_BY_SLUG.has(docSlug)) {
    nextState.docSlug = docSlug;
  }

  if (category && isSpecCategory(category)) {
    nextState.category = category;
  }

  if (query.trim()) {
    nextState.query = query;
  }

  if (fragment) {
    nextState.fragment = fragment;
  }

  return nextState;
}

function readViewerUrlState(): ViewerUrlState {
  if (typeof window === "undefined") {
    return defaultViewerUrlState();
  }

  return parseViewerUrlState(new URL(window.location.href));
}

function currentBrowserRelativeUrl(): string {
  if (typeof window === "undefined") {
    return "/spec-explorer";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function buildViewerRelativeUrl(state: ViewerUrlState): string {
  if (typeof window === "undefined") {
    return "/spec-explorer";
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(DOC_QUERY_PARAM);
  url.searchParams.delete(CATEGORY_QUERY_PARAM);
  url.searchParams.delete(SEARCH_QUERY_PARAM);

  if (state.docSlug) {
    url.searchParams.set(DOC_QUERY_PARAM, state.docSlug);
  }

  if (state.category !== "All") {
    url.searchParams.set(CATEGORY_QUERY_PARAM, state.category);
  }

  if (state.query.trim()) {
    url.searchParams.set(SEARCH_QUERY_PARAM, state.query.trim());
  }

  if (state.docSlug) {
    url.hash = state.fragment ? `#${state.fragment}` : "";
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

async function loadSpecDocSource(filename: string, signal?: AbortSignal): Promise<string> {
  if (!SPEC_DOC_FILENAME_PATTERN.test(filename)) {
    throw new Error("Invalid spec document filename");
  }

  const response = await fetch(`/spec-docs/${encodeURIComponent(filename)}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`);
  }

  return response.text();
}

function slugifyHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractFragmentId(href: string): string | null {
  const hashIndex = href.indexOf("#");
  if (hashIndex < 0) return null;

  const fragment = href.slice(hashIndex + 1).trim();
  return fragment ? fragment : null;
}

function getInlineTokens(value: { tokens?: unknown } | null | undefined): MarkdownInlineToken[] {
  return Array.isArray(value?.tokens) ? (value.tokens as MarkdownInlineToken[]) : [];
}

function getBlockTokens(value: { tokens?: unknown } | null | undefined): MarkdownToken[] {
  return Array.isArray(value?.tokens) ? (value.tokens as MarkdownToken[]) : [];
}

function hasTokenList(value: unknown): value is { tokens?: unknown } {
  return typeof value === "object" && value !== null && "tokens" in value;
}

function countWords(markdown: string): number {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[#>*_\-|\[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) return 0;
  return plainText.split(" ").filter(Boolean).length;
}

function flattenInlineText(tokens: MarkdownInlineToken[]): string {
  return tokens
    .map((token) => {
      if (token.type === "br") return " ";
      if (token.type === "strong" || token.type === "em" || token.type === "link") {
        return flattenInlineText(token.tokens ?? []);
      }
      return token.text ?? token.raw ?? "";
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function flattenBlockText(tokens: MarkdownToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case "paragraph":
        case "heading":
        case "text":
          return flattenInlineText(getInlineTokens(token));
        case "blockquote":
          return flattenBlockText(getBlockTokens(token));
        case "list":
          return ((token.items as MarkdownListItem[] | undefined) ?? [])
            .map((item) => flattenBlockText(item.tokens ?? []))
            .join(" ");
        case "table": {
          const header = (token.header as MarkdownTableCell[] | undefined) ?? [];
          const rows = (token.rows as MarkdownTableCell[][] | undefined) ?? [];
          return [
            ...header.map((cell) => flattenInlineText(cell.tokens ?? [])),
            ...rows.flat().map((cell) => flattenInlineText(cell.tokens ?? [])),
          ].join(" ");
        }
        case "code":
          return token.text ?? "";
        default:
          return "text" in token && typeof token.text === "string" ? token.text : "";
      }
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function countInlineLinks(tokens: MarkdownInlineToken[]): number {
  return tokens.reduce((count, token) => {
    if (token.type === "link") {
      return count + 1 + countInlineLinks(token.tokens ?? []);
    }
    return count + countInlineLinks(token.tokens ?? []);
  }, 0);
}

function summarizeDocStats(tokens: MarkdownToken[], markdown: string): ParsedSpecDoc["stats"] {
  let codeBlocks = 0;
  let tableCount = 0;
  let linkCount = 0;

  const walk = (blocks: MarkdownToken[]) => {
    for (const token of blocks) {
      switch (token.type) {
        case "paragraph":
        case "heading":
        case "text":
          linkCount += countInlineLinks(getInlineTokens(token));
          break;
        case "blockquote":
          walk(getBlockTokens(token));
          break;
        case "list":
          for (const item of (token.items as MarkdownListItem[] | undefined) ?? []) {
            walk(item.tokens ?? []);
          }
          break;
        case "table": {
          tableCount += 1;
          const header = (token.header as MarkdownTableCell[] | undefined) ?? [];
          const rows = (token.rows as MarkdownTableCell[][] | undefined) ?? [];
          for (const cell of header) {
            linkCount += countInlineLinks(cell.tokens ?? []);
          }
          for (const row of rows) {
            for (const cell of row) {
              linkCount += countInlineLinks(cell.tokens ?? []);
            }
          }
          break;
        }
        case "code":
          codeBlocks += 1;
          break;
        default:
          break;
      }
    }
  };

  walk(tokens);

  const wordCount = countWords(markdown);
  return {
    sectionCount: tokens.filter((token) => token.type === "heading" && token.depth === 2).length,
    codeBlocks,
    tableCount,
    linkCount,
    wordCount,
    readMinutes: Math.max(1, Math.ceil(wordCount / 220)),
  };
}

function parseSpecDoc(markdown: string): ParsedSpecDoc {
  const tokens = marked.lexer(markdown).filter((token) => token.type !== "space") as MarkdownToken[];
  const workingTokens = [...tokens];

  if (workingTokens[0]?.type === "heading") {
    workingTokens.shift();
  }

  let leadQuote: Extract<MarkdownToken, { type: "blockquote" }> | null = null;
  if (workingTokens[0]?.type === "blockquote") {
    leadQuote =
      (workingTokens.shift() as Extract<MarkdownToken, { type: "blockquote" }> | undefined) ??
      null;
  }

  const preamble: MarkdownToken[] = [];
  const sections: ParsedDocSection[] = [];
  let currentSection: ParsedDocSection | null = null;

  for (const token of workingTokens) {
    if (token.type === "heading" && token.depth === 2) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        id: slugifyHeading(token.text),
        title: token.text,
        blocks: [],
      };
      continue;
    }

    if (currentSection) {
      currentSection.blocks.push(token);
    } else {
      preamble.push(token);
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    leadQuote,
    preamble,
    sections,
    stats: summarizeDocStats(tokens, markdown),
  };
}

function getSectionTone(index: number): SectionTone {
  return SECTION_TONES[index % SECTION_TONES.length] ?? SECTION_TONES[0];
}

function sectionKind(title: string): "default" | "jargon" | "read-next" | "site-links" {
  const normalized = title.trim().toLowerCase();
  if (normalized === "jargon anchors") return "jargon";
  if (normalized === "what to read next") return "read-next";
  if (normalized === "where to see it on the site") return "site-links";
  return "default";
}

function findFirstLinkToken(tokens: MarkdownInlineToken[]): MarkdownInlineToken | null {
  for (const token of tokens) {
    if (token.type === "link") {
      return token;
    }
    const nested = findFirstLinkToken(token.tokens ?? []);
    if (nested) return nested;
  }

  return null;
}

function getListItemInlineTokens(item: MarkdownListItem): MarkdownInlineToken[] {
  const paragraphLike = (item.tokens ?? []).find((token) =>
    token.type === "paragraph" || token.type === "text",
  );
  return hasTokenList(paragraphLike) ? getInlineTokens(paragraphLike) : [];
}

function formatRouteLabel(href: string): string {
  const [pathname, fragment = ""] = href.split("#");
  const section = pathname.replace(/^\//, "") || "home";
  const sectionLabel = section
    .split("/")
    .filter(Boolean)
    .map((part) => part.split("-").map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1)).join(" "))
    .join(" / ");

  if (!fragment) return sectionLabel;

  const fragmentLabel = fragment
    .split("-")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

  return `${sectionLabel} / ${fragmentLabel}`;
}

export default function SpecViewer() {
  const queryClient = useQueryClient();
  const initialUrlStateRef = useRef<ViewerUrlState | null>(null);
  if (initialUrlStateRef.current === null) {
    initialUrlStateRef.current = readViewerUrlState();
  }

  const initialUrlState = initialUrlStateRef.current;
  const historyModeRef = useRef<"push" | "replace">("replace");
  const suppressUrlSyncRef = useRef(false);
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(DESKTOP_SPEC_MEDIA_QUERY).matches,
  );
  const [activeDocSlug, setActiveDocSlug] = useState<string | null>(initialUrlState.docSlug);
  const [searchQuery, setSearchQuery] = useState(initialUrlState.query);
  const [activeCategory, setActiveCategory] = useState<SpecCategory | "All">(initialUrlState.category);
  const [requestedFragment, setRequestedFragment] = useState<string | null>(initialUrlState.fragment);
  const [currentSectionFragment, setCurrentSectionFragment] = useState<string | null>(
    initialUrlState.fragment,
  );
  const activeDoc = useMemo(
    () => (activeDocSlug ? DOC_INDEX_BY_SLUG.get(activeDocSlug) ?? null : null),
    [activeDocSlug],
  );

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
      const docsInCategory = groups[category] ?? [];
      docsInCategory.push(doc);
      groups[category] = docsInCategory;
    }
    return groups;
  }, [filteredDocs]);

  const activeFilename = activeDoc?.filename ?? null;
  const { data: source = "", isPending: loading, error: queryError } = useQuery({
    queryKey: ["spec-doc", activeFilename],
    queryFn: ({ signal }) =>
      activeFilename ? loadSpecDocSource(activeFilename, signal) : Promise.resolve(""),
    enabled: Boolean(activeFilename),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const error = queryError instanceof Error ? queryError.message : null;

  const prefetchDoc = useCallback(
    (doc: SpecDoc) => {
      void queryClient.prefetchQuery({
        queryKey: ["spec-doc", doc.filename],
        queryFn: ({ signal }) => loadSpecDocSource(doc.filename, signal),
        staleTime: Infinity,
        gcTime: Infinity,
      });
    },
    [queryClient],
  );

  const applyViewerUrlState = useCallback((state: ViewerUrlState) => {
    suppressUrlSyncRef.current = true;
    setSearchQuery(state.query);
    setActiveCategory(state.category);
    setActiveDocSlug(state.docSlug);
    setRequestedFragment(state.fragment);
    setCurrentSectionFragment(state.fragment);
  }, []);

  const openDoc = useCallback((doc: SpecDoc, fragment?: string | null) => {
    historyModeRef.current = "push";
    const normalizedFragment = fragment ? fragment.replace(/^#/, "") : null;
    setActiveCategory(doc.category as SpecCategory);
    setRequestedFragment(normalizedFragment);
    setCurrentSectionFragment(normalizedFragment);
    setActiveDocSlug(doc.slug);
  }, []);

  const closeDoc = useCallback((historyMode: "push" | "replace" = "push") => {
    historyModeRef.current = historyMode;
    setActiveDocSlug(null);
    setRequestedFragment(null);
    setCurrentSectionFragment(null);
  }, []);

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
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DESKTOP_SPEC_MEDIA_QUERY);
    const updateMatch = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateMatch();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMatch);
    } else {
      mediaQuery.addListener(updateMatch);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateMatch);
      } else {
        mediaQuery.removeListener(updateMatch);
      }
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      applyViewerUrlState(readViewerUrlState());
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyViewerUrlState]);

  useEffect(() => {
    const nextUrl = buildViewerRelativeUrl({
      category: activeCategory,
      docSlug: activeDoc?.slug ?? null,
      fragment: activeDoc ? requestedFragment ?? currentSectionFragment ?? null : null,
      query: searchQuery,
    });

    if (suppressUrlSyncRef.current) {
      suppressUrlSyncRef.current = false;
      return;
    }

    if (nextUrl === currentBrowserRelativeUrl()) {
      return;
    }

    const method = historyModeRef.current === "push"
      ? window.history.pushState.bind(window.history)
      : window.history.replaceState.bind(window.history);

    method(window.history.state, "", nextUrl);
    historyModeRef.current = "replace";
  }, [activeCategory, activeDoc, currentSectionFragment, requestedFragment, searchQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isTextInputLike(document.activeElement)) return;
      if (event.key === "Escape" && activeDoc) {
        closeDoc("push");
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeDoc, closeDoc]);

  const handleSearchChange = useCallback((query: string) => {
    historyModeRef.current = "replace";
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((category: SpecCategory | "All") => {
    historyModeRef.current = "replace";
    setActiveCategory(category);
  }, []);

  const handleSectionChange = useCallback((sectionId: string | null) => {
    setCurrentSectionFragment(sectionId);
  }, []);

  const visibleDocCount = filteredDocs.length;
  const activeDocIndex = activeDoc
    ? filteredDocs.findIndex((doc) => doc.slug === activeDoc.slug)
    : -1;
  const selectionValue = activeDoc
    ? activeDocIndex >= 0
      ? `${activeDocIndex + 1}/${visibleDocCount}`
      : "Pinned"
    : "None";

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
            <StatusPill label="Selection" value={selectionValue} />
          </div>
        </div>
      </header>

      {isDesktop ? (
        <section
          id="spec-desktop-shell"
          className="relative h-[78vh] min-h-[640px] lg:grid lg:grid-cols-[360px,minmax(0,1fr)]"
        >
          <aside
            id="spec-desktop-index"
            className="min-h-0 border-r border-white/10 bg-black/25 p-5"
          >
            <Sidebar
              variant="desktop"
              activeCategory={activeCategory}
              setActiveCategory={handleCategoryChange}
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              groupedDocs={groupedDocs}
              activeDoc={activeDoc}
              onSelect={openDoc}
              onPrefetch={prefetchDoc}
            />
          </aside>

          <section
            id="spec-desktop-reader"
            data-spec-reader-scroll="true"
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
                  className="mx-auto max-w-5xl"
                >
                  <DocHeader doc={activeDoc} />
                  <DocContent
                    doc={activeDoc}
                    source={source}
                    loading={loading}
                    error={error}
                    requestedFragment={requestedFragment}
                    onConsumeRequestedFragment={() => setRequestedFragment(null)}
                    onActiveSectionChange={handleSectionChange}
                    onOpenDoc={openDoc}
                  />
                </motion.article>
              ) : (
                <motion.div
                  id="spec-desktop-empty-state"
                  key="desktop-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full min-h-[520px] items-center justify-center"
                >
                  <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-black/35 p-8 text-center shadow-[0_0_60px_-20px_rgba(59,130,246,0.25)]">
                    <FileText className="mx-auto mb-5 h-14 w-14 animate-float text-blue-300/40" />
                    <h3 className="text-2xl font-black text-gradient-sync">Select a Document</h3>
                    <p className="mt-3 text-sm text-slate-400">
                      Pick a spec from the left rail to load the structured reader. Use
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
      ) : (
        <section id="spec-mobile-shell" className="relative p-4">
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
                  onClick={() => closeDoc("push")}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition-colors hover:border-blue-400/40 hover:text-blue-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Documents
                </button>
                <article className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <DocHeader doc={activeDoc} />
                  <DocContent
                    doc={activeDoc}
                    source={source}
                    loading={loading}
                    error={error}
                    requestedFragment={requestedFragment}
                    onConsumeRequestedFragment={() => setRequestedFragment(null)}
                    onActiveSectionChange={handleSectionChange}
                    onOpenDoc={openDoc}
                  />
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
                  setActiveCategory={handleCategoryChange}
                  searchQuery={searchQuery}
                  setSearchQuery={handleSearchChange}
                  groupedDocs={groupedDocs}
                  activeDoc={activeDoc}
                  onSelect={openDoc}
                  onPrefetch={prefetchDoc}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
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
              const item = sidebarItems[virtualItem.index];
              if (!item) return null;

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
          aria-pressed={active}
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
      aria-pressed={active}
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
  doc,
  source,
  loading,
  error,
  requestedFragment,
  onConsumeRequestedFragment,
  onActiveSectionChange,
  onOpenDoc,
}: {
  doc: SpecDoc;
  source: string;
  loading: boolean;
  error: string | null;
  requestedFragment: string | null;
  onConsumeRequestedFragment: () => void;
  onActiveSectionChange: (sectionId: string | null) => void;
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const parsed = useMemo(() => (source ? parseSpecDoc(source) : null), [source]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [readerProgress, setReaderProgress] = useState(0);
  const findContentAnchor = useCallback((anchorId: string) => {
    if (!contentRef.current) return null;

    return Array.from(contentRef.current.querySelectorAll<HTMLElement>("[id]")).find(
      (node) => node.id === anchorId,
    ) ?? null;
  }, []);
  const currentSection =
    parsed?.sections.some((section) => section.id === activeSection)
      ? activeSection
      : parsed?.sections[0]?.id ?? null;

  useEffect(() => {
    if (!contentRef.current || !parsed?.sections.length) return;

    const scrollHost = contentRef.current.closest<HTMLElement>("[data-spec-reader-scroll]");
    const pendingSectionAnchor = requestedFragment?.replace(/^#/, "") ?? null;
    const nodes = parsed.sections
      .map(
        (section) =>
          contentRef.current?.querySelector<HTMLElement>(`[data-spec-section="${section.id}"]`) ?? null,
      )
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (pendingSectionAnchor && parsed.sections.some((section) => section.id === pendingSectionAnchor)) {
          setActiveSection((previous) =>
            previous === pendingSectionAnchor ? previous : pendingSectionAnchor,
          );
          return;
        }

        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: scrollHost ?? null,
        rootMargin: "-16% 0px -62% 0px",
        threshold: [0.15, 0.4, 0.7],
      },
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [doc.slug, parsed, requestedFragment]);

  useEffect(() => {
    if (loading || !parsed) return;

    const scrollHost = contentRef.current?.closest<HTMLElement>("[data-spec-reader-scroll]");
    const anchorId = requestedFragment?.replace(/^#/, "") ?? null;
    const isTrackedSectionAnchor =
      Boolean(anchorId) && parsed.sections.some((section) => section.id === anchorId);

    const rafId = window.requestAnimationFrame(() => {
      if (anchorId) {
        if (isTrackedSectionAnchor) {
          setActiveSection(anchorId);
        }
        findContentAnchor(anchorId)?.scrollIntoView({
          // Deep links and back/forward restoration should land deterministically.
          behavior: "auto",
          block: "start",
        });
        if (!isTrackedSectionAnchor) {
          onConsumeRequestedFragment();
        }
        return;
      }

      if (scrollHost) {
        scrollHost.scrollTo({ top: 0, behavior: "auto" });
        return;
      }

      contentRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });

    return () => window.cancelAnimationFrame(rafId);
  }, [
    doc.slug,
    loading,
    parsed,
    requestedFragment,
    prefersReducedMotion,
    onConsumeRequestedFragment,
    findContentAnchor,
  ]);

  useEffect(() => {
    const anchorId = requestedFragment?.replace(/^#/, "") ?? null;
    if (!anchorId || !parsed?.sections.some((section) => section.id === anchorId)) {
      return;
    }

    if (currentSection !== anchorId) {
      return;
    }

    onConsumeRequestedFragment();
  }, [currentSection, onConsumeRequestedFragment, parsed, requestedFragment]);

  useEffect(() => {
    if (!contentRef.current) return;

    const scrollHost = contentRef.current.closest<HTMLElement>("[data-spec-reader-scroll]");

    let rafId = 0;

    const computeProgress = () => {
      if (!contentRef.current) return;

      const contentRect = contentRef.current.getBoundingClientRect();
      const hostRect = scrollHost
        ? scrollHost.getBoundingClientRect()
        : ({ top: 0, height: window.innerHeight } as Pick<DOMRect, "top" | "height">);
      const totalDistance = Math.max(contentRect.height - hostRect.height * 0.4, 1);
      const traversedDistance = hostRect.top - contentRect.top + hostRect.height * 0.25;
      const nextProgress = Math.max(0, Math.min(1, traversedDistance / totalDistance));

      setReaderProgress((previous) =>
        Math.abs(previous - nextProgress) > 0.004 ? nextProgress : previous,
      );
    };

    const scheduleProgressMeasure = () => {
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(computeProgress);
    };

    scheduleProgressMeasure();
    if (scrollHost) {
      scrollHost.addEventListener("scroll", scheduleProgressMeasure, { passive: true });
    } else {
      window.addEventListener("scroll", scheduleProgressMeasure, { passive: true });
    }
    window.addEventListener("resize", scheduleProgressMeasure);

    return () => {
      if (scrollHost) {
        scrollHost.removeEventListener("scroll", scheduleProgressMeasure);
      } else {
        window.removeEventListener("scroll", scheduleProgressMeasure);
      }
      window.removeEventListener("resize", scheduleProgressMeasure);
      window.cancelAnimationFrame(rafId);
    };
  }, [doc.slug, parsed]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      onActiveSectionChange(sectionId);
      findContentAnchor(sectionId)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [findContentAnchor, onActiveSectionChange, prefersReducedMotion],
  );

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

  if (!parsed) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      data-spec-doc-body="true"
      data-spec-current-section={currentSection ?? ""}
      className="pb-16"
    >
      <ReaderOverview
        doc={doc}
        parsed={parsed}
        activeSection={currentSection}
        readerProgress={readerProgress}
        onScrollToSection={scrollToSection}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr),250px]">
        <div className="space-y-6">
          {parsed.leadQuote ? <LeadQuoteCard quote={parsed.leadQuote} onOpenDoc={onOpenDoc} /> : null}
          {parsed.preamble.length > 0 ? (
            <PreludeCard blocks={parsed.preamble} onOpenDoc={onOpenDoc} />
          ) : null}

          {parsed.sections.map((section, index) => (
            <DocSectionCard
              key={section.id}
              section={section}
              index={index}
              onOpenDoc={onOpenDoc}
            />
          ))}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <SectionRail
              sections={parsed.sections}
              activeSection={currentSection}
              readerProgress={readerProgress}
              onScrollToSection={scrollToSection}
            />
            <ReaderSignalsCard stats={parsed.stats} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReaderOverview({
  doc,
  parsed,
  activeSection,
  readerProgress,
  onScrollToSection,
}: {
  doc: SpecDoc;
  parsed: ParsedSpecDoc;
  activeSection: string | null;
  readerProgress: number;
  onScrollToSection: (sectionId: string) => void;
}) {
  const progressLabel = `${Math.round(readerProgress * 100)}%`;

  return (
    <SyncContainer
      withPulse={true}
      accentColor="#60A5FA"
      className="overflow-hidden border-blue-500/15 bg-black/35"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_48%),radial-gradient(circle_at_85%_18%,rgba(56,189,248,0.1),transparent_38%)]" />
      <div className="relative p-5 md:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),320px] xl:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300/75">
              Document Anatomy
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-white md:text-2xl">
              Structured reading mode for {doc.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Each section is rendered as a native React surface with targeted layouts for
              diagrams, jargon bridges, linked follow-ups, and site route jump-offs.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                data-spec-reader-progress="true"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300"
              >
                <span className="text-slate-500">Progress</span>
                <span className="text-white">{progressLabel}</span>
              </span>
              {activeSection ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100">
                  <span className="text-blue-300/80">Active</span>
                  <span>{activeSection.replace(/-/g, " ")}</span>
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {parsed.sections.map((section, index) => {
                const tone = getSectionTone(index);
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => onScrollToSection(section.id)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all",
                      isActive
                        ? tone.navClass
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white",
                    )}
                  >
                    {section.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2">
            <MetricCard label="Sections" value={String(parsed.stats.sectionCount)} />
            <MetricCard label="Read Time" value={`${parsed.stats.readMinutes} min`} />
            <MetricCard label="Code Blocks" value={String(parsed.stats.codeBlocks)} />
            <MetricCard label="Progress" value={progressLabel} />
          </div>
        </div>
      </div>
    </SyncContainer>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </motion.div>
  );
}

function LeadQuoteCard({
  quote,
  onOpenDoc,
}: {
  quote: Extract<MarkdownToken, { type: "blockquote" }>;
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  return (
    <SyncContainer
      accentColor="#60A5FA"
      withPulse={true}
      className="overflow-hidden border-blue-500/15 bg-blue-500/[0.05]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_40%)]" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
            <Quote className="h-5 w-5" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300/80">
              Start Here
            </p>
            <div className="text-lg font-semibold leading-8 text-slate-100 md:text-xl">
              {renderBlockTokens(getBlockTokens(quote), onOpenDoc, true)}
            </div>
          </div>
        </div>
      </div>
    </SyncContainer>
  );
}

function PreludeCard({
  blocks,
  onOpenDoc,
}: {
  blocks: MarkdownToken[];
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  return (
    <SyncContainer accentColor="#22D3EE" className="overflow-hidden border-cyan-500/15 bg-black/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_45%)]" />
      <div className="relative p-5 md:p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300/80">
          Orientation Layer
        </p>
        <div className="mt-4 space-y-4 text-slate-200">
          {renderBlockTokens(blocks, onOpenDoc)}
        </div>
      </div>
    </SyncContainer>
  );
}

function DocSectionCard({
  section,
  index,
  onOpenDoc,
}: {
  section: ParsedDocSection;
  index: number;
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  const tone = getSectionTone(index);
  const Icon = section.title.toLowerCase() === "jargon anchors"
    ? Hash
    : section.title.toLowerCase() === "what to read next"
      ? ArrowUpRight
      : section.title.toLowerCase() === "where to see it on the site"
        ? Workflow
        : section.title.toLowerCase() === "visual mental model"
          ? Network
          : BookOpen;

  return (
    <motion.section
      id={section.id}
      data-spec-section={section.id}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.035 }}
    >
      <SyncContainer
        accentColor={tone.accentColor}
        withPulse={true}
        className={cn("overflow-hidden bg-black/35", tone.borderClass)}
      >
        <div className={cn("pointer-events-none absolute inset-0", tone.haloClass)} />
        <div className="relative p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={cn("mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", tone.iconClass)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={cn("text-[10px] font-black uppercase tracking-[0.26em]", tone.textClass)}>
                  Section {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white md:text-[1.9rem]">
                  {section.title}
                </h2>
              </div>
            </div>
            <span className={cn("rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em]", tone.chipClass)}>
              {sectionKind(section.title).replace("-", " ")}
            </span>
          </div>

          <div className="mt-6 space-y-5 text-slate-100">
            <SectionBody section={section} onOpenDoc={onOpenDoc} />
          </div>
        </div>
      </SyncContainer>
    </motion.section>
  );
}

function SectionBody({
  section,
  onOpenDoc,
}: {
  section: ParsedDocSection;
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  const kind = sectionKind(section.title);
  const listIndex = section.blocks.findIndex((token) => token.type === "list");
  const listToken = listIndex >= 0 ? section.blocks[listIndex] : null;
  const beforeBlocks = listIndex >= 0 ? section.blocks.slice(0, listIndex) : section.blocks;
  const afterBlocks = listIndex >= 0 ? section.blocks.slice(listIndex + 1) : [];

  if (kind === "jargon" && listToken?.type === "list") {
    return (
      <>
        {renderBlockTokens(beforeBlocks, onOpenDoc)}
        <JargonAnchorGrid items={(listToken.items as MarkdownListItem[] | undefined) ?? []} />
        {renderBlockTokens(afterBlocks, onOpenDoc)}
      </>
    );
  }

  if (kind === "read-next" && listToken?.type === "list") {
    return (
      <>
        {renderBlockTokens(beforeBlocks, onOpenDoc)}
        <ReadNextGrid
          items={(listToken.items as MarkdownListItem[] | undefined) ?? []}
          onOpenDoc={onOpenDoc}
        />
        {renderBlockTokens(afterBlocks, onOpenDoc)}
      </>
    );
  }

  if (kind === "site-links" && listToken?.type === "list") {
    return (
      <>
        {renderBlockTokens(beforeBlocks, onOpenDoc)}
        <SiteRouteGrid items={(listToken.items as MarkdownListItem[] | undefined) ?? []} />
        {renderBlockTokens(afterBlocks, onOpenDoc)}
      </>
    );
  }

  return <>{renderBlockTokens(section.blocks, onOpenDoc)}</>;
}

function JargonAnchorGrid({ items }: { items: MarkdownListItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const text = flattenBlockText(item.tokens ?? []);
        const match = text.match(/^`?([^`:]+)`?:\s*(.+)$/);
        const term = match?.[1]?.trim() ?? `Term ${index + 1}`;
        const description = match?.[2]?.trim() ?? text;
        const tone = getSectionTone(index);

        return (
          <div
            key={`${term}-${index}`}
            className={cn(
              "rounded-2xl border bg-black/35 p-4",
              tone.borderClass,
            )}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
              Jargon Anchor
            </p>
            <div className="mt-3 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-sm text-white">
              {term}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
          </div>
        );
      })}
    </div>
  );
}

function ReadNextGrid({
  items,
  onOpenDoc,
}: {
  items: MarkdownListItem[];
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  const docs = items
    .map((item) => {
      const link = findFirstLinkToken(getListItemInlineTokens(item));
      if (!link?.href) return null;
      const doc = resolveSpecDocFromHref(link.href);
      return doc ?? DOC_INDEX_BY_FILENAME.get(link.href.toLowerCase()) ?? null;
    })
    .filter((doc): doc is SpecDoc => Boolean(doc));

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {docs.map((linkedDoc, index) => {
        const tone = getSectionTone(index + 1);
        const Icon = categoryIcons[linkedDoc.category as SpecCategory] ?? FileText;
        return (
          <button
            key={linkedDoc.slug}
            type="button"
            data-spec-related-doc={linkedDoc.slug}
            onClick={() => onOpenDoc(linkedDoc)}
            className={cn(
              "w-full rounded-2xl border bg-black/35 p-4 text-left transition-colors hover:bg-white/[0.04]",
              tone.borderClass,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em]", tone.chipClass)}>
                  <Icon className="h-3 w-3" />
                  {linkedDoc.category}
                </span>
                <h3 className="mt-3 text-lg font-black text-white">{linkedDoc.title}</h3>
              </div>
              <ArrowUpRight className="mt-1 h-4 w-4 text-slate-500" />
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{linkedDoc.description}</p>
            <p className="mt-4 font-mono text-[11px] text-slate-500">{linkedDoc.filename}</p>
          </button>
        );
      })}
    </div>
  );
}

function SiteRouteGrid({ items }: { items: MarkdownListItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const rawHref = flattenBlockText(item.tokens ?? []);
        const safeHref = toSafeHref(rawHref);
        const tone = getSectionTone(index);
        const interactive = Boolean(safeHref);
        const cardClassName = cn(
          "rounded-2xl border bg-black/35 p-4",
          interactive && "group transition-all hover:-translate-y-0.5 hover:bg-white/[0.04]",
          tone.borderClass,
        );
        const cardContent = (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={cn("text-[10px] font-black uppercase tracking-[0.24em]", tone.textClass)}>
                  Site Route
                </p>
                <h3 className="mt-2 text-base font-black text-white">{formatRouteLabel(rawHref)}</h3>
              </div>
              <ArrowUpRight
                className={cn(
                  "mt-1 h-4 w-4 text-slate-500",
                  interactive && "transition-colors group-hover:text-white",
                )}
              />
            </div>
            <p className="mt-4 font-mono text-[11px] text-slate-400">{rawHref}</p>
          </>
        );

        if (!safeHref) {
          return (
            <div key={`${rawHref}-${index}`} className={cardClassName}>
              {cardContent}
            </div>
          );
        }

        if (isInternalHref(safeHref)) {
          return (
            <Link key={`${rawHref}-${index}`} href={safeHref} className={cardClassName}>
              {cardContent}
            </Link>
          );
        }

        return (
          <a
            key={`${rawHref}-${index}`}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cardClassName}
          >
            {cardContent}
          </a>
        );
      })}
    </div>
  );
}

function SectionRail({
  sections,
  activeSection,
  readerProgress,
  onScrollToSection,
}: {
  sections: ParsedDocSection[];
  activeSection: string | null;
  readerProgress: number;
  onScrollToSection: (sectionId: string) => void;
}) {
  const progressLabel = `${Math.round(readerProgress * 100)}%`;

  return (
    <SyncContainer
      accentColor="#60A5FA"
      className="overflow-hidden border-white/10 bg-black/35"
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-slate-400">
            On This Page
          </p>
          <span
            data-spec-progress-label="true"
            className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100"
          >
            {progressLabel}
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
          <motion.div
            data-spec-progress-bar="true"
            className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-amber-300"
            animate={{ width: `${Math.max(readerProgress * 100, 4)}%` }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          />
        </div>

        <div className="relative mt-4 space-y-2 pl-5">
          <div className="pointer-events-none absolute left-[0.55rem] top-1 bottom-1 w-px bg-white/10" />
          <motion.div
            className="pointer-events-none absolute left-[0.4rem] top-1 w-[5px] rounded-full bg-gradient-to-b from-blue-400 via-cyan-300 to-amber-300 shadow-[0_0_16px_rgba(96,165,250,0.35)]"
            animate={{ height: `${Math.max(readerProgress * 100, 4)}%` }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          />
          {sections.map((section, index) => {
            const tone = getSectionTone(index);
            const active = activeSection === section.id;
            return (
              <div key={section.id} className="relative">
                {active ? (
                  <motion.div
                    layoutId="spec-active-rail-item"
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-2xl border shadow-[0_0_26px_-16px_rgba(96,165,250,0.9)]",
                      tone.navClass,
                    )}
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                ) : null}
                <div className="absolute left-[-1.05rem] top-1/2 z-20 -translate-y-1/2">
                  <motion.div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border border-slate-800 bg-slate-600",
                      active && "bg-blue-300 shadow-[0_0_12px_rgba(96,165,250,0.75)]",
                    )}
                    animate={{ scale: active ? 1.35 : 1 }}
                    transition={{ duration: 0.18 }}
                  />
                </div>
                <Magnetic strength={0.03}>
                  <button
                    type="button"
                    data-spec-rail-item={section.id}
                    data-spec-rail-active={active ? "true" : "false"}
                    aria-pressed={active}
                    onClick={() => onScrollToSection(section.id)}
                    className={cn(
                      "relative z-10 w-full rounded-2xl border px-3 py-3 text-left transition-all",
                      active
                        ? "border-transparent bg-transparent text-white"
                        : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]",
                    )}
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm font-bold text-inherit">{section.title}</p>
                  </button>
                </Magnetic>
              </div>
            );
          })}
        </div>
      </div>
    </SyncContainer>
  );
}

function ReaderSignalsCard({ stats }: { stats: ParsedSpecDoc["stats"] }) {
  return (
    <SyncContainer accentColor="#22D3EE" className="overflow-hidden border-cyan-500/15 bg-black/35">
      <div className="p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-300/80">
          Reading Signals
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <SignalRow icon={BookOpen} label="Words" value={String(stats.wordCount)} />
          <SignalRow icon={Code2} label="Code Panels" value={String(stats.codeBlocks)} />
          <SignalRow icon={TableProperties} label="Tables" value={String(stats.tableCount)} />
          <SignalRow icon={ArrowUpRight} label="Links" value={String(stats.linkCount)} />
        </div>
      </div>
    </SyncContainer>
  );
}

function SignalRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center gap-2 text-slate-300">
        <Icon className="h-4 w-4 text-cyan-300/70" />
        <span>{label}</span>
      </div>
      <span className="font-mono text-xs text-white">{value}</span>
    </div>
  );
}

function renderBlockTokens(
  blocks: MarkdownToken[],
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void,
  compact = false,
): ReactNode[] {
  return blocks.flatMap((token, index) => {
    const key = `${token.type}-${index}`;

    switch (token.type) {
      case "paragraph":
      case "text":
        return [
          <p
            key={key}
            className={cn(
              compact ? "text-base leading-8 text-slate-100" : "text-[0.98rem] leading-8 text-slate-200",
            )}
          >
            {renderInlineTokens(getInlineTokens(token), onOpenDoc)}
          </p>,
        ];
      case "heading": {
        const headingId = slugifyHeading(token.text);
        const depth = Math.min(token.depth ?? 3, 4);
        if (depth <= 2) return [];

        const Tag = depth === 3 ? "h3" : "h4";
        return [
          <Tag
            key={key}
            id={headingId}
            className={cn(
              depth === 3
                ? "pt-2 text-xl font-black tracking-tight text-white"
                : "pt-1 text-lg font-black tracking-tight text-slate-100",
            )}
          >
            {renderInlineTokens(getInlineTokens(token), onOpenDoc)}
          </Tag>,
        ];
      }
      case "blockquote":
        return [<InlineCallout key={key} blocks={getBlockTokens(token)} onOpenDoc={onOpenDoc} />];
      case "code":
        return [<SpecCodeBlock key={key} code={token.text ?? ""} language={token.lang ?? "text"} />];
      case "list":
        return [
          <ListBlock
            key={key}
            ordered={Boolean(token.ordered)}
            items={(token.items as MarkdownListItem[] | undefined) ?? []}
            onOpenDoc={onOpenDoc}
          />,
        ];
      case "table":
        return [
          <SpecTable
            key={key}
            table={token as Extract<MarkdownToken, { type: "table" }>}
            onOpenDoc={onOpenDoc}
          />,
        ];
      case "hr":
        return [<div key={key} className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />];
      default:
        return [];
    }
  });
}

function renderInlineTokens(
  tokens: MarkdownInlineToken[],
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void,
): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${token.type}-${index}-${token.raw ?? token.text ?? ""}`;

    switch (token.type) {
      case "strong":
        return (
          <strong key={key} className="font-black text-white">
            {renderInlineTokens(token.tokens ?? [], onOpenDoc)}
          </strong>
        );
      case "em":
        return (
          <em key={key} className="font-medium italic text-slate-100">
            {renderInlineTokens(token.tokens ?? [], onOpenDoc)}
          </em>
        );
      case "codespan":
        return (
          <code
            key={key}
            className="rounded-lg border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[0.82em] text-blue-100"
          >
            {token.text}
          </code>
        );
      case "link":
        return (
          <DocInlineLink key={key} href={token.href ?? ""} title={token.title ?? undefined} onOpenDoc={onOpenDoc}>
            {renderInlineTokens(token.tokens ?? [], onOpenDoc)}
          </DocInlineLink>
        );
      case "br":
        return <br key={key} />;
      case "escape":
      case "text":
      default:
        return <Fragment key={key}>{token.text ?? token.raw ?? ""}</Fragment>;
    }
  });
}

function DocInlineLink({
  href,
  title,
  children,
  onOpenDoc,
}: {
  href: string;
  title?: string;
  children: ReactNode;
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  const targetDoc = resolveSpecDocFromHref(href);
  const fragment = extractFragmentId(href);
  const normalizedHref = targetDoc
    ? toSpecExplorerHref(href)
    : toSafeHref(href);
  const isExternal = typeof normalizedHref === "string" && /^(?:https?:)?\/\//i.test(normalizedHref);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!targetDoc) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      event.preventDefault();
      onOpenDoc(targetDoc, fragment);
    },
    [fragment, onOpenDoc, targetDoc],
  );

  if (!normalizedHref) {
    return <span title={title} className="font-semibold text-slate-200">{children}</span>;
  }

  return (
    <a
      href={normalizedHref}
      title={title}
      onClick={handleClick}
      data-spec-inline-doc-link={targetDoc?.slug ?? undefined}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="font-semibold text-blue-200 underline decoration-blue-400/35 underline-offset-4 transition-colors hover:text-blue-100 hover:decoration-blue-300"
    >
      {children}
    </a>
  );
}

function InlineCallout({
  blocks,
  onOpenDoc,
}: {
  blocks: MarkdownToken[];
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-blue-200">
          <Quote className="h-4 w-4" />
        </div>
        <div className="space-y-3 text-sm leading-7 text-slate-300">
          {renderBlockTokens(blocks, onOpenDoc, true)}
        </div>
      </div>
    </div>
  );
}

function ListBlock({
  ordered,
  items,
  onOpenDoc,
}: {
  ordered: boolean;
  items: MarkdownListItem[];
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={`${item.text ?? index}-${index}`}
          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[11px] font-black text-blue-200">
            {ordered ? String(index + 1) : <span className="h-2.5 w-2.5 rounded-full bg-blue-300" />}
          </div>
          <div className="min-w-0 flex-1 space-y-2 text-sm leading-7 text-slate-300">
            {(item.tokens ?? []).map((token, tokenIndex) => {
              if (token.type === "paragraph" || token.type === "text") {
                return (
                  <p key={`${token.type}-${tokenIndex}`} className="text-sm leading-7 text-slate-300">
                    {renderInlineTokens(getInlineTokens(token), onOpenDoc)}
                  </p>
                );
              }

              return <Fragment key={`${token.type}-${tokenIndex}`}>{renderBlockTokens([token], onOpenDoc)}</Fragment>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpecCodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeoutId = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const label = language === "text" ? "System Sketch" : language.toUpperCase();
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#030812]/95 shadow-[0_25px_60px_-35px_rgba(2,8,23,0.9)]">
      <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.03] px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400/50" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-300 transition-colors hover:border-white/20 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-blue-300" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto px-5 py-5">
        <pre className={cn(
          "min-w-max font-mono text-[13px] leading-7 text-slate-200",
          language === "text" && "text-[12.5px] text-cyan-100",
        )}>
          <code>
            {lines.map((line, index) => (
              <span key={`${line}-${index}`} className="flex">
                <span className="mr-6 inline-block w-6 select-none text-right text-[10px] font-black text-slate-700">
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <span>{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function SpecTable({
  table,
  onOpenDoc,
}: {
  table: Extract<MarkdownToken, { type: "table" }>;
  onOpenDoc: (doc: SpecDoc, fragment?: string | null) => void;
}) {
  const header = (table.header as MarkdownTableCell[] | undefined) ?? [];
  const rows = (table.rows as MarkdownTableCell[][] | undefined) ?? [];

  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/35">
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/[0.04] px-5 py-3 text-[10px] font-black uppercase tracking-[0.26em] text-slate-500">
        <TableProperties className="h-4 w-4 text-blue-300/70" />
        Structured Matrix
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.02]">
              {header.map((cell, index) => (
                <th
                  key={`header-${index}`}
                  className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                >
                  {renderInlineTokens(cell.tokens ?? [], onOpenDoc)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`} className="border-b border-white/6 last:border-b-0 even:bg-white/[0.015]">
                {row.map((cell, cellIndex) => (
                  <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-slate-300">
                    {renderInlineTokens(cell.tokens ?? [], onOpenDoc)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-100">{value}</span>
    </span>
  );
}
