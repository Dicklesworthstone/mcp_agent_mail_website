import type { Metadata } from "next";
import SpecViewerLoader from "@/components/spec-explorer/spec-viewer-loader";
import { specCategories, specDocs } from "@/lib/spec-docs";

export const metadata: Metadata = {
  title: "Spec Explorer | MCP Agent Mail",
  description:
    "Browse technical references, operational playbooks, and architecture notes for MCP Agent Mail.",
  openGraph: {
    title: "Spec Explorer | MCP Agent Mail",
    description: "Browse the MCP Agent Mail technical reference library.",
  },
};

export default function SpecExplorerPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-screen-2xl px-6 pt-24 pb-16 lg:px-8"
    >
      <section
        id="spec-explorer-hero"
        data-scaffold-slot="hero"
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/60 p-7 shadow-[0_20px_80px_-45px_rgba(59,130,246,0.65)] md:p-10"
      >
        <div className="pointer-events-none absolute -top-20 -left-10 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 -bottom-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Spec Index
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
            Spec Explorer
          </h1>
          <p className="mt-4 max-w-2xl text-base font-medium text-slate-300 md:text-lg">
            Read the full MCP Agent Mail technical corpus with fast search, category filters,
            and an optimized split-pane reader built for real implementation work.
          </p>

          <dl className="mt-7 grid gap-3 sm:grid-cols-3">
            <MetricTile label="Documents" value={String(specDocs.length)} />
            <MetricTile label="Categories" value={String(specCategories.length)} />
            <MetricTile label="Hotkeys" value="/ + Esc" />
          </dl>
        </div>
      </section>

      <section id="spec-explorer-shell" data-scaffold-slot="explorer-shell" className="mt-10">
        <SpecViewerLoader />
      </section>
    </main>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-xl font-black text-white">{value}</dd>
    </div>
  );
}
