"use client";

import { motion } from "framer-motion";
import type { ChangelogEntry } from "@/lib/content";
import { SyncContainer } from "./sync-elements";

export default function Timeline({ items }: { items: ChangelogEntry[] }) {
  return (
    <div className="relative">
      <div className="absolute left-0 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-blue-500/10 to-transparent" />

      <div className="space-y-12 md:space-y-24">
        {items.map((item, index) => {
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: (index % 4) * 0.1 }}
              className="relative pl-8 md:pl-24 group"
            >
              <div className="absolute left-[-4.5px] md:left-[27.5px] top-2 flex h-2.5 w-2.5 items-center justify-center">
                <div className="absolute h-5 w-5 rounded-full bg-blue-500/20 group-hover:animate-ping" />
                <div className="relative h-2.5 w-2.5 rounded-full bg-blue-500 border border-black shadow-[0_0_15px_#3B82F6]" />
              </div>

              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-3 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60 group-hover:text-blue-400 transition-colors">
                    {item.period}
                  </span>
                </div>

                <div className="lg:col-span-9">
                  <SyncContainer withLines={false} className="glass-modern p-8 md:p-12 transition-all duration-500 group-hover:bg-white/[0.03] group-hover:border-blue-500/20 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-8 group-hover:text-blue-400 transition-colors tracking-tight">
                      {item.title}
                    </h3>

                    <ul className="space-y-5">
                      {item.items.map((text, i) => (
                        <li key={i} className="flex items-start gap-4 group/item">
                          <div className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-slate-700 group-hover/item:bg-blue-500 transition-colors shadow-[0_0_5px_rgba(59,130,246,0)] group-hover/item:shadow-[0_0_8px_#3B82F6]" />
                          <p className="text-base md:text-lg font-medium leading-relaxed text-slate-400 group-hover/item:text-slate-200 transition-colors">
                            {text}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Runtime Log v0.2</span>
                       <div className="flex gap-1.5">
                          <div className="h-1 w-3 rounded-full bg-blue-500 animate-pulse" />
                          <div className="h-1 w-1 rounded-full bg-blue-500/50" />
                          <div className="h-1 w-1 rounded-full bg-blue-500/20" />
                       </div>
                    </div>
                  </SyncContainer>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
