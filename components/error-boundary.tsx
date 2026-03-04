"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Terminal, Activity } from "lucide-react";
import { SyncContainer, SyncNode } from "./sync-elements";
import GlitchText from "./glitch-text";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  dumpId: string;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, dumpId: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      dumpId: Math.random().toString(16).substring(2, 10).toUpperCase(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error boundary caught error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto flex min-h-[500px] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center"
        >
          <SyncContainer withPulse={true} className="w-full bg-black/60 border-red-500/20 p-10 md:p-16 relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <SyncNode className="absolute -left-1.5 -top-1.5 z-20" />
            <SyncNode className="absolute -right-1.5 -top-1.5 z-20" />

            <div className="absolute top-4 right-6 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-red-500/40">
              <Activity className="h-2.5 w-2.5 animate-pulse" />
              <span>Runtime_Fault_Detected</span>
            </div>

            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 mb-8 relative group">
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-20" />
              <AlertTriangle className="h-10 w-10 relative z-10" />
            </div>

            <GlitchText trigger="always" intensity="medium">
              <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
                Runtime_Fault
              </h2>
            </GlitchText>

            <div className="relative mb-10 group">
              <div className="absolute -inset-2 bg-red-500/5 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="relative z-10 text-base font-mono text-slate-400 max-w-lg mx-auto leading-relaxed border border-white/5 bg-white/5 p-4 rounded-xl">
                <span className="text-red-500/60 mr-2">{">> "}</span>
                {this.state.error?.message || "An unexpected desync occurred during render cycle."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={this.reset}
                className="group inline-flex items-center gap-3 rounded-full bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white shadow-xl active:scale-95"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Retry_Sync
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              >
                <Terminal className="h-4 w-4" />
                Reload_Runtime
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between opacity-30">
               <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 font-mono">Dump_ID: {this.state.dumpId}</span>
               <div className="flex gap-1">
                  <div className="h-1 w-1 rounded-full bg-red-500" />
                  <div className="h-1 w-1 rounded-full bg-red-500/50" />
                  <div className="h-1 w-1 rounded-full bg-red-500/20" />
               </div>
            </div>
          </SyncContainer>
        </div>
      );
    }

    return this.props.children;
  }
}
