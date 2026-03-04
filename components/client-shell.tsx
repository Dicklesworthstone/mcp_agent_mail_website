"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import ErrorBoundary from "@/components/error-boundary";
import ScrollToTop from "@/components/scroll-to-top";
import CustomCursor from "@/components/custom-cursor";
import { SiteProvider } from "@/lib/site-state";

const queryClient = new QueryClient({
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

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SiteProvider>
          <div className="flex min-h-screen flex-col overflow-x-hidden relative">
            <CustomCursor />

            <SiteHeader />

            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: prefersReducedMotion ? 0 : 0.4,
                    ease: "easeOut",
                    delay: prefersReducedMotion ? 0 : 0.1
                  }
                }}
                exit={prefersReducedMotion ? { opacity: 1 } : {
                  opacity: 0,
                  transition: {
                    duration: 0.3,
                    ease: "easeIn"
                  }
                }}
                className="flex-1 relative"
              >
                {children}
              </motion.div>
            </AnimatePresence>

            <SiteFooter />
            <ScrollToTop />
          </div>
        </SiteProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
