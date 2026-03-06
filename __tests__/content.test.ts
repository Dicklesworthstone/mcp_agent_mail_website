import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import {
  siteConfig,
  navItems,
  features,
  getWebSiteJsonLd,
  getSoftwareApplicationJsonLd,
  getFaqPageJsonLd,
  getHowToJsonLd,
  heroDemoTranscript,
  dashboardDemoStoryboard,
  heroTuiDemo,
  comparisonData,
  generalFaq,
  gettingStartedPillars,
  gettingStartedFaq,
} from "@/lib/content";
import {
  specCategories,
  specDocs,
  resolveSpecDocFromHref,
  toSpecExplorerHref,
  toSpecDocPublicHref,
} from "@/lib/spec-docs";

// Note: Basic navItems, siteConfig, heroStats, faq, glossaryTerms, changelog
// tests are in navigation.test.ts.
// adoptionMessages, credibilityHighlights, communityTestimonials, evidenceBackedClaims
// tests are in conversion.test.ts.
// Chapter/caption time range validation is in viz-state.test.ts.
// This file covers contracts NOT tested elsewhere.

// ─── Site Config (social links — not covered in navigation.test.ts) ─────

describe("siteConfig", () => {
  it("has social links", () => {
    expect(siteConfig.social.github).toMatch(/github\.com/);
    expect(siteConfig.social.x).toMatch(/x\.com/);
    expect(siteConfig.social.authorGithub).toMatch(/github\.com/);
  });
});

// ─── Navigation (unique checks) ─────────────────────────────────

describe("navItems", () => {
  it("contains home route", () => {
    expect(navItems.some((n) => n.href === "/")).toBe(true);
  });
});

// ─── Content Arrays (not covered elsewhere) ─────────────────────

describe("content arrays not covered in other test files", () => {
  it("features is non-empty", () => expect(features.length).toBeGreaterThan(0));
  it("generalFaq", () => expect(generalFaq.length).toBeGreaterThan(0));
  it("comparisonData", () => expect(comparisonData.length).toBeGreaterThan(0));
  it("gettingStartedPillars", () =>
    expect(gettingStartedPillars.length).toBeGreaterThan(0));
  it("gettingStartedFaq", () =>
    expect(gettingStartedFaq.length).toBeGreaterThan(0));
});

// ─── Storyboard Scenes ──────────────────────────────────────────

describe("dashboardDemoStoryboard", () => {
  it("scenes sum to totalDurationSeconds", () => {
    const sceneSum = dashboardDemoStoryboard.scenes.reduce(
      (sum, s) => sum + s.durationSeconds,
      0
    );
    expect(sceneSum).toBe(dashboardDemoStoryboard.totalDurationSeconds);
  });

  it("scene numbers are sequential starting at 1", () => {
    const numbers = dashboardDemoStoryboard.scenes.map((s) => s.sceneNumber);
    for (let i = 0; i < numbers.length; i++) {
      expect(numbers[i]).toBe(i + 1);
    }
  });

  it("all scenes have unique IDs", () => {
    const ids = dashboardDemoStoryboard.scenes.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all scenes have required fields", () => {
    for (const scene of dashboardDemoStoryboard.scenes) {
      expect(scene.title).toBeTruthy();
      expect(scene.description).toBeTruthy();
      expect(scene.keyAction).toBeTruthy();
      expect(scene.narrativeBeat).toBeTruthy();
      expect(scene.durationSeconds).toBeGreaterThan(0);
      expect(scene.targetPersonas.length).toBeGreaterThan(0);
      expect(scene.productionCues.length).toBeGreaterThan(0);
    }
  });

  it("has pre-recording checklist and post-production notes", () => {
    expect(dashboardDemoStoryboard.preRecordingChecklist.length).toBeGreaterThan(
      0
    );
    expect(dashboardDemoStoryboard.postProductionNotes.length).toBeGreaterThan(
      0
    );
  });
});

// ─── Hero Demo Transcript (unique checks beyond viz-state.test.ts) ──────

function parseTimecode(tc: string): number {
  const [min, secMs] = tc.split(":");
  const [sec, ms] = secMs.split(".");
  return parseInt(min, 10) * 60_000 + parseInt(sec, 10) * 1000 + parseInt(ms, 10);
}

describe("heroDemoTranscript", () => {
  it("has full transcript", () => {
    expect(heroDemoTranscript.fullTranscript.length).toBeGreaterThan(100);
  });

  it("captions have valid time format", () => {
    for (const cue of heroDemoTranscript.captions) {
      expect(cue.startTime).toMatch(/^\d{2}:\d{2}\.\d{3}$/);
      expect(cue.endTime).toMatch(/^\d{2}:\d{2}\.\d{3}$/);
    }
  });

  it("chapter markers cover full duration without gaps", () => {
    const chapters = heroDemoTranscript.chapters;
    expect(chapters[0].startTime).toBe("00:00.000");
    for (let i = 1; i < chapters.length; i++) {
      expect(chapters[i].startTime).toBe(chapters[i - 1].endTime);
    }
  });

  it("caption cues are chronologically ordered", () => {
    const captions = heroDemoTranscript.captions;
    for (let i = 1; i < captions.length; i++) {
      const prevMs = parseTimecode(captions[i - 1].startTime);
      const currMs = parseTimecode(captions[i].startTime);
      expect(currMs).toBeGreaterThanOrEqual(prevMs);
    }
  });
});

// ─── Media Specs ─────────────────────────────────────────────────

describe("heroTuiDemo", () => {
  it("has required dimensions", () => {
    expect(heroTuiDemo.width).toBeGreaterThan(0);
    expect(heroTuiDemo.height).toBeGreaterThan(0);
  });

  it("contains real-data snapshot fields", () => {
    expect(heroTuiDemo.snapshot.totalMessages).toBeGreaterThan(1000);
    expect(heroTuiDemo.snapshot.totalAgents).toBeGreaterThan(100);
    expect(heroTuiDemo.snapshot.activeThreads).toBeGreaterThan(100);
    expect(heroTuiDemo.feedEvents.length).toBeGreaterThan(5);
  });

  it("includes a valid real-webapp target", () => {
    const parsed = new URL(heroTuiDemo.realWebAppUrl);
    expect(["http:", "https:"]).toContain(parsed.protocol);
    expect(parsed.pathname.startsWith("/")).toBe(true);
  });
});

// ─── Spec Explorer Data Contracts ───────────────────────────────

describe("specDocs", () => {
  it("contains only known categories", () => {
    const categorySet = new Set(specCategories);
    for (const doc of specDocs) {
      expect(categorySet.has(doc.category as (typeof specCategories)[number])).toBe(true);
    }
  });

  it("has unique slug, filename, and order values", () => {
    const slugs = specDocs.map((doc) => doc.slug);
    const filenames = specDocs.map((doc) => doc.filename);
    const orders = specDocs.map((doc) => doc.order);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(filenames).size).toBe(filenames.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("provides complete sequence ordering without gaps", () => {
    const sortedOrders = specDocs.map((doc) => doc.order).toSorted((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      expect(sortedOrders[i]).toBe(i + 1);
    }
  });

  it("has at least one document per category", () => {
    for (const category of specCategories) {
      expect(specDocs.some((doc) => doc.category === category)).toBe(true);
    }
  });

  it("resolves relative markdown links to known spec docs", () => {
    const topology = resolveSpecDocFromHref("./system-topology.md#visual-mental-model");
    const migration = resolveSpecDocFromHref("../migration-rollout-and-parity.md");

    expect(topology?.slug).toBe("system-topology");
    expect(migration?.slug).toBe("migration-rollout-and-parity");
  });

  it("builds safe public spec-doc hrefs for known markdown links", () => {
    expect(toSpecDocPublicHref("./system-topology.md#visual-mental-model")).toBe(
      "/spec-docs/system-topology.md#visual-mental-model",
    );
    expect(toSpecDocPublicHref("../src/lab/oracle/mod.rs")).toBeNull();
    expect(toSpecDocPublicHref("javascript:alert(1)")).toBeNull();
  });

  it("builds spec explorer deep links for known markdown links", () => {
    expect(toSpecExplorerHref("./system-topology.md#visual-mental-model")).toBe(
      "/spec-explorer?doc=system-topology&category=Coordination+Flows#visual-mental-model",
    );
    expect(toSpecExplorerHref("../src/lab/oracle/mod.rs")).toBeNull();
    expect(toSpecExplorerHref("javascript:alert(1)")).toBeNull();
  });

  it("points to files that exist in public/spec-docs", () => {
    for (const doc of specDocs) {
      expect(existsSync(`public/spec-docs/${doc.filename}`)).toBe(true);
    }
  });
});

// ─── JSON-LD Generators ─────────────────────────────────────────

describe("JSON-LD generators", () => {
  it("getWebSiteJsonLd returns valid schema", () => {
    const data = getWebSiteJsonLd();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBeTruthy();
    expect(data.url).toBeTruthy();
    expect(data.publisher).toHaveProperty("@type", "Person");
  });

  it("getSoftwareApplicationJsonLd returns valid schema", () => {
    const data = getSoftwareApplicationJsonLd();
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.offers).toHaveProperty("price");
    expect(data.codeRepository).toMatch(/github\.com/);
    expect(data.programmingLanguage).toBe("Rust");
  });

  it("getFaqPageJsonLd has questions with answer structure", () => {
    const data = getFaqPageJsonLd();
    expect(data["@type"]).toBe("FAQPage");
    const entities = data.mainEntity as Array<Record<string, unknown>>;
    expect(entities.length).toBeGreaterThan(0);
    for (const q of entities) {
      expect(q["@type"]).toBe("Question");
      expect(q.name).toBeTruthy();
      const answer = q.acceptedAnswer as Record<string, unknown>;
      expect(answer["@type"]).toBe("Answer");
      expect(answer.text).toBeTruthy();
    }
  });

  it("getHowToJsonLd has ordered steps", () => {
    const data = getHowToJsonLd();
    expect(data["@type"]).toBe("HowTo");
    const steps = data.step as Array<Record<string, unknown>>;
    expect(steps.length).toBeGreaterThan(0);
    for (let i = 0; i < steps.length; i++) {
      expect(steps[i]["@type"]).toBe("HowToStep");
      expect(steps[i].position).toBe(i + 1);
      expect(steps[i].name).toBeTruthy();
      expect(steps[i].text).toBeTruthy();
    }
  });

});
