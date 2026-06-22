import { describe, expect, it } from "vitest";

import { PERMISSION_RESOURCES } from "@/hooks/permissions/constants";
import { matchAppRoutePermission } from "@/hooks/permissions/matchAppRoutePermission";
import { parsePermissionCodes } from "@/hooks/permissions/parsePermissionCodes";

import { matchV1RoutePermission } from "../v1RoutePermissionMatcher";
import { V1_V2_ORG_ROUTE_PAIRS } from "../v1V2RouteMap";

function allReadPermissions(): ReturnType<typeof parsePermissionCodes> {
  return parsePermissionCodes(
    Object.values(PERMISSION_RESOURCES).map((resource) => `${resource}_read`)
  );
}

describe("v1 ↔ v2 route permission parity", () => {
  const permissions = allReadPermissions();

  it.each(V1_V2_ORG_ROUTE_PAIRS)(
    "v1 $v1Path and v2 $v2AppPath resolve to the same permission resource when v1 had a mapping",
    ({ v1Path, v2AppPath, v2PermissionEnhancement }) => {
      const v1Match = matchV1RoutePermission(v1Path, permissions);
      const v2Match = matchAppRoutePermission(v2AppPath, permissions);

      if (v2PermissionEnhancement) {
        expect(v1Match).toBeNull();
        expect(v2Match?.resource).toBeTruthy();
        return;
      }

      if (!v1Match) {
        expect(v2Match).toBeNull();
        return;
      }

      expect(v2Match?.resource).toBe(v1Match.resource);
    }
  );

  it("maps settings/org/trash via v2 matcher (v1 org/trash parity)", () => {
    const parsed = parsePermissionCodes([
      `${PERMISSION_RESOURCES.TRASH_PAGE}_read`,
    ]);

    expect(
      matchAppRoutePermission("/settings/org/trash", parsed)?.resource
    ).toBe(PERMISSION_RESOURCES.TRASH_PAGE);
    expect(matchV1RoutePermission("/12/org/trash", parsed)?.resource).toBe(
      PERMISSION_RESOURCES.TRASH_PAGE
    );
  });
});
