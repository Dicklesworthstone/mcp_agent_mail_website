"use client";

import { useMemo } from "react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { comparisonData } from "@/lib/content";
import type { ComparisonRow } from "@/lib/content";
import { cn } from "@/lib/utils";
import { SyncContainer } from "./sync-elements";
import GlitchText from "./glitch-text";
import { motion } from "framer-motion";

function StatusCell({ value }: { value: string }) {
  const isPositive = ["First-class", "3-phase", "Enforced", "Built-in", "Lab Runtime", "Compile-time", "3-lane", "Guaranteed", "8+", "12 proofs", "Reserve/Commit", "35 rules (Lean)", "Spectral (real-time)", "17 built-in", "Macaroon (8 caveats)", "E-process (anytime)", "16 op kinds (CALM)", "Lyapunov + martingale"].includes(value);
  const isPartial = ["Work-stealing", "Separate crates", "Partial", "Loom tests", "Best-effort"].includes(value);
  const isNegative = ["Manual", "No", "Silent drop", "Minimal"].includes(value);

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
  const columns = useMemo<ColumnDef<ComparisonRow>[]>(
    () => [
      { accessorKey: "feature", header: "Feature" },
      {
        accessorKey: "asupersync",
        header: () => (
          <GlitchText trigger="hover" intensity="low">
            Asupersync
          </GlitchText>
        ),
      },
      { accessorKey: "tokio", header: "Tokio" },
      { accessorKey: "asyncStd", header: "async-std" },
      { accessorKey: "smol", header: "smol" },
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
        <table className="w-full text-left" aria-label="Async runtime feature comparison">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-white/5 bg-white/[0.02]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-4 text-xs font-bold uppercase tracking-widest",
                      header.column.id === "asupersync" ? "text-blue-400" : "text-slate-500"
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
