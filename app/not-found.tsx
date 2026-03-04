import { Cpu } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <Cpu className="h-8 w-8 text-blue-400" />
      </div>
      <h1 className="text-gradient-sync text-8xl font-black tracking-tighter">404</h1>
      <p className="text-lg text-slate-400 font-medium">Path not found. The requested route does not exist in the site map.</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-400 active:scale-95"
      >
        Return Home
      </Link>
    </main>
  );
}
