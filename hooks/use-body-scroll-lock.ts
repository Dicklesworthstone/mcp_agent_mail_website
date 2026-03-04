import { useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lockCount = 0;
let originalStyle: { overflow: string; paddingRight: string } | null = null;

export function useBodyScrollLock(isLocked: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!isLocked) return undefined;
    if (typeof window === "undefined") return undefined;

    if (lockCount === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      originalStyle = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && originalStyle) {
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.paddingRight = originalStyle.paddingRight;
        originalStyle = null;
        document.documentElement.style.removeProperty("--scrollbar-width");
      }
    };
  }, [isLocked]);
}
