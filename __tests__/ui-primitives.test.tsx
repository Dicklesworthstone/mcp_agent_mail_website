import { useState } from "react";
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { JsonLd } from "@/components/json-ld";
import SpecSearch from "@/components/spec-explorer/spec-search";
import { cn, isTextInputLike } from "@/lib/utils";

// ─── JsonLd Component ────────────────────────────────────────────

describe("JsonLd", () => {
  it("renders a script tag with type application/ld+json", () => {
    const data = { "@type": "WebSite", name: "Test" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
  });

  it("serializes data as JSON in script content", () => {
    const data = { "@context": "https://schema.org", "@type": "WebSite", name: "Test Site" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.innerHTML).toBe(JSON.stringify(data));
  });

  it("handles nested objects correctly", () => {
    const data = {
      "@type": "SoftwareApplication",
      offers: { "@type": "Offer", price: "0" },
    };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const parsed = JSON.parse(script?.innerHTML ?? "{}");
    expect(parsed.offers["@type"]).toBe("Offer");
    expect(parsed.offers.price).toBe("0");
  });
});

// ─── cn utility ──────────────────────────────────────────────────

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("px-4", "py-2");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });

  it("handles tailwind merge conflicts", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });
});

// ─── isTextInputLike ─────────────────────────────────────────────

describe("isTextInputLike", () => {
  it("returns false for null", () => {
    expect(isTextInputLike(null)).toBe(false);
  });

  it("returns true for input elements", () => {
    const input = document.createElement("input");
    expect(isTextInputLike(input)).toBe(true);
  });

  it("returns true for textarea elements", () => {
    const textarea = document.createElement("textarea");
    expect(isTextInputLike(textarea)).toBe(true);
  });

  it("returns true for select elements", () => {
    const select = document.createElement("select");
    expect(isTextInputLike(select)).toBe(true);
  });

  it("returns false for regular div", () => {
    const div = document.createElement("div");
    expect(isTextInputLike(div)).toBe(false);
  });
});

// ─── Viz Framework Exports ──────────────────────────────────────

describe("viz-framework exports", () => {
  it("exports className constants as non-empty strings", async () => {
    const mod = await import("@/components/viz/viz-framework");
    expect(mod.vizSurfaceClassName).toBeTruthy();
    expect(mod.vizPanelClassName).toBeTruthy();
    expect(mod.vizMetaLabelClassName).toBeTruthy();
    expect(mod.vizBodyCopyClassName).toBeTruthy();
  });

  it("VizSurface renders children inside a section", async () => {
    const { VizSurface } = await import("@/components/viz/viz-framework");
    const { container } = render(
      <VizSurface>
        <p data-testid="child">Hello</p>
      </VizSurface>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(container.querySelector("section")).not.toBeNull();
  });

  it("VizControlButton renders as a button element", async () => {
    const { VizControlButton } = await import("@/components/viz/viz-framework");
    render(<VizControlButton>Click me</VizControlButton>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.getAttribute("type")).toBe("button");
  });

  it("VizControlButton applies tone classes", async () => {
    const { VizControlButton } = await import("@/components/viz/viz-framework");
    const { container } = render(
      <VizControlButton tone="blue">Blue</VizControlButton>
    );
    const button = container.querySelector("button");
    expect(button?.className).toContain("blue");
  });
});

// ─── Motion Module Exports ──────────────────────────────────────

describe("motion module exports", () => {
  it("exports spring configs with expected shapes", async () => {
    const mod = await import("@/components/motion");
    expect(mod.springs.smooth.type).toBe("spring");
    expect(mod.springs.snappy.type).toBe("spring");
    expect(mod.springs.gentle.type).toBe("spring");
    expect(mod.springs.quick.type).toBe("spring");
  });

  it("exports variant objects with hidden/visible states", async () => {
    const mod = await import("@/components/motion");
    expect(mod.fadeUp).toHaveProperty("hidden");
    expect(mod.fadeUp).toHaveProperty("visible");
    expect(mod.fadeScale).toHaveProperty("hidden");
    expect(mod.fadeScale).toHaveProperty("visible");
    expect(mod.staggerContainer).toHaveProperty("hidden");
    expect(mod.staggerContainer).toHaveProperty("visible");
  });
});

function SpecSearchHarness({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <input aria-label="Other input" />
      <SpecSearch value={value} onChange={setValue} />
    </div>
  );
}

// ─── Spec Search ────────────────────────────────────────────────

describe("SpecSearch", () => {
  it("focuses the search input when / is pressed outside text inputs", () => {
    render(<SpecSearchHarness />);

    const search = screen.getByLabelText("Search spec documents");
    expect(search).not.toHaveFocus();

    fireEvent.keyDown(document, { key: "/" });
    expect(search).toHaveFocus();
  });

  it("does not steal focus when / is pressed inside another text input", () => {
    render(<SpecSearchHarness />);

    const otherInput = screen.getByLabelText("Other input");
    const search = screen.getByLabelText("Search spec documents");

    otherInput.focus();
    expect(otherInput).toHaveFocus();

    fireEvent.keyDown(document, { key: "/" });

    expect(otherInput).toHaveFocus();
    expect(search).not.toHaveFocus();
  });

  it("clears and blurs the search input on Escape", () => {
    render(<SpecSearchHarness initialValue="seed" />);

    const search = screen.getByLabelText("Search spec documents") as HTMLInputElement;
    expect(search.value).toBe("seed");

    search.focus();
    expect(search).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(search.value).toBe("");
    expect(search).not.toHaveFocus();
  });
});
