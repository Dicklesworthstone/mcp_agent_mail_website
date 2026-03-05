"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "@/components/motion";
import {
  VizControlButton,
  VizSurface,
  useVizAutoStart,
  useVizReducedMotion,
  useVizInViewport,
  VizHeader,
  VizMetricCard,
  VizLearningBlock
} from "@/components/viz/viz-framework";
import { MessageSquare, Server, Flame, CheckCircle2, Zap } from "lucide-react";

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
  const inViewport = useVizInViewport();
  const [chatState, setChatState] = useState<ColumnState>({
    step: 0, tokensUsed: 0, codeTokens: 0, coordTokens: 0, events: [],
  });
  const [mailState, setMailState] = useState<ColumnState>({
    step: 0, tokensUsed: 0, codeTokens: 0, coordTokens: 0, events: [],
  });
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const autoStart = useCallback(() => setRunning(true), []);
  useVizAutoStart(autoStart);

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
    if (running && chatState.step < TOTAL_STEPS && inViewport) {
      intervalRef.current = setInterval(advance, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, chatState.step, inViewport, advance]);

  const isDone = chatState.step >= TOTAL_STEPS;

  return (
    <VizSurface aria-label="Token economy comparison: chat coordination vs Agent Mail">
      <VizHeader
        accent="green"
        eyebrow="Context Window Economics"
        title="The Token Economy"
        subtitle="Watch what happens to your context window when an AI swarm coordinates via plain-text chat versus the off-chain Agent Mail SQLite database."
        controls={
          <div className="flex gap-2">
            <VizControlButton tone={running ? "neutral" : "green"} onClick={handleStart} disabled={running || isDone}>
              {isDone ? "Complete" : running ? "Running..." : "Run Scenario"}
            </VizControlButton>
            <VizControlButton tone="neutral" onClick={handleReset} disabled={chatState.step === 0}>
              Reset
            </VizControlButton>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <VizMetricCard label="Current Step" value={`${chatState.step} / ${TOTAL_STEPS}`} tone="blue" />
        <VizMetricCard label="Max Context Window" value="200k" tone="neutral" />
        <VizMetricCard label="Chat Burn Rate" value="High" tone={chatState.step > 0 ? "red" : "neutral"} />
        <VizMetricCard label="Agent Mail Cost" value="< 1%" tone={chatState.step > 0 ? "green" : "neutral"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Chat-based coordination */}
        <div className="relative rounded-xl border border-white/10 bg-[#0B1120] overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0" />
          <div className="p-5 border-b border-slate-800 bg-black/40 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <MessageSquare className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-black text-slate-200 uppercase tracking-widest text-sm">Chat Coordination</h4>
              <p className="text-[10px] text-slate-400">Tokens permanently lost to conversational history</p>
            </div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col gap-4">
            <TokenGauge
              label="Context Window State"
              tokensUsed={chatState.tokensUsed}
              codeTokens={chatState.codeTokens}
              coordTokens={chatState.coordTokens}
              accentColor="#3B82F6"
              coordColor="#EF4444"
              isOverflowing={chatState.tokensUsed >= MAX_TOKENS * 0.9}
            />

            {/* Event log */}
            <div className="flex-1 rounded-lg border border-slate-800 bg-black/50 p-3 flex flex-col-reverse overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/80 pointer-events-none z-10" />
              
              <div className="space-y-2 z-0 relative">
                <AnimatePresence>
                  {chatState.events.slice(0, 5).map((evt, i) => (
                    <motion.div
                      key={`chat-${chatState.step}-${i}`}
                      initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
                      animate={{ opacity: Math.max(0.2, 1 - (i * 0.2)), y: 0 }}
                      className="text-xs font-mono flex items-start gap-2"
                    >
                      <span className="text-red-400/80 mt-0.5">❯</span>
                      <span className="text-red-200">{evt}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {isDone && chatState.tokensUsed >= MAX_TOKENS * 0.9 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-center shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              >
                <p className="text-xs font-black text-red-400 flex items-center justify-center gap-1 uppercase tracking-wider mb-1"><Flame className="w-3 h-3" /> Context Exhausted</p>
                <p className="text-[10px] text-red-300/80">
                  {Math.round((chatState.coordTokens / chatState.tokensUsed) * 100)}% of the LLM&apos;s brain was wasted on conversational fluff instead of codebase context.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Agent Mail */}
        <div className="relative rounded-xl border border-white/10 bg-[#0B1120] overflow-hidden flex flex-col min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0" />
          <div className="p-5 border-b border-slate-800 bg-black/40 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-black text-slate-200 uppercase tracking-widest text-sm">Agent Mail RPC</h4>
              <p className="text-[10px] text-slate-400">Coordination state pushed to an off-chain SQLite DB</p>
            </div>
          </div>
          
          <div className="p-5 flex-1 flex flex-col gap-4">
            <TokenGauge
              label="Context Window State"
              tokensUsed={mailState.tokensUsed}
              codeTokens={mailState.codeTokens}
              coordTokens={mailState.coordTokens}
              accentColor="#3B82F6"
              coordColor="#10B981"
              isOverflowing={false}
            />

            {/* Event log */}
            <div className="flex-1 rounded-lg border border-slate-800 bg-black/50 p-3 flex flex-col-reverse overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/80 pointer-events-none z-10" />
              
              <div className="space-y-2 z-0 relative">
                <AnimatePresence>
                  {mailState.events.slice(0, 5).map((evt, i) => (
                    <motion.div
                      key={`mail-${mailState.step}-${i}`}
                      initial={reducedMotion ? {} : { opacity: 0, y: -10 }}
                      animate={{ opacity: Math.max(0.2, 1 - (i * 0.2)), y: 0 }}
                      className="text-xs font-mono flex items-start gap-2"
                    >
                      <span className="text-emerald-400/80 mt-0.5">❯</span>
                      <span className="text-emerald-200">{evt}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {isDone && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-center shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                <p className="text-xs font-black text-emerald-400 flex items-center justify-center gap-1 uppercase tracking-wider mb-1"><CheckCircle2 className="w-3 h-3" /> Extremely Efficient</p>
                <p className="text-[10px] text-emerald-300/80">
                  <span className="font-bold text-white">{formatTokens(MAX_TOKENS - mailState.tokensUsed)}</span> tokens still free. Only <span className="font-bold text-emerald-400">{((mailState.coordTokens / mailState.tokensUsed) * 100).toFixed(1)}%</span> overhead for coordination.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Summary comparison */}
      <AnimatePresence>
        {isDone && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 rounded-xl border border-blue-500/30 bg-blue-900/10 p-5 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4 justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-blue-300">Efficiency Delta</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-700">
              <div>
                <p className="text-3xl font-black text-red-400 mb-1 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">
                  {Math.round((chatState.coordTokens / MAX_TOKENS) * 100)}%
                </p>
                <p className="text-xs font-bold text-slate-300">Chat Drain</p>
                <p className="text-[10px] text-slate-500 mt-1">Context permanently lost</p>
              </div>
              <div>
                <p className="text-3xl font-black text-emerald-400 mb-1 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                  {((mailState.coordTokens / MAX_TOKENS) * 100).toFixed(1)}%
                </p>
                <p className="text-xs font-bold text-slate-300">Mail Overhead</p>
                <p className="text-[10px] text-slate-500 mt-1">Minimal RPC footprint</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-3xl font-black text-blue-400 mb-1 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                  {Math.round(chatState.coordTokens / Math.max(1, mailState.coordTokens))}x
                </p>
                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest">More Efficient</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VizLearningBlock
        accent="green"
        title="Pedagogical Takeaways"
        items={[
          "Without Agent Mail, multi-agent swarms quickly poison their own context windows with 'I am doing X' messages.",
          "Agent Mail forces coordination into a structured Database (SQLite) rather than appending to the LLM context array.",
          "This enables the LLM to spend 99% of its token budget on the actual codebase instead of conversational logistics.",
        ]}
      />
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {formatTokens(tokensUsed)} / {formatTokens(MAX_TOKENS)}
        </p>
      </div>

      {/* Stacked bar */}
      <div className="h-6 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex relative shadow-inner">
        <motion.div
          className="h-full relative overflow-hidden"
          style={{ background: accentColor }}
          animate={{ width: `${codePct}%` }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
        
        <motion.div
          className="h-full relative overflow-hidden"
          style={{ background: coordColor }}
          animate={{ width: `${coordPct}%` }}
          transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.1)_4px,rgba(0,0,0,0.1)_8px)]" />
        </motion.div>
        
        {/* Free space (dark) */}
        {freePct > 2 && (
          <div className="h-full flex-1" />
        )}
        
        {isOverflowing && usedPct >= 95 && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            animate={reducedMotion ? {} : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center bg-black/40 border border-white/5 rounded-lg p-2 px-3">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full shadow-sm" style={{ background: accentColor }} />
          <span className="text-[10px] font-bold text-slate-300">Code Work <span className="font-mono text-slate-500 opacity-70 ml-1">{formatTokens(codeTokens)}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full shadow-sm" style={{ background: coordColor }} />
          <span className="text-[10px] font-bold text-slate-300">Overhead <span className="font-mono text-slate-500 opacity-70 ml-1">{formatTokens(coordTokens)}</span></span>
        </div>
      </div>
    </div>
  );
}