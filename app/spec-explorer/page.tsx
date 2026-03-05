import type { Metadata } from "next";
import SpecViewerLoader from "@/components/spec-explorer/spec-viewer-loader";
import { specCategories, specDocs } from "@/lib/spec-docs";
import { technicalSurfaceCopy } from "@/lib/content";

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

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <MetricTile label="Documents" value={String(specDocs.length)} />
            <MetricTile label="Categories" value={String(specCategories.length)} />
            <MetricTile label="Hotkeys" value="/ + Esc" />
          </div>
        </div>
      </section>

      <section id="spec-explorer-shell" data-scaffold-slot="explorer-shell" className="mt-10">
        <SpecViewerLoader />
      </section>

      {/* Technical Surface Map */}
      <section id="technical-surface" className="mt-16 space-y-12">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Technical Surface Map</h2>
          <p className="text-sm text-slate-400">An at-a-glance reference for every tool cluster, resource URI, TUI screen, and robot command track in Agent Mail.</p>
        </div>

        {/* Tool Clusters */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Tool Clusters</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technicalSurfaceCopy.toolClusters.map((cluster) => (
              <div key={cluster.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-sm font-bold text-white mb-1">{cluster.cluster}</h4>
                <p className="text-xs text-slate-400 mb-3">{cluster.purpose}</p>
                <div className="flex flex-wrap gap-1">
                  {cluster.representativeTools.map((tool) => (
                    <span key={tool} className="inline-block rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-300">{tool}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resource URIs */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-green-400 mb-4">Resource URIs</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {technicalSurfaceCopy.resources.map((res) => (
              <div key={res.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <code className="text-xs font-mono text-green-300 block mb-1">{res.uriPattern}</code>
                <p className="text-xs text-slate-400">{res.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TUI Screens */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-4">TUI Screens</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technicalSurfaceCopy.tuiScreens.map((screen) => (
              <div key={screen.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-sm font-bold text-white mb-1">{screen.screen}</h4>
                <p className="text-xs text-slate-400 italic mb-2">{screen.coreQuestion}</p>
                <div className="flex flex-wrap gap-1">
                  {screen.primarySignals.map((signal) => (
                    <span key={signal} className="inline-block rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] text-orange-300">{signal}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Robot Command Tracks */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-4">Robot Command Tracks</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {technicalSurfaceCopy.robotTracks.map((track) => (
              <div key={track.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <h4 className="text-sm font-bold text-white mb-1">{track.track}</h4>
                <p className="text-xs text-slate-400 mb-2">{track.objective}</p>
                <div className="space-y-1">
                  {track.commandExamples.map((cmd) => (
                    <code key={cmd} className="block text-[10px] font-mono text-purple-300 bg-purple-500/5 rounded px-2 py-1">{cmd}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
