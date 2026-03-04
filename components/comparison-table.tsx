"use client";

import { useMemo } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { comparisonData } from "@/lib/content";
import type { AgentMailComparisonRow } from "@/lib/content";
import { cn } from "@/lib/utils";
import { SyncContainer } from "./sync-elements";
import GlitchText from "./glitch-text";
import { motion } from "framer-motion";

function StatusCell({ value }: { value: string }) {
  const isPositive = [
    "Persistent, project-scoped", "Threaded + searchable", "Advisory reservations + guard",
    "Git + SQLite", "Product bus", "Hybrid lexical + semantic", "15-screen TUI + Web UI",
    "34 tools + 20 resources", "Auto-detect + register", "Built-in ack protocol",
    "Build slot management", "10/10 gauntlet (30 agents)",
  ].includes(value);
  const isPartial = [
    "Isolated branches", "Git history only", "Git log", "File history",
    "File browser", "Text search", "Append-only files",
  ].includes(value);
  const isNegative = ["None", "Manual", "N/A", "Race conditions"].includes(value);

  return (
    <td
      className={cn(
        "whitespace-nowrap px-4 py-3 text-sm font-medium",
        isPositive && "text-blue-400",
        isPartial && "text-yellow-400/80",
        isNegative && "text-slate-500"
      )}
    >
      {isPositive && <span className="mr-1.5 shadow-[0_0_8px_#3B82F6]">&#10003;</span>}
      {isNegative && <span className="mr-1.5">&#10005;</span>}
      {isPartial && <span className="mr-1.5">&#9888;</span>}
      {value}
    </td>
  );
}

export default function ComparisonTable() {
  const columns = useMemo<ColumnDef<AgentMailComparisonRow>[]>(
    () => [
      { accessorKey: "feature", header: "Feature" },
      {
        accessorKey: "agentMail",
        header: () => (
          <GlitchText trigger="hover" intensity="low">
            Agent Mail
          </GlitchText>
        ),
      },
      { accessorKey: "gitWorktrees", header: "Git Worktrees" },
      { accessorKey: "sharedDocs", header: "Shared Docs" },
      { accessorKey: "noCoordination", header: "No Coordination" },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: comparisonData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.feature,
  });

  return (
    <SyncContainer withPulse={true} className="overflow-hidden border-blue-500/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Agent coordination approach comparison">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/5 bg-white/[0.02]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-4 text-xs font-bold uppercase tracking-widest",
                      header.column.id === "agentMail" ? "text-blue-400" : "text-slate-500"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/5">
            {table.getRowModel().rows.map((row) => (
              <motion.tr
                key={row.id}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                className="transition-colors group"
              >
                {row.getVisibleCells().map((cell) => {
                  if (cell.column.id === "feature") {
                    return (
                      <td key={cell.id} className="px-4 py-3 text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                        <GlitchText trigger="hover" intensity="low" className="w-full">
                          {String(cell.getValue())}
                        </GlitchText>
                      </td>
                    );
                  }

                  return <StatusCell key={cell.id} value={String(cell.getValue())} />;
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </SyncContainer>
  );
}
