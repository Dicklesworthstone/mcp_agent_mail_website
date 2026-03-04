"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/5">
        <AlertTriangle className="h-8 w-8 text-orange-400" />
      </div>
      <h1 className="text-4xl font-black tracking-tighter text-slate-100">Something went wrong</h1>
      <p className="text-lg text-slate-400 font-medium max-w-md">
        An unexpected error occurred. Try refreshing the page.
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-400 active:scale-95"
      >
        Try Again
      </button>
    </main>
  );
}
