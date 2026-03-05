import type { Metadata } from "next";
import SpecViewerLoader from "@/components/spec-explorer/spec-viewer-loader";
import {
  technicalSurfaceCopy,
  visualizationBacklogByTier,
  type VisualizationBacklogItem,
  type VisualizationImplementationWave,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Spec Explorer — MCP Agent Mail",
  description:
    "Browse technical references, operational playbooks, and architecture notes for MCP Agent Mail.",
  openGraph: {
    title: "Spec Explorer — MCP Agent Mail",
    description: "Browse the MCP Agent Mail technical reference library.",
  },
};

const waveLabelById: Record<VisualizationImplementationWave, string> = {
  "wave-1-core-loop": "Wave 1: Core Loop",
  "wave-2-guardrails": "Wave 2: Guardrails",
  "wave-3-scale-observability": "Wave 3: Scale + Observability",
  "wave-4-advanced-internals": "Wave 4: Advanced Internals",
};

function renderBacklogItem(item: VisualizationBacklogItem) {
  return (
    <li key={item.id} className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p>
        <span className="font-bold text-white">{item.pedagogicalOrder}.</span> {item.title}
      </p>
      <p className="mt-1 text-[11px] text-slate-400">
        {waveLabelById[item.implementationWave]} | EV {item.explanatoryValue}/5 | IC {item.implementationComplexity}/5 | TR {item.testingRisk}/5
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        {item.recommendedPlacement.join(" / ")}
      </p>
    </li>
  );
}

export default function SpecExplorerPage() {
  return (
    <main id="main-content" className="mx-auto max-w-screen-2xl px-6 lg:px-8 pt-24 pb-16">
      <section
        id="spec-explorer-hero"
        data-scaffold-slot="hero"
        className="mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
          Agent Mail Reference Library
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
          Spec Explorer
        </h1>
        <p className="text-lg text-slate-400 font-medium max-w-2xl">
          Browse implementation notes, protocol references, and operational
          docs that support the MCP Agent Mail architecture.
        </p>
      </section>

      <section
        id="spec-explorer-surface-map"
        data-scaffold-slot="technical-surface-map"
        className="mb-12 grid gap-4 lg:grid-cols-2"
      >
        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Tool Clusters</p>
          <h2 className="mt-2 text-lg font-black text-white">34 tools across 9 clusters</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {technicalSurfaceCopy.toolClusters.map((cluster) => (
              <li key={cluster.id}>
                <span className="font-bold text-white">{cluster.cluster}:</span> {cluster.purpose}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">MCP Resources</p>
          <h2 className="mt-2 text-lg font-black text-white">Resource URI model</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {technicalSurfaceCopy.resources.map((resource) => (
              <li key={resource.id}>
                <span className="font-mono text-blue-300">{resource.uriPattern}</span>
                <span className="text-slate-400"> — {resource.purpose}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">TUI Screens</p>
          <h2 className="mt-2 text-lg font-black text-white">15-screen operations map</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {technicalSurfaceCopy.tuiScreens.map((screen) => (
              <li key={screen.id}>
                <span className="font-bold text-white">{screen.screen}:</span> {screen.coreQuestion}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">Robot Mode</p>
          <h2 className="mt-2 text-lg font-black text-white">Command tracks</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {technicalSurfaceCopy.robotTracks.map((track) => (
              <li key={track.id}>
                <p><span className="font-bold text-white">{track.track}:</span> {track.objective}</p>
                <p className="mt-1 font-mono text-[11px] text-blue-300">{track.commandExamples[0]}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section
        id="spec-explorer-visualization-priority"
        data-scaffold-slot="visualization-priority"
        className="mb-12 rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">
          Visualization Execution Plan
        </p>
        <h2 className="mt-2 text-lg font-black text-white">
          Must / Should / Stretch backlog
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Must</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {visualizationBacklogByTier.must.map(renderBacklogItem)}
            </ul>
          </article>

          <article className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Should</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {visualizationBacklogByTier.should.map(renderBacklogItem)}
            </ul>
          </article>

          <article className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Stretch</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {visualizationBacklogByTier.stretch.map(renderBacklogItem)}
            </ul>
          </article>
        </div>
      </section>

      <section id="spec-explorer-shell" data-scaffold-slot="explorer-shell">
        <SpecViewerLoader />
      </section>
    </main>
  );
}
