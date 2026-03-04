"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#020a14] text-white">
        <div className="flex flex-col items-center gap-6 px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <h2 className="text-2xl font-black">System Fault</h2>
          {error.digest && (
            <p className="text-sm text-slate-500 font-mono">Digest: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400 transition-colors active:scale-95"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
