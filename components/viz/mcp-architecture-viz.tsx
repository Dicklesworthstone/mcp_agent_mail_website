"use client";

import { VizSurface, vizPanelClassName } from "@/components/viz/viz-framework";
import { Database, Server, TerminalSquare, Bot } from "lucide-react";

export default function McpArchitectureViz() {
  return (
    <VizSurface aria-label="MCP Agent Mail Architecture">
      <div className="mb-6">
        <h3 className="text-xl font-black text-white">System Architecture</h3>
        <p className="mt-2 text-sm text-slate-400">
          Agent Mail leverages the Model Context Protocol (MCP) to provide standard tools over standard stdio/HTTP interfaces.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch justify-center">
        {/* Agents */}
        <div className="flex-1 flex flex-col gap-3">
          <div className={`${vizPanelClassName} p-4 flex items-center gap-3 border-purple-500/30`}>
            <Bot className="text-purple-400 w-8 h-8" />
            <div>
              <div className="font-bold text-slate-200 text-sm">Claude Code</div>
              <div className="text-xs text-slate-500">MCP Client (stdio)</div>
            </div>
          </div>
          <div className={`${vizPanelClassName} p-4 flex items-center gap-3 border-orange-500/30`}>
            <Bot className="text-orange-400 w-8 h-8" />
            <div>
              <div className="font-bold text-slate-200 text-sm">Cursor</div>
              <div className="text-xs text-slate-500">MCP Client (SSE/HTTP)</div>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <div className="flex items-center justify-center md:flex-col gap-2 text-slate-600 px-2">
          <div className="hidden md:block w-px h-12 bg-slate-700"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest rotate-90 md:rotate-0">MCP</span>
          <div className="hidden md:block w-px h-12 bg-slate-700"></div>
        </div>

        {/* Server */}
        <div className={`${vizPanelClassName} flex-1 p-6 flex flex-col items-center justify-center border-blue-500/30 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-blue-500/5" />
          <Server className="w-10 h-10 text-blue-400 mb-3 relative z-10" />
          <h4 className="font-bold text-slate-200 relative z-10">Agent Mail Server</h4>
          <p className="text-xs text-slate-400 mt-2 relative z-10">
            Handles macros, reservations, routing, and access control.
          </p>
        </div>

        {/* Arrows */}
        <div className="flex items-center justify-center md:flex-col gap-2 text-slate-600 px-2">
          <div className="hidden md:block w-px h-12 bg-slate-700"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest rotate-90 md:rotate-0">SQL</span>
          <div className="hidden md:block w-px h-12 bg-slate-700"></div>
        </div>

        {/* DB */}
        <div className="flex-1 flex flex-col gap-3">
          <div className={`${vizPanelClassName} p-4 flex items-center gap-3 border-emerald-500/30`}>
            <Database className="text-emerald-400 w-8 h-8" />
            <div>
              <div className="font-bold text-slate-200 text-sm">SQLite + FTS5</div>
              <div className="text-xs text-slate-500">Fast, local persistence</div>
            </div>
          </div>
          <div className={`${vizPanelClassName} p-4 flex items-center gap-3 border-slate-500/30`}>
            <TerminalSquare className="text-slate-400 w-8 h-8" />
            <div>
              <div className="font-bold text-slate-200 text-sm">Doctor CLI</div>
              <div className="text-xs text-slate-500">Diagnostics & Repair</div>
            </div>
          </div>
        </div>
      </div>
    </VizSurface>
  );
}
