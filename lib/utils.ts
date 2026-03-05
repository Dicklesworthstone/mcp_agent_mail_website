import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const SAFE_ABSOLUTE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Detect if an element is a text input, textarea, or contenteditable.
 * Useful for suppressing keyboard shortcuts during typing.
 */
export function isTextInputLike(el: Element | null): boolean {
  if (!el) return false;
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest("[contenteditable='true']"));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toSafeHref(rawHref: string): string | null {
  const href = rawHref.trim();
  if (!href) return null;

  // Keep in-app and anchor links available without URL parsing.
  if (href.startsWith("#")) return href;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (href.startsWith("./") || href.startsWith("../")) return href;

  try {
    const url = new URL(href);
    return SAFE_ABSOLUTE_PROTOCOLS.has(url.protocol) ? href : null;
  } catch {
    return null;
  }
}

export function isInternalHref(href: string): boolean {
  return /^\/(?!\/)/.test(href);
}
