"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Github,
  ArrowRight,
  Rocket,
  Package,
  Activity,
  Sparkles,
  Network,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

import SectionShell from "@/components/section-shell";
import StatsGrid from "@/components/stats-grid";
import GlowOrbits from "@/components/glow-orbits";
import FeatureCard from "@/components/feature-card";
import ComparisonTable from "@/components/comparison-table";
import RustCodeBlock from "@/components/rust-code-block";
import Timeline from "@/components/timeline";
import RobotMascot from "@/components/robot-mascot";
import GlitchText from "@/components/glitch-text";
import { SyncContainer } from "@/components/sync-elements";
import { Magnetic, BorderBeam } from "@/components/motion-wrapper";
import {
  siteConfig,
  heroStats,
  features,
  codeExample,
  changelog,
  heroVideoPlaceholder,
} from "@/lib/content";

const AgentFlywheel = dynamic(() => import("@/components/agent-flywheel"), { ssr: false });

export default function HomePage() {
  return (
    <main id="main-content">
      {/* ================================================================
          1. LIVING HERO
          ================================================================ */}
      <section
        id="home-hero"
        data-scaffold-slot="hero"
        className="relative flex flex-col items-center pt-24 pb-32 overflow-hidden text-left"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]" />
          <GlowOrbits />
        </div>

        <div className="relative z-10 mx-auto max-w-screen-2xl px-6 lg:px-8 w-full mt-12 md:mt-0">
          <div className="flex flex-col items-start max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-8"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
              Rust Core + MCP Surface
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[clamp(3.5rem,10vw,7rem)] font-black tracking-tight leading-[0.85] text-white mb-10 text-left"
            >
              Agent <br />
              <span className="text-blue-500">
                Coordination
              </span> <br />
              That Scales.
            </motion.h1>

            <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mb-12">
              MCP Agent Mail gives coding agents a shared operational fabric:
              project-scoped identity, threaded inboxes, reservation guardrails,
              and searchable audit trails backed by SQLite + Git.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Magnetic strength={0.1}>
                <Link
                  href="/showcase"
                  data-magnetic="true"
                  className="relative px-10 py-5 rounded-2xl bg-blue-500 text-white font-black text-lg hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(59,130,246,0.3)] active:scale-95"
                >
                  <span className="absolute inset-0 rounded-2xl animate-pulse bg-blue-400/20" />
                  <Sparkles className="relative h-5 w-5" />
                  <span className="relative">SEE AGENT MAIL IN ACTION</span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.1}>
                <Link
                  href="/getting-started"
                  data-magnetic="true"
                  className="px-10 py-5 rounded-2xl bg-white/5 border border-blue-500/20 text-white font-black text-lg hover:bg-blue-500/10 hover:border-blue-500/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Rocket className="h-5 w-5 text-blue-400" />
                  GET STARTED
                </Link>
              </Magnetic>
              <Magnetic strength={0.1}>
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-magnetic="true"
                  className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Github className="h-5 w-5" />
                  VIEW SOURCE
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Hero Visual — Robot Mascot + Dashboard Video Placeholder */}
          <div className="relative mt-16 w-full max-w-[1200px] mx-auto group">
            {/* Floating Robot Mascot */}
            <div className="absolute -top-8 right-4 md:top-[-60px] md:right-[8%] z-20 w-20 h-28 md:w-28 md:h-40 animate-float">
              <RobotMascot />
            </div>

            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <SyncContainer withNodes={false} className="relative glass-modern p-0 overflow-hidden shadow-2xl w-full">
              <BorderBeam />

              {/* Dashboard video placeholder */}
              <div className="relative bg-[#020a14] p-6 md:p-8 overflow-hidden min-h-[300px] md:min-h-[420px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(14,165,233,0.10),transparent_55%)]" />
                <div className="relative h-full rounded-2xl border border-blue-500/25 bg-black/40 overflow-hidden">
                  <video
                    className="h-full w-full min-h-[260px] md:min-h-[340px] object-cover bg-black/60"
                    controls
                    playsInline
                    muted
                    preload="metadata"
                    poster={heroVideoPlaceholder.poster}
                    aria-label={heroVideoPlaceholder.ariaLabel}
                    width={heroVideoPlaceholder.width}
                    height={heroVideoPlaceholder.height}
                  >
                    <source src={heroVideoPlaceholder.mediaSrc} type={heroVideoPlaceholder.mediaType} />
                    {heroVideoPlaceholder.captionsTrack.map((track) => (
                      <track
                        key={track.src}
                        src={track.src}
                        srcLang={track.srcLang}
                        label={track.label}
                        kind={track.kind}
                      />
                    ))}
                  </video>
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-black/85 to-transparent">
                    <p className="text-xs md:text-sm font-bold text-white tracking-wide uppercase">
                      {heroVideoPlaceholder.overlayTitle}
                    </p>
                    <p className="text-[10px] md:text-xs text-slate-300 mt-1 font-mono">
                      {heroVideoPlaceholder.overlaySubtitle}
                    </p>
                  </div>
                </div>

                {/* HUD overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity">
                  <Activity className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Dashboard_Video_Placeholder</span>
                </div>
              </div>
            </SyncContainer>

            {/* Embedded Stats Card */}
            <div className="absolute -bottom-6 left-4 md:-bottom-10 md:left-6 z-30 glass-modern p-4 md:p-6 rounded-2xl border border-blue-500/20 shadow-2xl animate-float flex">
              <div className="flex flex-col text-left">
                <span className="text-2xl md:text-4xl font-black text-blue-400 tabular-nums tracking-tighter">34</span>
                <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">MCP Tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero stats */}
      <section id="home-proof-strip" data-scaffold-slot="proof-strip" className="max-w-7xl mx-auto px-6 mb-32">
        <StatsGrid stats={heroStats} />
      </section>

      {/* ================================================================
          2. DEEP DIVE: INTERACTIVE ARCHITECTURE
          ================================================================ */}
      <section
        id="home-concepts"
        data-scaffold-slot="concepts"
        className="relative py-24 md:py-32 overflow-hidden border-y border-white/5 bg-white/[0.01]"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-950/10 blur-[120px]" />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center mb-24">
            <GlitchText trigger="hover" intensity="medium">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
                Why Purpose-Built <br className="hidden md:block" /> <span className="text-blue-500">Coordination</span>
              </h2>
            </GlitchText>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
              Agent Mail sidesteps the many footguns of naive multi-agent coordination. Every design decision is battle-tested across 40-50 concurrent agents from different providers working in a single shared codebase.
            </p>
          </div>

          <div className="space-y-32">
            {/* Concept 1: Advisory File Reservations */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-orange-400">
                  <Activity className="h-3 w-3" /> Core Design
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Advisory File Reservations
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Agents call dibs on files temporarily while they work, but reservations are not rigidly enforced and they expire via TTL. This prevents deadlocks while making ownership visible.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  If an agent crashes or gets its memory wiped, stale reservations expire automatically. Other agents can detect untouched files and reclaim them. The optional pre-commit guard adds enforcement at commit time when you want it.
                </p>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <SyncContainer withPulse={true} accentColor="#F97316" className="p-4 md:p-8 bg-black/40 shadow-2xl shadow-orange-900/20">
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    Reservation flow visualization placeholder
                  </div>
                </SyncContainer>
              </div>
            </div>

            {/* Concept 2: Worktrees vs Shared Space */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 bg-green-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-green-400">
                  <Package className="h-3 w-3" /> Key Insight
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Why Not Git Worktrees?
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Git worktrees demolish development velocity and create merge debt you pay later when agents diverge. Working in one shared space surfaces conflicts immediately.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  With advisory reservations and threaded messaging, agents coordinate in real time instead of accumulating silent divergence. The result: zero merge debt, zero lost work, and immediate conflict resolution.
                </p>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <SyncContainer withPulse={true} accentColor="#22C55E" className="p-4 md:p-8 bg-black/40 shadow-2xl shadow-green-900/20">
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    Worktree vs shared-space comparison visualization placeholder
                  </div>
                </SyncContainer>
              </div>
            </div>

            {/* Concept 3: Semi-Persistent Identity */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                  <Sparkles className="h-3 w-3" /> Identity
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Semi-Persistent Identity
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Each agent gets a memorable identity (GreenCastle, BlueLake, RedHarbor) that persists for the duration of a task. But these identities can also vanish without a trace and not break things.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  This is critical because agents crash, get context-wiped, and disappear constantly. The identity system is designed for this reality, not the fantasy of perfectly reliable agents.
                </p>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <SyncContainer withPulse={true} accentColor="#3B82F6" className="p-4 md:p-8 bg-black/40 shadow-2xl shadow-blue-900/20">
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    Agent identity lifecycle visualization placeholder
                  </div>
                </SyncContainer>
              </div>
            </div>

            {/* Concept 4: Targeted Messaging */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
                  <Network className="h-3 w-3" /> Communication
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Targeted, Not Broadcast
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  A naive implementation defaults to broadcast-to-all. Agents are lazy and will only use that, spamming every agent with irrelevant information. It would be like if your email at work defaulted to reply-all every time.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Agent Mail uses targeted messaging with subjects, threads, and explicit recipients. Agents only receive messages addressed to them. Acknowledgment tracking ensures critical messages are never missed.
                </p>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <SyncContainer withPulse={true} accentColor="#A855F7" className="p-4 md:p-8 bg-black/40 shadow-2xl shadow-purple-900/20">
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    Message routing visualization placeholder
                  </div>
                </SyncContainer>
              </div>
            </div>

            {/* Concept 5: Graph-Aware Prioritization */}
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-teal-400">
                  <Zap className="h-3 w-3" /> Task Intelligence
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  Graph-Aware Task Prioritization
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  With hundreds of tasks, you do not want agents randomly choosing or wasting context negotiating. There is usually a &quot;right answer&quot; for what each agent should do next.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  That right answer comes from the dependency graph. The bv tool uses basic graph theory (PageRank, betweenness centrality, critical path analysis) as a compass that tells each agent which direction will unlock the most work overall.
                </p>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <SyncContainer withPulse={true} accentColor="#14B8A6" className="p-4 md:p-8 bg-black/40 shadow-2xl shadow-teal-900/20">
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    Dependency graph prioritization visualization placeholder
                  </div>
                </SyncContainer>
              </div>
            </div>

            {/* Concept 6: Stress-Tested at Scale */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">
                  <Activity className="h-3 w-3" /> Proven at Scale
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  40-50 Agents, Zero Issues
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  Not a prototype. Agent Mail runs with 40-50 concurrent agents mixing Claude Code, Codex CLI, and Gemini CLI on the same project with no issues.
                </p>
                <p className="text-lg text-slate-400 leading-relaxed">
                  The 10-scenario stress gauntlet validates 30-agent message pipelines, pool exhaustion recovery, thundering herd handling, stale lock cleanup, and sustained ~49 RPS mixed workloads. Every scenario passes with zero errors.
                </p>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <SyncContainer withPulse={true} accentColor="#EAB308" className="p-4 md:p-8 bg-black/40 shadow-2xl shadow-yellow-900/20">
                  <div className="text-center py-12 text-slate-500 text-sm font-medium">
                    Stress gauntlet results visualization placeholder
                  </div>
                </SyncContainer>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================
          3. WHY AGENT MAIL (Feature Cards)
          ================================================================ */}
      <SectionShell
        id="features"
        icon="sparkles"
        eyebrow="Why Agent Mail"
        title="Built Different"
        kicker="Agent Mail is purpose-built coordination infrastructure for AI coding agents. Identity, messaging, file reservations, and task prioritization — all backed by SQLite and Git."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </SectionShell>

      {/* ================================================================
          4. HOW IT COMPARES
          ================================================================ */}
      <SectionShell
        id="comparison"
        icon="gitCompare"
        eyebrow="How It Compares"
        title="Coordination Comparison"
        kicker="Agent Mail bakes coordination guarantees into the infrastructure layer. Features that require manual discipline with ad-hoc solutions are enforced by the architecture."
      >
        <ComparisonTable />
      </SectionShell>

      {/* ================================================================
          5. THE CODE
          ================================================================ */}
      <SectionShell
        id="code"
        icon="terminal"
        eyebrow="The Code"
        title="Clean API, Battle-Tested"
        kicker="A fully coordinated multi-agent session in a few lines. Register an identity, reserve files, send targeted messages, and release when done."
      >
        <SyncContainer withPulse={true} accentColor="#3B82F6" className="p-1 md:p-2 bg-black/40">
          <RustCodeBlock code={codeExample} title="examples/server.rs" />
        </SyncContainer>
      </SectionShell>

      {/* ================================================================
          6. ARCHITECTURE PREVIEW (Timeline)
          ================================================================ */}
      <SectionShell
        id="architecture-preview"
        icon="clock"
        eyebrow="Development Timeline"
        title="From Prototype to Production"
        kicker="Battle-tested across thousands of agent sessions. Every phase documented, every design decision proven in practice."
      >
        <Timeline items={changelog.slice(0, 3)} />

        <div className="mt-10 flex justify-center">
          <Link
            href="/architecture"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition-all hover:border-blue-500/30 hover:bg-white/10 hover:text-white"
          >
            View Full Architecture
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </SectionShell>

      {/* ================================================================
          7. GET STARTED CTA
          ================================================================ */}
      <section id="home-cta" data-scaffold-slot="next-steps" className="relative overflow-hidden py-28 md:py-36 lg:py-44">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/80 to-blue-900/50 text-blue-400 shadow-lg shadow-blue-900/10">
              <Rocket className="h-6 w-6" />
            </div>
          </div>

          <GlitchText trigger="hover" intensity="medium">
            <h2 className="font-bold tracking-tighter text-white text-4xl md:text-6xl">
              Ready to Build?
            </h2>
          </GlitchText>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl font-medium">
            Add Agent Mail to your project with a single command. Coordinate
            40+ concurrent AI agents from any provider with zero conflicts.
          </p>

          {/* Install command */}
          <div className="mx-auto mt-10 max-w-md">
            <div className="glow-blue overflow-hidden rounded-2xl border border-blue-500/20 bg-black/60 shadow-xl shadow-blue-950/30">
              <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/60" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
                  <div className="h-3 w-3 rounded-full bg-blue-500/60" />
                </div>
                <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">terminal</span>
              </div>

              <div className="px-6 py-5">
                <div className="flex items-center gap-3 font-mono text-sm">
                  <span className="select-none text-blue-500 font-bold">$</span>
                  <code className="text-slate-200 font-bold tracking-tight">pip install mcp-agent-mail</code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <Package className="h-3 w-3 text-blue-400" />
              MIT License &middot; Free &amp; Open Source
            </div>

            <Link
              href="/getting-started"
              data-magnetic="true"
              className="glow-blue group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-900/30 transition-all hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-800/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020a14]"
            >
              <Rocket className="h-5 w-5" />
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================
          8. AGENT FLYWHEEL + AUTHOR CREDIT (Grand Finale)
          ================================================================ */}
      <section id="flywheel" className="relative border-t border-white/5">
        <AgentFlywheel />
      </section>

    </main>
  );
}
