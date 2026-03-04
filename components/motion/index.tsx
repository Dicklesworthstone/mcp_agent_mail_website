"use client";

import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";

export const springs = {
  smooth: { type: "spring", stiffness: 200, damping: 25 } as const,
  snappy: { type: "spring", stiffness: 400, damping: 35 } as const,
  gentle: { type: "spring", stiffness: 100, damping: 20 } as const,
  quick: { type: "spring", stiffness: 500, damping: 40 } as const,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: springs.smooth },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: springs.smooth },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

export const sheetEntrance: Variants = {
  hidden: { y: "100%", opacity: 0.8 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { y: "100%", opacity: 0.8, transition: { duration: 0.2 } },
};

export { motion, AnimatePresence, useReducedMotion };
export type { Variants };
