import { describe, it, expect } from "vitest";
import {
  adoptionMessages,
  credibilityHighlights,
  communityTestimonials,
  evidenceBackedClaims,
} from "@/lib/content";

describe("adoptionMessages", () => {
  it("is non-empty", () => {
    expect(adoptionMessages.length).toBeGreaterThan(0);
  });

  it("each message has headline, subline, ctaLabel, ctaHref", () => {
    for (const msg of adoptionMessages) {
      expect(typeof msg.headline).toBe("string");
      expect(msg.headline.length).toBeGreaterThan(0);

      expect(typeof msg.subline).toBe("string");
      expect(msg.subline.length).toBeGreaterThan(0);

      expect(typeof msg.ctaLabel).toBe("string");
      expect(msg.ctaLabel.length).toBeGreaterThan(0);

      expect(typeof msg.ctaHref).toBe("string");
      expect(msg.ctaHref.length).toBeGreaterThan(0);
    }
  });

  it("all ctaHref values start with /", () => {
    for (const msg of adoptionMessages) {
      expect(msg.ctaHref).toMatch(/^\//);
    }
  });

  it("all adoption messages have unique IDs", () => {
    const ids = adoptionMessages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("credibilityHighlights", () => {
  it("is non-empty", () => {
    expect(credibilityHighlights.length).toBeGreaterThan(0);
  });

  it("all highlights have unique IDs", () => {
    const ids = credibilityHighlights.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each highlight has metric, value, context, and icon", () => {
    for (const h of credibilityHighlights) {
      expect(typeof h.metric).toBe("string");
      expect(h.metric.length).toBeGreaterThan(0);

      expect(typeof h.value).toBe("string");
      expect(h.value.length).toBeGreaterThan(0);

      expect(typeof h.context).toBe("string");
      expect(h.context.length).toBeGreaterThan(0);

      expect(typeof h.icon).toBe("string");
      expect(h.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("communityTestimonials", () => {
  it("is non-empty", () => {
    expect(communityTestimonials.length).toBeGreaterThan(0);
  });

  it("each testimonial has author, handle, and content fields", () => {
    for (const t of communityTestimonials) {
      expect(typeof t.author).toBe("string");
      expect(t.author.length).toBeGreaterThan(0);

      expect(typeof t.handle).toBe("string");
      expect(t.handle.length).toBeGreaterThan(0);

      expect(typeof t.content).toBe("string");
      expect(t.content.length).toBeGreaterThan(0);
    }
  });

  it("all testimonials have unique IDs", () => {
    const ids = communityTestimonials.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("evidenceBackedClaims", () => {
  it("is non-empty", () => {
    expect(evidenceBackedClaims.length).toBeGreaterThan(0);
  });

  it("each claim has valid category value", () => {
    const validCategories = ["scale", "reliability", "performance", "architecture", "adoption"];
    for (const claim of evidenceBackedClaims) {
      expect(validCategories).toContain(claim.category);
    }
  });

  it("each claim has id, claim text, evidence, and source", () => {
    for (const claim of evidenceBackedClaims) {
      expect(typeof claim.id).toBe("string");
      expect(claim.id.length).toBeGreaterThan(0);

      expect(typeof claim.claim).toBe("string");
      expect(claim.claim.length).toBeGreaterThan(0);

      expect(typeof claim.evidence).toBe("string");
      expect(claim.evidence.length).toBeGreaterThan(0);

      expect(typeof claim.source).toBe("string");
      expect(claim.source.length).toBeGreaterThan(0);
    }
  });

  it("all claims have unique IDs", () => {
    const ids = evidenceBackedClaims.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("no duplicate IDs across conversion modules", () => {
  it("adoptionMessages, credibilityHighlights, communityTestimonials, and evidenceBackedClaims have globally unique IDs", () => {
    const allIds = [
      ...adoptionMessages.map((m) => m.id),
      ...credibilityHighlights.map((h) => h.id),
      ...communityTestimonials.map((t) => t.id),
      ...evidenceBackedClaims.map((c) => c.id),
    ];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
