"use client";

import { VizSurface, vizPanelClassName } from "@/components/viz/viz-framework";
import { CheckCircle2, CircleDashed, ArrowRight, Layers } from "lucide-react";

export default function McpBeadsIntegrationViz() {
  return (
    <VizSurface aria-label="MCP Beads Integration">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">Beads Tracking Integration</h3>
        <p className="mt-2 text-sm text-slate-400">
          Agent Mail integrates with <code className="font-mono text-blue-300">br</code> issue flow by reusing bead IDs across reservations and message threads.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Flow steps */}
        <div className={`${vizPanelClassName} p-5 flex items-center justify-between border-slate-700/50`}>
          <div className="flex items-center gap-4">
            <CircleDashed className="text-amber-400 w-6 h-6" />
            <div>
              <p className="text-sm font-bold text-slate-200">1. Select Work</p>
              <p className="text-xs text-slate-400 font-mono">br ready --json</p>
            </div>
          </div>
          <ArrowRight className="text-slate-600 hidden md:block" />
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded">bd-123</span>
          </div>
        </div>

        <div className={`${vizPanelClassName} p-5 flex items-center justify-between border-slate-700/50`}>
          <div className="flex items-center gap-4">
            <Layers className="text-blue-400 w-6 h-6" />
            <div>
              <p className="text-sm font-bold text-slate-200">2. Reserve Files</p>
              <p className="text-xs text-slate-400 font-mono">file_reservation_paths(..., reason=&quot;bd-123&quot;)</p>
            </div>
          </div>
          <ArrowRight className="text-slate-600 hidden md:block" />
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">Lock files with reason</span>
          </div>
        </div>

        <div className={`${vizPanelClassName} p-5 flex items-center justify-between border-slate-700/50`}>
          <div className="flex items-center gap-4">
            <Layers className="text-indigo-400 w-6 h-6" />
            <div>
              <p className="text-sm font-bold text-slate-200">3. Announce in Thread</p>
              <p className="text-xs text-slate-400 font-mono">send_message(..., thread_id=&quot;bd-123&quot;)</p>
            </div>
          </div>
          <ArrowRight className="text-slate-600 hidden md:block" />
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded">Shared execution context</span>
          </div>
        </div>

        <div className={`${vizPanelClassName} p-5 flex items-center justify-between border-slate-700/50`}>
          <div className="flex items-center gap-4">
            <CheckCircle2 className="text-green-400 w-6 h-6" />
            <div>
              <p className="text-sm font-bold text-slate-200">4. Complete & Release</p>
              <p className="text-xs text-slate-400 font-mono">br close bd-123</p>
            </div>
          </div>
          <ArrowRight className="text-slate-600 hidden md:block" />
          <div className="text-right hidden md:block">
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">Done</span>
          </div>
        </div>
      </div>
    </VizSurface>
  );
}
