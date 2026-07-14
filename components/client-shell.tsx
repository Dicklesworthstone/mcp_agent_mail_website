"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "@/components/motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";
import CustomCursor from "@/components/custom-cursor";
import { SiteProvider } from "@/lib/site-state";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 12,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const focusMainFromHash = useCallback(() => {
    if (window.location.hash !== "#main-content") return;
    const main = document.getElementById("main-content");
    if (!(main instanceof HTMLElement)) return;
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
    main.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    focusMainFromHash();
  }, [pathname, focusMainFromHash]);

  useEffect(() => {
    window.addEventListener("hashchange", focusMainFromHash);
    return () => {
      window.removeEventListener("hashchange", focusMainFromHash);
    };
  }, [focusMainFromHash]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SiteProvider>
          <div className="flex min-h-screen flex-col overflow-x-hidden relative">
            <CustomCursor />

            <SiteHeader />

            {/* Exit animations (AnimatePresence mode="wait") are incompatible with the App
                Router: the outgoing page's children are swapped for the new route mid-exit,
                and the presence swap can stall, leaving the page stuck at opacity 0 until an
                unrelated re-render. Enter-only fade, remounted per route via key. */}
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{
                opacity: 1,
                transition: {
                  duration: prefersReducedMotion ? 0 : 0.4,
                  ease: "easeOut"
                }
              }}
              className="flex-1 relative"
            >
              {children}
            </motion.div>

            <SiteFooter />
            <ScrollToTop />
          </div>
        </SiteProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
