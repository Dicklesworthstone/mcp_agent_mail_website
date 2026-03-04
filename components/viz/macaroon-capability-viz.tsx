"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "@/components/motion";

interface Caveat {
  id: string;
  label: string;
  description: string;
  color: string;
}

const ALL_CAPABILITIES = [
  { id: "spawn", label: "Spawn", desc: "Create child tasks" },
  { id: "time", label: "Time", desc: "Access clocks and timers" },
  { id: "trace", label: "Trace", desc: "Emit tracing events" },
  { id: "region", label: "Region", desc: "Create sub-regions" },
  { id: "obligation", label: "Obligation", desc: "Create Permits/Leases" },
  { id: "io", label: "I/O", desc: "Network and filesystem" },
];

const AVAILABLE_CAVEATS: Caveat[] = [
  { id: "time-before", label: "TimeBefore(5000ms)", description: "Token expires after 5s of virtual time", color: "#F97316" },
  { id: "region-scope", label: "RegionScope(worker-3)", description: "Restricted to a single Region", color: "#3B82F6" },
  { id: "max-uses", label: "MaxUses(10)", description: "Can only be checked 10 times", color: "#8B5CF6" },
  { id: "resource-scope", label: "ResourceScope(db/*)", description: "Only database resource paths", color: "#22C55E" },
  { id: "rate-limit", label: "RateLimit(100/60s)", description: "Max 100 uses per 60-second window", color: "#EAB308" },
  { id: "no-io", label: "ResourceScope(!net/*)", description: "Block all network access", color: "#EF4444" },
];

// Which capabilities each caveat removes
const CAVEAT_RESTRICTIONS: Record<string, string[]> = {
  "time-before": [],
  "region-scope": ["region"],
  "max-uses": [],
  "resource-scope": ["io"],
  "rate-limit": [],
  "no-io": ["io", "trace"],
};

export default function MacaroonCapabilityViz() {
  const prefersReduced = useReducedMotion();
  const [appliedCaveats, setAppliedCaveats] = useState<string[]>([]);

  const addCaveat = useCallback((id: string) => {
    setAppliedCaveats((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const reset = useCallback(() => {
    setAppliedCaveats([]);
  }, []);

  // Compute which capabilities are restricted
  const restrictedCaps = new Set<string>();
  appliedCaveats.forEach((cid) => {
    (CAVEAT_RESTRICTIONS[cid] || []).forEach((cap) => restrictedCaps.add(cap));
  });

  const dur = prefersReduced ? 0 : 0.3;

  return (
    <div className="w-full rounded-2xl border border-white/10 p-6 md:p-8 bg-slate-950">
      <h3 className="mb-1 text-lg font-semibold text-white">Macaroon Capability Attenuation</h3>
      <p className="mb-5 text-sm text-teal-400">Add caveats to restrict — never widen — a capability token</p>

      {/* Token visualization */}
      <div className="mb-6 rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-teal-500" style={{ filter: "drop-shadow(0 0 4px #14B8A6)" }} />
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Bearer Token</span>
          <span className="ml-auto text-xs text-slate-600 font-mono">
            {appliedCaveats.length} caveat{appliedCaveats.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Capability grid */}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ALL_CAPABILITIES.map((cap) => {
            const restricted = restrictedCaps.has(cap.id);
            return (
              <motion.div
                key={cap.id}
                className="rounded-lg border p-2 text-center"
                animate={{
                  borderColor: restricted ? "#EF444440" : "#22C55E40",
                  backgroundColor: restricted ? "#EF444408" : "#22C55E08",
                  opacity: restricted ? 0.5 : 1,
                }}
                transition={{ duration: dur }}
              >
                <div
                  className="text-xs font-bold"
                  style={{ color: restricted ? "#EF4444" : "#22C55E" }}
                >
                  {restricted ? "✗" : "✓"} {cap.label}
                </div>
                <div className="mt-0.5 text-[9px] text-slate-600">{cap.desc}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Applied caveats chain */}
        <AnimatePresence>
          {appliedCaveats.length > 0 && (
            <motion.div
              className="mt-4 flex flex-wrap gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span className="text-[10px] text-slate-600 self-center mr-1">CAVEATS:</span>
              {appliedCaveats.map((cid) => {
                const caveat = AVAILABLE_CAVEATS.find((c) => c.id === cid);
                if (!caveat) return null;
                return (
                  <motion.span
                    key={cid}
                    className="inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-mono font-bold"
                    style={{
                      borderColor: `${caveat.color}40`,
                      color: caveat.color,
                      backgroundColor: `${caveat.color}10`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: dur }}
                  >
                    {caveat.label}
                  </motion.span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Caveat selector */}
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        Add Caveat (can only restrict)
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {AVAILABLE_CAVEATS.map((caveat) => {
          const applied = appliedCaveats.includes(caveat.id);
          return (
            <button
              key={caveat.id}
              onClick={() => addCaveat(caveat.id)}
              disabled={applied}
              className="flex items-start gap-3 rounded-lg border p-3 text-left transition hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: applied ? `${caveat.color}30` : "#1E293B" }}
            >
              <div
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: caveat.color }}
              />
              <div>
                <div className="text-xs font-bold font-mono" style={{ color: caveat.color }}>
                  {caveat.label}
                </div>
                <div className="text-[10px] text-slate-500">{caveat.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Reset */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={reset}
          className="rounded-lg border px-6 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5"
          style={{ borderColor: "#1e293b" }}
        >
          Reset Token
        </button>
      </div>

      <p className="mt-3 text-center text-[10px] text-slate-600">
        Caveats can only be added, never removed. Delegation is always safe — the token can only become more restricted.
      </p>
    </div>
  );
}
