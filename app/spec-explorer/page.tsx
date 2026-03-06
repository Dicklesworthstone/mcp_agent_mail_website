import type { Metadata } from "next";
import SpecViewerLoader, {
  AnimatedHeroContent,
  AnimatedItem,
  AnimatedSurfaceSection,
  SurfaceGrid,
  SurfaceCard,
} from "@/components/spec-explorer/spec-viewer-loader";
import GlitchText from "@/components/glitch-text";
import { specCategories, specDocs } from "@/lib/spec-docs";
import { technicalSurfaceCopy } from "@/lib/content";
import { Layers, Globe, Monitor, Terminal } from "lucide-react";

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

        <AnimatedHeroContent>
          <div className="relative">
            <AnimatedItem>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Spec Index
              </div>
            </AnimatedItem>

            <AnimatedItem>
              <GlitchText trigger="hover" intensity="low">
                <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
                  Spec Explorer
                </h1>
              </GlitchText>
            </AnimatedItem>

            <AnimatedItem>
              <p className="mt-4 max-w-2xl text-base font-medium text-slate-300 md:text-lg">
                Read the full MCP Agent Mail technical corpus with fast search, category filters,
                and an optimized split-pane reader built for real implementation work.
              </p>
            </AnimatedItem>

            <AnimatedItem>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <MetricTile label="Documents" value={String(specDocs.length)} />
                <MetricTile label="Categories" value={String(specCategories.length)} />
                <MetricTile label="Hotkeys" value="/ + Esc" />
              </div>
            </AnimatedItem>
          </div>
        </AnimatedHeroContent>
      </section>

      <section id="spec-explorer-shell" data-scaffold-slot="explorer-shell" className="mt-10">
        <SpecViewerLoader />
      </section>

      {/* Technical Surface Map */}
      <section id="technical-surface" className="mt-16 space-y-12">
        <AnimatedSurfaceSection>
          <AnimatedItem>
            <GlitchText trigger="hover" intensity="low">
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Technical Surface Map</h2>
            </GlitchText>
          </AnimatedItem>
          <AnimatedItem>
            <p className="text-sm text-slate-400">An at-a-glance reference for every tool cluster, resource URI, TUI screen, and robot command track in Agent Mail.</p>
          </AnimatedItem>
        </AnimatedSurfaceSection>

        {/* Tool Clusters */}
        <AnimatedSurfaceSection>
          <AnimatedItem>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4">
              <Layers className="h-4 w-4" />
              Tool Clusters
            </h3>
          </AnimatedItem>
          <SurfaceGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technicalSurfaceCopy.toolClusters.map((cluster) => (
              <SurfaceCard key={cluster.id} accentColor="blue">
                <h4 className="text-sm font-bold text-white mb-1">{cluster.cluster}</h4>
                <p className="text-xs text-slate-400 mb-3">{cluster.purpose}</p>
                <div className="flex flex-wrap gap-1">
                  {cluster.representativeTools.map((tool) => (
                    <span key={tool} className="inline-block rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono text-blue-300">{tool}</span>
                  ))}
                </div>
              </SurfaceCard>
            ))}
          </SurfaceGrid>
        </AnimatedSurfaceSection>

        {/* Resource URIs */}
        <AnimatedSurfaceSection>
          <AnimatedItem>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-green-400 mb-4">
              <Globe className="h-4 w-4" />
              Resource URIs
            </h3>
          </AnimatedItem>
          <SurfaceGrid className="grid gap-3 sm:grid-cols-2">
            {technicalSurfaceCopy.resources.map((res) => (
              <SurfaceCard key={res.id} accentColor="green">
                <code className="text-xs font-mono text-green-300 block mb-1">{res.uriPattern}</code>
                <p className="text-xs text-slate-400">{res.purpose}</p>
              </SurfaceCard>
            ))}
          </SurfaceGrid>
        </AnimatedSurfaceSection>

        {/* TUI Screens */}
        <AnimatedSurfaceSection>
          <AnimatedItem>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-400 mb-4">
              <Monitor className="h-4 w-4" />
              TUI Screens
            </h3>
          </AnimatedItem>
          <SurfaceGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {technicalSurfaceCopy.tuiScreens.map((screen) => (
              <SurfaceCard key={screen.id} accentColor="orange">
                <h4 className="text-sm font-bold text-white mb-1">{screen.screen}</h4>
                <p className="text-xs text-slate-400 italic mb-2">{screen.coreQuestion}</p>
                <div className="flex flex-wrap gap-1">
                  {screen.primarySignals.map((signal) => (
                    <span key={signal} className="inline-block rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] text-orange-300">{signal}</span>
                  ))}
                </div>
              </SurfaceCard>
            ))}
          </SurfaceGrid>
        </AnimatedSurfaceSection>

        {/* Robot Command Tracks */}
        <AnimatedSurfaceSection>
          <AnimatedItem>
            <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-4">
              <Terminal className="h-4 w-4" />
              Robot Command Tracks
            </h3>
          </AnimatedItem>
          <SurfaceGrid className="grid gap-3 sm:grid-cols-2">
            {technicalSurfaceCopy.robotTracks.map((track) => (
              <SurfaceCard key={track.id} accentColor="purple">
                <h4 className="text-sm font-bold text-white mb-1">{track.track}</h4>
                <p className="text-xs text-slate-400 mb-2">{track.objective}</p>
                <div className="space-y-1">
                  {track.commandExamples.map((cmd) => (
                    <code key={cmd} className="block text-[10px] font-mono text-purple-300 bg-purple-500/5 rounded px-2 py-1">{cmd}</code>
                  ))}
                </div>
              </SurfaceCard>
            ))}
          </SurfaceGrid>
        </AnimatedSurfaceSection>
      </section>
    </main>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 transition-all duration-300 hover:border-blue-400/25 hover:shadow-[0_0_20px_-8px_rgba(59,130,246,0.3)]">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
