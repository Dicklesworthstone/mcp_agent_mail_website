"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Terminal, Activity } from "lucide-react";
import { SyncNode, DataPulse } from "./sync-elements";
import GlitchText from "./glitch-text";

type TokenKind =
  | "plain" | "keyword" | "type" | "macro" | "number"
  | "func" | "path" | "string" | "comment" | "special";

type Token = { kind: TokenKind; text: string };

const KEYWORDS = new Set([
  "use", "fn", "let", "mut", "match", "impl", "struct", "enum", "pub", "self",
  "type", "mod", "where", "for", "in", "if", "else", "return", "const", "static",
  "trait", "derive", "cfg", "async", "await", "move", "crate", "super", "loop",
]);

const TYPES = new Set([
  "Self", "Cmd", "Event", "Msg", "Rect", "Frame", "Paragraph", "App",
  "ScreenMode", "Model", "u64", "u32", "u16", "u8", "usize", "i64", "i32",
  "isize", "bool", "str", "String", "Vec", "Box", "Option", "Result",
  "Region", "Cx", "Outcome", "Budget", "Permit", "Lease", "Duration", "Effect", "Account", "Saga",
]);

const SPECIALS = new Set(["true", "false", "None", "Some", "Ok", "Err"]);

const MACROS = new Set([
  "format", "println", "eprintln", "dbg", "vec", "panic", "todo", "unreachable", "cfg", "derive",
]);

const CODE_TOKEN_RE =
  /::|\b(?:format|println|eprintln|dbg|vec|panic|todo|unreachable|cfg|derive)!|\b(?:use|fn|let|mut|match|impl|struct|enum|pub|self|type|mod|where|for|in|if|else|return|const|static|trait|derive|cfg|async|await|move|crate|super|loop)\b|\b(?:Self|Cmd|Event|Msg|Rect|Frame|Paragraph|App|ScreenMode|Model|u64|u32|u16|u8|usize|i64|i32|isize|bool|str|String|Vec|Box|Option|Result|Region|Cx|Outcome|Budget|Permit|Lease|Duration|Effect|Account|Saga|true|false|None|Some|Ok|Err)\b|\b\d+\b|\b[a-z_][a-z0-9_]*\b(?=\s*\()/g;

function tokenizeCodeSegment(segment: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;

  CODE_TOKEN_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CODE_TOKEN_RE.exec(segment)) !== null) {
    const start = m.index;
    const text = m[0];

    if (start > lastIndex) {
      tokens.push({ kind: "plain", text: segment.slice(lastIndex, start) });
    }

    if (text === "::") {
      tokens.push({ kind: "path", text });
    } else if (text.endsWith("!")) {
      const name = text.slice(0, -1);
      tokens.push({ kind: MACROS.has(name) ? "macro" : "plain", text });
    } else if (/^\d+$/.test(text)) {
      tokens.push({ kind: "number", text });
    } else if (SPECIALS.has(text)) {
      tokens.push({ kind: "special", text });
    } else if (KEYWORDS.has(text)) {
      tokens.push({ kind: "keyword", text });
    } else if (TYPES.has(text)) {
      tokens.push({ kind: "type", text });
    } else {
      tokens.push({ kind: "func", text });
    }

    lastIndex = start + text.length;
  }

  if (lastIndex < segment.length) {
    tokens.push({ kind: "plain", text: segment.slice(lastIndex) });
  }

  return tokens;
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];

  let i = 0;
  let start = 0;
  let inString = false;
  let stringStart = 0;

  while (i < line.length) {
    const ch = line[i];
    const next = i + 1 < line.length ? line[i + 1] : "";

    if (!inString) {
      if (ch === "/" && next === "/") {
        if (i > start) {
          tokens.push(...tokenizeCodeSegment(line.slice(start, i)));
        }
        tokens.push({ kind: "comment", text: line.slice(i) });
        return tokens;
      }

      if (ch === "\"") {
        if (i > start) {
          tokens.push(...tokenizeCodeSegment(line.slice(start, i)));
        }
        inString = true;
        stringStart = i;
        i += 1;
        continue;
      }

      i += 1;
      continue;
    }

    if (ch === "\\") {
      i += 2;
      continue;
    }

    if (ch === "\"") {
      tokens.push({ kind: "string", text: line.slice(stringStart, i + 1) });
      inString = false;
      start = i + 1;
      i += 1;
      continue;
    }

    i += 1;
  }

  if (inString) {
    tokens.push({ kind: "string", text: line.slice(stringStart) });
    return tokens;
  }

  if (start < line.length) {
    tokens.push(...tokenizeCodeSegment(line.slice(start)));
  }

  return tokens;
}

function tokenClass(kind: TokenKind): string {
  switch (kind) {
    case "string": return "text-orange-300";
    case "comment": return "text-slate-600 italic";
    case "keyword": return "text-blue-400 font-black";
    case "type": return "text-sky-300 font-bold";
    case "macro": return "text-yellow-300 font-bold";
    case "number": return "text-amber-300";
    case "func": return "text-blue-300";
    case "path": return "text-slate-500";
    case "special": return "text-orange-300";
    default: return "";
  }
}

export default function RustCodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (copyTimeoutRef.current !== null) {
      window.clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const tokenLines = useMemo(() => code.split("\n").map(tokenizeLine), [code]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#020a14]/90 group shadow-2xl">
      <DataPulse className="opacity-0 group-hover:opacity-20 transition-opacity" />

      <SyncNode className="absolute -left-1.5 -top-1.5 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />
      <SyncNode className="absolute -right-1.5 -top-1.5 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />
      <SyncNode className="absolute -left-1.5 -bottom-1.5 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />
      <SyncNode className="absolute -right-1.5 -bottom-1.5 z-20 scale-75 opacity-20 transition-opacity group-hover:opacity-100" />

      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-white/[0.02] relative z-20">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500/40" />
          </div>
          {title && (
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              <Terminal className="h-3.5 w-3.5 text-blue-500/60" />
              {title}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          data-magnetic="true"
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-white/10 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-blue-400" />
              <span className="text-blue-400">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              COPY
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto relative z-10">
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0.1, 0.3, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-blue-500 z-20 pointer-events-none"
            />
          )}
        </AnimatePresence>

        <pre className="p-8 font-mono text-[13px] leading-relaxed text-slate-300 overflow-visible selection:bg-blue-500/30">
          <code>
            {tokenLines.map((lineTokens, i) => (
              <span key={i} className="flex group/line">
                <span className="mr-8 inline-block w-6 select-none text-right text-[10px] font-black text-slate-800 group-hover/line:text-blue-500/40 transition-colors">
                  {(i + 1).toString().padStart(2, '0')}
                </span>
                <span className="flex flex-wrap">
                  {lineTokens.length === 0 ? (
                    <span>&nbsp;</span>
                  ) : (
                    lineTokens.map((t, j) => (
                      <span key={j} className={cn(tokenClass(t.kind), "transition-all")}>
                        {t.kind === "keyword" ? (
                          <GlitchText trigger="hover" intensity="low">
                            {t.text}
                          </GlitchText>
                        ) : (
                          t.text
                        )}
                      </span>
                    ))
                  )}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between opacity-30 group-hover:opacity-100 transition-opacity">
         <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <Activity className="h-2.5 w-2.5" />
            <span>Syntax_Validation_Active</span>
         </div>
         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">UTF-8_ENCODED</span>
      </div>
    </div>
  );
}
