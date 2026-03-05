"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizReducedMotion,
} from "@/components/viz/viz-framework";

/* ─── Constants ──────────────────────────────────────────────────── */

const MAX_TOKENS = 200_000;
const CODE_TOKENS_PER_STEP = 8_000; // Tokens used for actual coding work
const CHAT_OVERHEAD_PER_STEP = 12_000; // Tokens wasted on coordination in chat
const MAIL_OVERHEAD_PER_STEP = 200; // Token cost of an MCP tool call
const TOTAL_STEPS = 10;

interface ColumnState {
  step: number;
  tokensUsed: number;
  codeTokens: number;
  coordTokens: number;
  events: string[];
}

const COORDINATION_EVENTS = [
  "Broadcast: 'I'm working on auth module'",
  "Reply-all: 'OK, I'll avoid auth files'",
  "Status update: 'Auth refactor 40% done'",
  "Question: 'Who's handling the tests?'",
  "Reply-all: 'I can do tests after lunch'",
  "Broadcast: 'Found a bug in JWT parsing'",
  "Reply: 'Can you share the stack trace?'",
  "Full trace pasted into context (2000 tokens)",
  "Summary: 'All auth changes merged'",
  "Status: 'Moving to API routes now'",
];

const MAIL_EVENTS = [
  "send_message(to=BlueLake, thread='AUTH-1')",
  "file_reservation_paths(['src/auth/**'])",
  "fetch_inbox() -> 0 new messages",
  "send_message(to=CoralBay, thread='AUTH-1')",
  "search_messages('JWT parsing') -> 1 result",
  "acknowledge_message(msg_id='m-042')",
  "release_file_reservations(['src/auth/**'])",
  "macro_prepare_thread('API-2')",
  "file_reservation_paths(['src/api/**'])",
  "send_message(to=BlueLake, thread='API-2')",
];

/* ─── Component ──────────────────────────────────────────────────── */

export default function TokenEconomyViz() {
  const reducedMotion = useVizReducedMotion();
  const [chatState, setChatState] = useState<ColumnState>({
    step: 0, tokensUsed: 0, codeTokens: 0, coordTokens: 0, events: [],
  });
  const [mailState, setMailState] = useState<ColumnState>({
    step: 0, tokensUsed: 0, codeTokens: 0, coordTokens: 0, events: [],
  });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => {
    setChatState((prev) => {
      if (prev.step >= TOTAL_STEPS) return prev;
      const coordCost = CHAT_OVERHEAD_PER_STEP;
      const codeCost = CODE_TOKENS_PER_STEP;
      const total = prev.tokensUsed + coordCost + codeCost;
      const overflow = total > MAX_TOKENS;
      return {
        step: prev.step + 1,
        tokensUsed: Math.min(total, MAX_TOKENS),
        codeTokens: prev.codeTokens + (overflow ? Math.max(0, MAX_TOKENS - prev.tokensUsed - coordCost) : codeCost),
        coordTokens: prev.coordTokens + coordCost,
        events: [COORDINATION_EVENTS[prev.step % COORDINATION_EVENTS.length], ...prev.events],
      };
    });

    setMailState((prev) => {
      if (prev.step >= TOTAL_STEPS) return prev;
      const coordCost = MAIL_OVERHEAD_PER_STEP;
      const codeCost = CODE_TOKENS_PER_STEP;
      return {
        step: prev.step + 1,
        tokensUsed: prev.tokensUsed + coordCost + codeCost,
        codeTokens: prev.codeTokens + codeCost,
        coordTokens: prev.coordTokens + coordCost,
        events: [MAIL_EVENTS[prev.step % MAIL_EVENTS.length], ...prev.events],
      };
    });
  }, []);

  const handleStart = useCallback(() => {
    setRunning(true);
  }, []);

  const handleReset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
    setChatState({ step: 0, tokensUsed: 0, codeTokens: 0, coordTokens: 0, events: [] });
    setMailState({ step: 0, tokensUsed: 0, codeTokens: 0, coordTokens: 0, events: [] });
  }, []);

  useEffect(() => {
    if (running && chatState.step < TOTAL_STEPS) {
      intervalRef.current = setInterval(advance, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, chatState.step, advance]);

  const isDone = chatState.step >= TOTAL_STEPS;

  return (
    <VizSurface aria-label="Token economy comparison: chat coordination vs Agent Mail">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-white">Token Economy</h3>
          <p className="text-sm text-slate-400">
            Chat-based coordination burns context window tokens. Agent Mail keeps coordination off the token budget.
          </p>
        </div>
        <div className="flex gap-2">
          <VizControlButton tone={running ? "neutral" : "green"} onClick={handleStart} disabled={running || isDone}>
            {isDone ? "Complete" : running ? "Running..." : "Run 10 Work Steps"}
          </VizControlButton>
          <VizControlButton tone="neutral" onClick={handleReset}>
            Reset
          </VizControlButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Chat-based coordination */}
        <div className="rounded-xl border border-red-500/20 bg-black/30 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <p className="text-xs font-bold text-red-300">Chat-Based Coordination</p>
          </div>

          <TokenGauge
            label="Context Window"
            tokensUsed={chatState.tokensUsed}
            codeTokens={chatState.codeTokens}
            coordTokens={chatState.coordTokens}
            accentColor="#3B82F6"
            coordColor="#EF4444"
            isOverflowing={chatState.tokensUsed >= MAX_TOKENS * 0.9}
          />

          {/* Event log */}
          <div className="space-y-1 max-h-32 overflow-hidden">
            {chatState.events.slice(0, 5).map((evt, i) => (
              <motion.p
                key={`chat-${chatState.step}-${i}`}
                initial={reducedMotion ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-red-300/70 font-mono truncate"
              >
                &gt; {evt}
              </motion.p>
            ))}
          </div>

          {isDone && chatState.tokensUsed >= MAX_TOKENS * 0.9 && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-center">
              <p className="text-xs font-bold text-red-400">Context window exhausted!</p>
              <p className="text-[10px] text-red-300/60">
                {Math.round((chatState.coordTokens / chatState.tokensUsed) * 100)}% of tokens spent on coordination, not coding
              </p>
            </div>
          )}
        </div>

        {/* Agent Mail */}
        <div className="rounded-xl border border-green-500/20 bg-black/30 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <p className="text-xs font-bold text-green-300">Agent Mail (External Storage)</p>
          </div>

          <TokenGauge
            label="Context Window"
            tokensUsed={mailState.tokensUsed}
            codeTokens={mailState.codeTokens}
            coordTokens={mailState.coordTokens}
            accentColor="#3B82F6"
            coordColor="#22C55E40"
            isOverflowing={false}
          />

          {/* Event log */}
          <div className="space-y-1 max-h-32 overflow-hidden">
            {mailState.events.slice(0, 5).map((evt, i) => (
              <motion.p
                key={`mail-${mailState.step}-${i}`}
                initial={reducedMotion ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] text-green-300/70 font-mono truncate"
              >
                &gt; {evt}
              </motion.p>
            ))}
          </div>

          {isDone && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 text-center">
              <p className="text-xs font-bold text-green-400">
                {formatTokens(MAX_TOKENS - mailState.tokensUsed)} tokens still free
              </p>
              <p className="text-[10px] text-green-300/60">
                Only {((mailState.coordTokens / mailState.tokensUsed) * 100).toFixed(1)}% overhead for coordination
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Summary comparison */}
      {isDone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
            After 10 work steps
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-black text-white">
                {Math.round((chatState.coordTokens / MAX_TOKENS) * 100)}%
              </p>
              <p className="text-[10px] text-slate-400">Chat coordination overhead</p>
            </div>
            <div>
              <p className="text-lg font-black text-white">
                {((mailState.coordTokens / MAX_TOKENS) * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Agent Mail overhead</p>
            </div>
            <div>
              <p className="text-lg font-black text-green-400">
                {Math.round(chatState.coordTokens / Math.max(1, mailState.coordTokens))}x
              </p>
              <p className="text-[10px] text-slate-400">More efficient</p>
            </div>
          </div>
        </motion.div>
      )}
    </VizSurface>
  );
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

function TokenGauge({
  label,
  tokensUsed,
  codeTokens,
  coordTokens,
  accentColor,
  coordColor,
  isOverflowing,
}: {
  label: string;
  tokensUsed: number;
  codeTokens: number;
  coordTokens: number;
  accentColor: string;
  coordColor: string;
  isOverflowing: boolean;
}) {
  const reducedMotion = useVizReducedMotion();
  const usedPct = Math.min(100, (tokensUsed / MAX_TOKENS) * 100);
  const codePct = (codeTokens / MAX_TOKENS) * 100;
  const coordPct = (coordTokens / MAX_TOKENS) * 100;
  const freePct = Math.max(0, 100 - usedPct);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-300">{label}</p>
        <p className="text-xs font-mono text-slate-500">
          {formatTokens(tokensUsed)} / {formatTokens(MAX_TOKENS)}
        </p>
      </div>

      {/* Stacked bar */}
      <div className="h-8 rounded-lg bg-slate-800 overflow-hidden flex relative">
        <motion.div
          className="h-full"
          style={{ background: accentColor }}
          animate={{ width: `${codePct}%` }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
        />
        <motion.div
          className="h-full"
          style={{ background: coordColor }}
          animate={{ width: `${coordPct}%` }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
        />
        {/* Free space (dark) */}
        {freePct > 2 && (
          <div className="h-full flex-1" />
        )}
        {isOverflowing && usedPct >= 95 && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-red-500"
            animate={reducedMotion ? {} : { opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: accentColor }} />
          <span className="text-slate-400">Code: {formatTokens(codeTokens)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm" style={{ background: coordColor }} />
          <span className="text-slate-400">Coordination: {formatTokens(coordTokens)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-slate-800 border border-slate-700" />
          <span className="text-slate-400">Free: {formatTokens(Math.max(0, MAX_TOKENS - tokensUsed))}</span>
        </div>
      </div>
    </div>
  );
}
