"use client";

import { useCallback } from "react";

/**
 * Simple hook for haptic feedback using the Vibration API.
 */
export function useHapticFeedback() {
  const lightTap = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const mediumTap = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(20);
    }
  }, []);

  const errorTap = useCallback(() => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  }, []);

  return { lightTap, mediumTap, errorTap };
}
