import path from "path";
import { describe, expect, it } from "vitest";

import { buildAppRedirects } from "@/shared/config/routes";

import { LEGACY_REDIRECT_SOURCES } from "../appRouteRegistry";

const V1_ROOT = path.resolve(import.meta.dirname, "../../../../../frontend");

describe("legacy redirect parity", () => {
  const redirects = buildAppRedirects();

  it("defines Next.js redirects for every legacy v1 org path segment", () => {
    for (const legacyPath of LEGACY_REDIRECT_SOURCES) {
      const hasRedirect = redirects.some((entry) =>
        entry.source.includes(legacyPath.replace(/^\//, ""))
      );
      expect(hasRedirect, `missing redirect for ${legacyPath}`).toBe(true);
    }
  });

  it("classic frontend choose-org maps to v2 organizations list", () => {
    const v1ChooseOrg = path.join(V1_ROOT, "app/choose-org/page.tsx");
    const v2Organizations = path.join(
      import.meta.dirname,
      "../../../../app/organizations/page.tsx"
    );

    expect(v1ChooseOrg).toBeTruthy();
    expect(v2Organizations).toBeTruthy();
  });
});
