import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  validateDashboardDemoPack,
  validateDashboardManifest,
} from "@/lib/agent-mail-wasm";

const projectRoot = process.cwd();
const manifestPath = join(projectRoot, "public/agent-mail-dashboard/manifest.v1.json");
const packPath = join(projectRoot, "public/agent-mail-dashboard/demo_pack.v1.json");

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

describe("Agent Mail browser dashboard artifacts", () => {
  it("accepts the checked-in manifest and public demo pack", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const pack = validateDashboardDemoPack(readJson(packPath));

    expect(manifest.schema).toBe("agent_mail.dashboard_artifacts.v1");
    expect(pack.schema).toBe("agent_mail.demo_pack.v1");
    expect(pack.provenance.privacy_policy).toBe("agent-mail-dashboard-public-demo-v1");
    expect(pack.provenance.source_label).toMatch(/aggregate counts.*details synthetic/i);
  });

  it("matches every byte size and SHA-256 digest in the manifest", () => {
    const manifest = validateDashboardManifest(readJson(manifestPath));
    const byteArtifacts = Object.values(manifest.artifacts).filter(
      (artifact): artifact is Required<typeof artifact> =>
        typeof artifact.bytes === "number" && typeof artifact.sha256 === "string",
    );

    for (const artifact of byteArtifacts) {
      const bytes = readFileSync(join(projectRoot, "public", artifact.url));
      expect(bytes.byteLength, artifact.url).toBe(artifact.bytes);
      expect(createHash("sha256").update(bytes).digest("hex"), artifact.url).toBe(artifact.sha256);
    }
  });

  it("rejects remote, traversing, and malformed artifact URLs", () => {
    const manifest = readJson(manifestPath) as Record<string, unknown>;
    const remote = structuredClone(manifest) as {
      artifacts: { renderer_js: { url: string } };
    };
    remote.artifacts.renderer_js.url = "https://example.com/renderer.js";
    expect(() => validateDashboardManifest(remote)).toThrow(/local.*agent-mail-dashboard/i);

    const traversing = structuredClone(manifest) as {
      artifacts: { renderer_js: { url: string } };
    };
    traversing.artifacts.renderer_js.url = "/agent-mail-dashboard/../secret.js";
    expect(() => validateDashboardManifest(traversing)).toThrow(/local.*agent-mail-dashboard/i);
  });

  it("rejects packs that lose their explicit privacy boundary", () => {
    const pack = readJson(packPath) as Record<string, unknown>;
    const changed = structuredClone(pack) as {
      provenance: { privacy_policy: string; source_label: string };
    };
    changed.provenance.privacy_policy = "unknown";
    expect(() => validateDashboardDemoPack(changed)).toThrow(/privacy policy/i);

    changed.provenance.privacy_policy = "agent-mail-dashboard-public-demo-v1";
    changed.provenance.source_label = "live production data";
    expect(() => validateDashboardDemoPack(changed)).toThrow(/aggregate and synthetic/i);
  });

  it("contains no home directories, database paths, or common credential markers", () => {
    const raw = readFileSync(packPath, "utf8");
    expect(raw).not.toMatch(/\/Users\/|\/home\/|storage\.sqlite|agent_mail\.db/i);
    expect(raw).not.toMatch(/BEGIN (?:RSA |OPENSSH )?PRIVATE KEY|api[_-]?key|bearer\s+[a-z0-9._-]+/i);
  });
});
