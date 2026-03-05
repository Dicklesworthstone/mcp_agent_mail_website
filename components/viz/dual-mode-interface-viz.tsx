"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizHeader,
  VizLearningBlock,
  VizMetricCard,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";
import { ShieldX, Bot, UserCog, Zap } from "lucide-react";

type ModeContext = "agent" | "human";
type CommandType = "mcp" | "cli";

export default function DualModeInterfaceViz() {
  const reducedMotion = useVizReducedMotion();
  const [context, setContext] = useState<ModeContext>("agent");
  const [command, setCommand] = useState<CommandType>("cli");
  const [isTyping, setIsTyping] = useState(false);

  const handleRun = (cmd: CommandType) => {
    setCommand(cmd);
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 800);
  };

  const isSafe =
    (context === "agent" && command === "mcp") ||
    (context === "human" && command === "cli");

  const cmdString = command === "mcp" ? "mcp-agent-mail" : "am status";

  const getOutcome = () => {
    if (isTyping) return { title: "Executing...", tone: "neutral" as const };
    if (isSafe) {
      return context === "agent"
        ? { title: "JSON-RPC Active", tone: "green" as const }
        : { title: "TUI Rendered", tone: "green" as const };
    }
    return { title: "Execution Blocked", tone: "red" as const };
  };

  const outcome = getOutcome();

  return (
    <VizSurface aria-label="Dual Mode Interface Architecture">
      <VizHeader
        accent="violet"
        eyebrow="Mode Security"
        title="Dual-Mode Surface Isolation"
        subtitle="Agent Mail uses a shared core binary but enforces strict runtime surface separation to prevent disastrous mode-confusion loops."
        controls={
          <div className="flex gap-2">
            <VizControlButton
              tone={context === "agent" ? "blue" : "neutral"}
              onClick={() => setContext("agent")}
            >
              Agent Context
            </VizControlButton>
            <VizControlButton
              tone={context === "human" ? "amber" : "neutral"}
              onClick={() => setContext("human")}
            >
              Human Context
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <VizMetricCard label="Current Actor" value={context === "agent" ? "AI Swarm" : "Operator"} tone={context === "agent" ? "blue" : "amber"} />
        <VizMetricCard label="Command" value={cmdString} tone="blue" />
        <VizMetricCard label="Outcome" value={outcome.title} tone={outcome.tone} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Input Panel */}
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-lg border ${context === "agent" ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : "bg-amber-500/20 border-amber-500/50 text-amber-400"}`}>
              {context === "agent" ? <Bot className="w-8 h-8" /> : <UserCog className="w-8 h-8" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">Select Command</p>
              <p className="text-xs text-slate-400">What should the {context} run?</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleRun("mcp")}
              className={`text-left p-3 rounded border font-mono text-sm transition-all relative overflow-hidden ${
                command === "mcp" && !isTyping ? "border-blue-500 bg-blue-500/10 text-blue-200" : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
              }`}
            >
              $ mcp-agent-mail
              {command === "mcp" && !isTyping && (
                <motion.div layoutId="active-cmd" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => handleRun("cli")}
              className={`text-left p-3 rounded border font-mono text-sm transition-all relative overflow-hidden ${
                command === "cli" && !isTyping ? "border-blue-500 bg-blue-500/10 text-blue-200" : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-500 hover:bg-slate-800"
              }`}
            >
              $ am status
              {command === "cli" && !isTyping && (
                <motion.div layoutId="active-cmd" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="rounded-xl border border-white/10 bg-slate-950 p-4 flex flex-col font-mono text-xs overflow-hidden relative">
          <div className="flex items-center justify-between mb-2 text-slate-500 border-b border-slate-800 pb-2">
            <span>Terminal Output</span>
            {isTyping ? <span className="animate-pulse">Running...</span> : <span>Idle</span>}
          </div>
          
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {isTyping ? (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 p-4"
                >
                  <span className="text-slate-400">$ {cmdString}</span>
                  <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse" />
                </motion.div>
              ) : (
                <motion.div
                  key={`result-${context}-${command}`}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 p-2 overflow-auto"
                >
                  <div className="mb-2 text-slate-500">$ {cmdString}</div>
                  
                  {isSafe && context === "agent" && (
                    <div className="text-green-400">
                      {"{"}<br />
                      &nbsp;&nbsp;&quot;jsonrpc&quot;: &quot;2.0&quot;,<br />
                      &nbsp;&nbsp;&quot;method&quot;: &quot;initialize&quot;,<br />
                      &nbsp;&nbsp;&quot;params&quot;: {"{"} ... {"}"}<br />
                      {"}"}
                    </div>
                  )}

                  {isSafe && context === "human" && (
                    <div className="text-blue-300">
                      <div className="border border-blue-500/50 rounded bg-blue-900/20 p-2 mb-2">
                         [ Agent Mail Operator Console ]
                      </div>
                      <span className="text-green-400">✔</span> System Healthy<br/>
                      <span className="text-green-400">✔</span> 3 Agents Active<br/>
                      <span className="text-slate-500">Press &apos;?&apos; for help</span>
                    </div>
                  )}

                  {!isSafe && context === "agent" && (
                    <div className="text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900">
                      <div className="flex items-center gap-2 font-bold mb-2 text-rose-500">
                        <ShieldX className="w-4 h-4" /> BLOCKED BY GUARDRAIL
                      </div>
                      <span className="text-rose-300">Error:</span> Agent detected attempting to launch interactive TUI.<br/><br/>
                      <span className="text-slate-400 opacity-70">
                        If allowed, this would cause the LLM to hallucinate parsing endless ANSI escape sequences, burning thousands of tokens.
                      </span><br/><br/>
                      <span className="font-bold">Process exited with code 2.</span>
                    </div>
                  )}

                  {!isSafe && context === "human" && (
                    <div className="text-rose-400 bg-rose-950/30 p-2 rounded border border-rose-900">
                      <div className="flex items-center gap-2 font-bold mb-2 text-rose-500">
                        <Zap className="w-4 h-4" /> INTERACTIVE TTY DETECTED
                      </div>
                      <span className="text-rose-300">Warning:</span> You launched the raw MCP server inside a human terminal session.<br/><br/>
                      <span className="text-slate-400 opacity-70">
                        Please use the <code className="text-amber-300">am</code> command instead to access the operator dashboard.
                      </span><br/><br/>
                      <span className="font-bold">Process gracefully aborted.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <VizLearningBlock
        accent="violet"
        title="Key Security Benefits"
        items={[
          "Prevents catastrophic token burn by instantly halting interactive shells when run by agents.",
          "Protects operators from confusing blank screens by refusing to run raw JSON-RPC servers in TTYs.",
          "Single core binary guarantees both interfaces always share the exact same underlying logic and database access.",
        ]}
      />
    </VizSurface>
  );
}
