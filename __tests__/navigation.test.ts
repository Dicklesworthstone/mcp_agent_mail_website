import { describe, it, expect } from "vitest";
import {
  siteConfig,
  navItems,
  heroStats,
  features,
  changelog,
  glossaryTerms,
  faq,
} from "@/lib/content";

describe("navItems", () => {
  it("exists and is non-empty", () => {
    expect(navItems).toBeDefined();
    expect(navItems.length).toBeGreaterThan(0);
  });

  it("each item has href and label properties", () => {
    for (const item of navItems) {
      expect(item).toHaveProperty("href");
      expect(item).toHaveProperty("label");
      expect(typeof item.href).toBe("string");
      expect(typeof item.label).toBe("string");
      expect(item.href.length).toBeGreaterThan(0);
      expect(item.label.length).toBeGreaterThan(0);
    }
  });

  it("all hrefs start with /", () => {
    for (const item of navItems) {
      expect(item.href).toMatch(/^\//);
    }
  });
});

describe("siteConfig", () => {
  it("url is a valid URL", () => {
    expect(() => new URL(siteConfig.url)).not.toThrow();
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });
});

describe("features", () => {
  it("all features have unique IDs", () => {
    const ids = features.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("glossaryTerms", () => {
  it("all glossary terms have unique term values", () => {
    const terms = glossaryTerms.map((g) => g.term);
    const uniqueTerms = new Set(terms);
    expect(uniqueTerms.size).toBe(terms.length);
  });

  it("each term has non-empty short and long descriptions", () => {
    for (const entry of glossaryTerms) {
      expect(entry.term.length).toBeGreaterThan(0);
      expect(entry.short.length).toBeGreaterThan(0);
      expect(entry.long.length).toBeGreaterThan(0);
    }
  });
});

describe("changelog", () => {
  it("is non-empty", () => {
    expect(changelog.length).toBeGreaterThan(0);
  });

  it("each entry has an id, period, title, and items", () => {
    for (const entry of changelog) {
      expect(typeof entry.id).toBe("string");
      expect(entry.id.length).toBeGreaterThan(0);
      expect(typeof entry.period).toBe("string");
      expect(entry.period.length).toBeGreaterThan(0);
      expect(typeof entry.title).toBe("string");
      expect(entry.title.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.items)).toBe(true);
      expect(entry.items.length).toBeGreaterThan(0);
    }
  });

  it("entries have unique IDs", () => {
    const ids = changelog.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("items are in phase order (reverse chronological by phase number)", () => {
    // Changelog uses "Phase N" periods; verify they appear in ascending order
    // (earliest phase first, representing reverse-chronological project evolution)
    const phaseNumbers = changelog
      .map((c) => {
        const match = c.period.match(/Phase\s+(\d+)/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n): n is number => n !== null);

    for (let i = 1; i < phaseNumbers.length; i++) {
      expect(phaseNumbers[i]).toBeGreaterThan(phaseNumbers[i - 1]);
    }
  });
});

describe("faq", () => {
  it("is non-empty", () => {
    expect(faq.length).toBeGreaterThan(0);
  });

  it("each item has question and answer strings", () => {
    for (const item of faq) {
      expect(typeof item.question).toBe("string");
      expect(typeof item.answer).toBe("string");
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(0);
    }
  });
});

describe("heroStats", () => {
  it("is non-empty and each stat has required fields", () => {
    expect(heroStats.length).toBeGreaterThan(0);
    for (const stat of heroStats) {
      expect(stat.id).toBeTruthy();
      expect(stat.label).toBeTruthy();
      expect(stat.value).toBeTruthy();
    }
  });

  it("all stats have unique IDs", () => {
    const ids = heroStats.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
