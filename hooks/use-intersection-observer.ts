"use client";

import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  initialIsIntersecting?: boolean;
}

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>({
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
  initialIsIntersecting = false,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (triggerOnce && hasTriggeredRef.current) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      const timeoutId = setTimeout(() => {
        setIsIntersecting(true);
        hasTriggeredRef.current = true;
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isNowIntersecting = entry.isIntersecting;

        if (triggerOnce && isNowIntersecting) {
          setIsIntersecting(true);
          hasTriggeredRef.current = true;
          observer.disconnect();
          return;
        }

        setIsIntersecting(isNowIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isIntersecting };
}
