import { describe, it, expect } from "vitest";
import {
  siteConfig,
  navItems,
  features,
  getWebSiteJsonLd,
  getSoftwareApplicationJsonLd,
  getFaqPageJsonLd,
  getHowToJsonLd,
  getVideoObjectJsonLd,
  heroDemoTranscript,
  dashboardDemoStoryboard,
  heroVideoPlaceholder,
  heroMediaPackagingSpec,
  comparisonData,
  generalFaq,
  gettingStartedPillars,
  gettingStartedFaq,
} from "@/lib/content";

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

describe("heroVideoPlaceholder", () => {
  it("has required dimensions", () => {
    expect(heroVideoPlaceholder.width).toBeGreaterThan(0);
    expect(heroVideoPlaceholder.height).toBeGreaterThan(0);
  });

  it("has poster path", () => {
    expect(heroVideoPlaceholder.poster).toBeTruthy();
  });
});

describe("heroMediaPackagingSpec", () => {
  it("has primary codec spec", () => {
    expect(heroMediaPackagingSpec.primary.container).toBeTruthy();
    expect(heroMediaPackagingSpec.primary.videoCodec).toBeTruthy();
  });

  it("has fallback codec spec", () => {
    expect(heroMediaPackagingSpec.fallback.container).toBeTruthy();
    expect(heroMediaPackagingSpec.fallback.videoCodec).toBeTruthy();
  });

  it("has validation checklist", () => {
    expect(heroMediaPackagingSpec.validationChecklist.length).toBeGreaterThan(0);
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

  it("getVideoObjectJsonLd has required fields", () => {
    const data = getVideoObjectJsonLd();
    expect(data["@type"]).toBe("VideoObject");
    expect(data.name).toBeTruthy();
    expect(data.transcript).toBeTruthy();
    expect(data.duration).toMatch(/^PT\d+S$/);
    expect(data.inLanguage).toBe("en");
  });
});
