import { describe, it, expect } from "vitest";
import { heroDemoTranscript, heroTuiDemo } from "@/lib/content";

/**
 * Helper: parse "MM:SS.mmm" timecode strings into total milliseconds
 * for numeric comparison.
 */
function parseTimecode(tc: string): number {
  // Handles "MM:SS.mmm" and "HH:MM:SS.mmm" formats
  const parts = tc.split(":");
  if (parts.length === 2) {
    const [min, secMs] = parts;
    const [sec, ms] = secMs.split(".");
    return parseInt(min, 10) * 60_000 + parseInt(sec, 10) * 1000 + parseInt(ms, 10);
  }
  // HH:MM:SS.mmm
  const [hr, min, secMs] = parts;
  const [sec, ms] = secMs.split(".");
  return (
    parseInt(hr, 10) * 3_600_000 +
    parseInt(min, 10) * 60_000 +
    parseInt(sec, 10) * 1000 +
    parseInt(ms, 10)
  );
}

describe("viz framework exports", () => {
  it("VizSurface and VizControlButton are importable", async () => {
    const mod = await import("@/components/viz/viz-framework");
    expect(mod.VizSurface).toBeDefined();
    expect(typeof mod.VizSurface).toBe("function");
    expect(mod.VizControlButton).toBeDefined();
    expect(typeof mod.VizControlButton).toBe("function");
  });

  it("exports className constants", async () => {
    const mod = await import("@/components/viz/viz-framework");
    expect(typeof mod.vizSurfaceClassName).toBe("string");
    expect(typeof mod.vizPanelClassName).toBe("string");
    expect(typeof mod.vizMetaLabelClassName).toBe("string");
    expect(typeof mod.vizBodyCopyClassName).toBe("string");
  });
});

describe("heroDemoTranscript.chapters", () => {
  it("has at least one chapter", () => {
    expect(heroDemoTranscript.chapters.length).toBeGreaterThan(0);
  });

  it("chapters have non-overlapping time ranges", () => {
    const chapters = heroDemoTranscript.chapters;
    for (let i = 1; i < chapters.length; i++) {
      const prevEnd = parseTimecode(chapters[i - 1].endTime);
      const currStart = parseTimecode(chapters[i].startTime);
      // Each chapter should start at or after the previous chapter ends
      expect(currStart).toBeGreaterThanOrEqual(prevEnd);
    }
  });

  it("each chapter startTime is before its endTime", () => {
    for (const ch of heroDemoTranscript.chapters) {
      expect(parseTimecode(ch.endTime)).toBeGreaterThan(parseTimecode(ch.startTime));
    }
  });

  it("each chapter has a non-empty title", () => {
    for (const ch of heroDemoTranscript.chapters) {
      expect(ch.title.length).toBeGreaterThan(0);
    }
  });
});

describe("heroDemoTranscript.captions", () => {
  it("has at least one caption", () => {
    expect(heroDemoTranscript.captions.length).toBeGreaterThan(0);
  });

  it("captions have sequential startTime timestamps", () => {
    const captions = heroDemoTranscript.captions;
    for (let i = 1; i < captions.length; i++) {
      const prevStart = parseTimecode(captions[i - 1].startTime);
      const currStart = parseTimecode(captions[i].startTime);
      expect(currStart).toBeGreaterThanOrEqual(prevStart);
    }
  });

  it("each caption startTime is before its endTime", () => {
    for (const cap of heroDemoTranscript.captions) {
      expect(parseTimecode(cap.endTime)).toBeGreaterThan(parseTimecode(cap.startTime));
    }
  });

  it("each caption has non-empty text", () => {
    for (const cap of heroDemoTranscript.captions) {
      expect(cap.text.length).toBeGreaterThan(0);
    }
  });
});

describe("heroTuiDemo", () => {
  it("has all required fields", () => {
    expect(typeof heroTuiDemo.id).toBe("string");
    expect(heroTuiDemo.id.length).toBeGreaterThan(0);

    expect(typeof heroTuiDemo.width).toBe("number");
    expect(heroTuiDemo.width).toBeGreaterThan(0);

    expect(typeof heroTuiDemo.height).toBe("number");
    expect(heroTuiDemo.height).toBeGreaterThan(0);

    expect(typeof heroTuiDemo.ariaLabel).toBe("string");
    expect(heroTuiDemo.ariaLabel.length).toBeGreaterThan(0);

    expect(typeof heroTuiDemo.reducedMotionFallback).toBe("string");
    expect(heroTuiDemo.reducedMotionFallback.length).toBeGreaterThan(0);

    expect(typeof heroTuiDemo.overlayTitle).toBe("string");
    expect(typeof heroTuiDemo.overlaySubtitle).toBe("string");

    expect(Array.isArray(heroTuiDemo.feedEvents)).toBe(true);
    expect(heroTuiDemo.feedEvents.length).toBeGreaterThan(0);
    expect(Array.isArray(heroTuiDemo.activeAgentPreview)).toBe(true);
    expect(heroTuiDemo.activeAgentPreview.length).toBeGreaterThan(0);
  });

  it("feed events have valid severity and timing shape", () => {
    const validImportance = ["low", "normal", "high", "urgent"];
    for (const event of heroTuiDemo.feedEvents) {
      expect(validImportance).toContain(event.importance);
      expect(event.sender.length).toBeGreaterThan(0);
      expect(event.subject.length).toBeGreaterThan(0);
      expect(event.createdTs).toBeGreaterThan(1_000_000_000_000);
    }
  });
});
