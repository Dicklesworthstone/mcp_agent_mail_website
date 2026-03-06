import { useLayoutEffect, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lockCount = 0;
let originalStyle: {
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  htmlOverflow: string;
  scrollY: number;
} | null = null;

export function useBodyScrollLock(isLocked: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!isLocked) return undefined;
    if (typeof window === "undefined") return undefined;

    if (lockCount === 0) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const scrollY = window.scrollY;

      originalStyle = {
        bodyOverflow: document.body.style.overflow,
        bodyPaddingRight: document.body.style.paddingRight,
        bodyPosition: document.body.style.position,
        bodyTop: document.body.style.top,
        bodyWidth: document.body.style.width,
        htmlOverflow: document.documentElement.style.overflow,
        scrollY,
      };

      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      document.documentElement.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && originalStyle) {
        const { scrollY, bodyOverflow, bodyPaddingRight, bodyPosition, bodyTop, bodyWidth, htmlOverflow } = originalStyle;
        document.body.style.overflow = bodyOverflow;
        document.body.style.paddingRight = bodyPaddingRight;
        document.body.style.position = bodyPosition;
        document.body.style.top = bodyTop;
        document.body.style.width = bodyWidth;
        document.documentElement.style.overflow = htmlOverflow;
        originalStyle = null;
        document.documentElement.style.removeProperty("--scrollbar-width");
        window.scrollTo({ top: scrollY, behavior: "auto" });
      }
    };
  }, [isLocked]);
}
