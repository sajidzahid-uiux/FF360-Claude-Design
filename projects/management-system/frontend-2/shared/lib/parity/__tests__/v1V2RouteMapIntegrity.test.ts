import { describe, expect, it } from "vitest";

import { ORG_APP_ROUTE_REGISTRY } from "@/shared/lib/parity/appRouteRegistry";
import { V1_V2_ORG_ROUTE_PAIRS } from "@/shared/lib/parity/v1V2RouteMap";

describe("v1V2RouteMap integrity", () => {
  it("has no duplicate v1 paths", () => {
    const paths = V1_V2_ORG_ROUTE_PAIRS.map((pair) => pair.v1Path);
    expect(paths.length).toBe(new Set(paths).size);
  });

  it("allows multiple v1 paths to map to the same v2 canonical route", () => {
    const v2Paths = V1_V2_ORG_ROUTE_PAIRS.map((pair) => pair.v2AppPath);
    const statusManagementCount = v2Paths.filter(
      (path) => path === "/status-management"
    ).length;
    expect(statusManagementCount).toBeGreaterThanOrEqual(2);
  });

  it("covers every registry route that existed in classic frontend core areas", () => {
    const mappedV2Paths = new Set(
      V1_V2_ORG_ROUTE_PAIRS.map((pair) => pair.v2AppPath)
    );

    const requiredFromRegistry = ORG_APP_ROUTE_REGISTRY.filter(
      (route) =>
        route.kind === "feature" &&
        route.featureModule &&
        !route.notes?.includes("v2-only")
    ).map((route) => route.normalizedPath);

    const missing = requiredFromRegistry.filter((path) => {
      if (mappedV2Paths.has(path)) return false;
      const prefix = path.split("/:")[0];
      if (
        V1_V2_ORG_ROUTE_PAIRS.some(
          (pair) =>
            pair.v2AppPath === path ||
            pair.v2AppPath.startsWith(`${prefix}/`) ||
            pair.v2AppPath === prefix
        )
      ) {
        return false;
      }
      return true;
    });

    expect(missing, missing.join("\n")).toEqual([]);
  });

  it("documents v2 permission enhancements separately from parity pairs", () => {
    const enhanced = V1_V2_ORG_ROUTE_PAIRS.filter(
      (pair) => pair.v2PermissionEnhancement
    );
    expect(enhanced.length).toBeGreaterThan(0);
    expect(enhanced.every((pair) => pair.v1Path.startsWith("/12/"))).toBe(true);
  });
});
