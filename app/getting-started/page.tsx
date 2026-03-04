"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Check, ArrowRight, BookOpen, Shield, Blocks, Sparkles } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import SectionShell from "@/components/section-shell";
import RustCodeBlock from "@/components/rust-code-block";
import RobotMascot from "@/components/robot-mascot";
import GlitchText from "@/components/glitch-text";
import { SyncContainer } from "@/components/sync-elements";
import {
  gettingStartedInstallCommand,
  gettingStartedQuickstartExample,
  gettingStartedMcpConfigSnippet,
  gettingStartedFaq,
  gettingStartedPillars,
} from "@/lib/content";

export default function GettingStartedPage() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const text = gettingStartedInstallCommand;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <main id="main-content">
      {/* Cinematic Header */}
      <section
        id="getting-started-hero"
        data-scaffold-slot="hero"
        className="relative pt-32 pb-20 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-28">
              <RobotMascot />
            </div>
          </div>

          <GlitchText trigger="hover" intensity="medium">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6">
              Get Started
            </h1>
          </GlitchText>
          <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">
            Install MCP Agent Mail, start the server, and launch your first reservation-aware multi-agent workflow.
          </p>
        </div>
      </section>

      {/* Installation */}
      <SectionShell
        id="install"
        icon="rocket"
        eyebrow="Step 1"
        title="Install"
        kicker="Install the binary with the recommended one-liner."
      >
        <SyncContainer className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 font-mono text-lg">
              <span className="text-blue-500 font-bold select-none">$</span>
              <code className="text-white font-bold">{gettingStartedInstallCommand}</code>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-blue-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </SyncContainer>
      </SectionShell>

      {/* Quick Example */}
      <SectionShell
        id="example"
        icon="terminal"
        eyebrow="Step 2"
        title="Run Your First Coordination Flow"
        kicker="Start `am`, register an agent, reserve files, and coordinate through threaded messages."
      >
        <SyncContainer withPulse={true} accentColor="#3B82F6" className="p-1 md:p-2 bg-black/40">
          <RustCodeBlock code={gettingStartedQuickstartExample} title="quickstart.md" />
        </SyncContainer>
      </SectionShell>

      <SectionShell
        id="config"
        icon="cpu"
        eyebrow="Step 3"
        title="Configure MCP Client"
        kicker="Add the MCP server entry once; then your agent CLI can call Agent Mail tools directly."
      >
        <SyncContainer withPulse={true} accentColor="#3B82F6" className="p-1 md:p-2 bg-black/40">
          <RustCodeBlock code={gettingStartedMcpConfigSnippet} title=".mcp.json / .codex/config.json" />
        </SyncContainer>
      </SectionShell>

      {/* Three Pillars */}
      <SectionShell
        id="pillars"
        icon="shield"
        eyebrow="Core Patterns"
        title="Three Pillars"
        kicker="The foundations of safe multi-agent execution at scale."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {gettingStartedPillars.map((pillar) => {
            const Icon = pillar.icon === "blocks" ? Blocks : pillar.icon === "shield" ? Shield : Sparkles;
            return (
            <motion.div
              key={pillar.title}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-8 hover:border-blue-500/20 transition-all"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-6"
                style={{ backgroundColor: `${pillar.color}15`, color: pillar.color }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">{pillar.title}</h3>
              <p className="text-slate-400 leading-relaxed">{pillar.description}</p>
            </motion.div>
          );
          })}
        </div>
      </SectionShell>

      {/* FAQ */}
      <SectionShell
        id="faq"
        icon="fileText"
        eyebrow="FAQ"
        title="Common Questions"
        kicker="Answers to common setup and operations questions for MCP Agent Mail."
      >
        <div className="space-y-4">
          {gettingStartedFaq.map((item) => (
            <details key={item.question} className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <summary className="flex items-center justify-between px-8 py-6 cursor-pointer text-white font-bold hover:text-blue-400 transition-colors">
                {item.question}
                <ArrowRight className="h-4 w-4 text-slate-600 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-8 pb-6 text-slate-400 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </SectionShell>

      {/* Navigation */}
      <section
        id="getting-started-next-steps"
        data-scaffold-slot="next-steps"
        className="mx-auto max-w-7xl px-6 py-20 flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Link href="/architecture" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 hover:border-blue-500/30 hover:text-white transition-all">
          <BookOpen className="h-4 w-4" />
          Read the System Architecture
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link href="/showcase" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 hover:border-blue-500/30 hover:text-white transition-all">
          Explore Interactive Demos
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </main>
  );
}
