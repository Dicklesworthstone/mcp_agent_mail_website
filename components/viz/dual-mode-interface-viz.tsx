"use client";

import { VizSurface } from "@/components/viz/viz-framework";
import { Terminal, ShieldX, CheckCircle, SplitSquareVertical } from "lucide-react";

export default function DualModeInterfaceViz() {
  return (
    <VizSurface aria-label="Dual Mode Interface Architecture">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">Strict Dual-Mode Safety</h3>
        <p className="mt-2 text-sm text-slate-400">
          Agent Mail uses a shared core binary but enforces strict runtime surface separation to prevent disastrous mode-confusion loops.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Side: Agent Context */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-purple-400" />
              Agent Context (MCP)
            </h4>
            
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-xs font-mono">
                <div className="text-emerald-400 flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3" /> $ mcp-agent-mail
                </div>
                <div className="text-slate-400 pl-5">Starts the stdio JSON-RPC server cleanly.</div>
              </div>
              
              <div className="bg-rose-500/10 border border-rose-500/30 rounded p-3 text-xs font-mono">
                <div className="text-rose-400 flex items-center gap-2 mb-1">
                  <ShieldX className="w-3 h-3" /> $ am status
                </div>
                <div className="text-slate-400 pl-5">
                  <span className="text-rose-400">BLOCKED:</span> Agent tried to run the human CLI! Fails with Exit Code 2 to prevent hallucinating an infinite interactive TUI loop.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Human Context */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4">
            <h4 className="font-bold text-slate-300 flex items-center gap-2 mb-4">
              <SplitSquareVertical className="w-4 h-4 text-amber-400" />
              Operator Context (TTY)
            </h4>
            
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-3 text-xs font-mono">
                <div className="text-emerald-400 flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3 h-3" /> $ am status
                </div>
                <div className="text-slate-400 pl-5">Boots the interactive 15-screen TUI correctly.</div>
              </div>
              
              <div className="bg-rose-500/10 border border-rose-500/30 rounded p-3 text-xs font-mono">
                <div className="text-rose-400 flex items-center gap-2 mb-1">
                  <ShieldX className="w-3 h-3" /> $ mcp-agent-mail
                </div>
                <div className="text-slate-400 pl-5">
                  <span className="text-rose-400">BLOCKED:</span> Human tried to run the raw MCP server in a TTY! Fails with a friendly warning to use <code className="text-amber-300">am</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </VizSurface>
  );
}
