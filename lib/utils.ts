import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

