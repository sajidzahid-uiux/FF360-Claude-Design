import { describe, expect, it } from "vitest";
import {
  FieldFlowOrganizationSourceEnum,
  mapOrganizationToFieldFlow,
  mapOrganizationsToFieldFlow,
} from "../src/adapters/organization";

describe("organization adapter", () => {
  it("maps tile-design organization shape to normalized fields", () => {
    const mapped = mapOrganizationToFieldFlow(
      {
        id: 10,
        name: "Tile Org",
        email: "tile@org.dev",
        phone_number: "+1 (555) 0001",
        address: "Iowa",
        created_at: "2026-05-01T00:00:00.000Z",
        member_count: 12,
        owner: false,
        user_type: "Admin",
      },
      FieldFlowOrganizationSourceEnum.TILE_DESIGN
    );

    expect(mapped).toMatchObject({
      id: 10,
      name: "Tile Org",
      email: "tile@org.dev",
      phoneNumber: "+1 (555) 0001",
      memberCount: 12,
      user_type: "Admin",
      canDeleteOrganization: false,
    });
  });

  it("maps cms organization shape and infers delete permission", () => {
    const mapped = mapOrganizationToFieldFlow(
      {
        id: 88,
        company_abbreviation: "CMS",
        name: "CMS Org",
        phone_number: "+1 (555) 9911",
        role: "Owner",
        current_plan: "Pro",
      },
      FieldFlowOrganizationSourceEnum.CMS
    );

    expect(mapped.name).toBe("CMS Org");
    expect(mapped.phoneNumber).toBe("+1 (555) 9911");
    expect(mapped.canDeleteOrganization).toBe(true);
    expect(mapped.current_plan).toBe("Pro");
  });

  it("maps organization arrays", () => {
    const mapped = mapOrganizationsToFieldFlow([{ id: 1, name: "A" }, { id: 2, name: "B" }]);
    expect(mapped).toHaveLength(2);
    expect(mapped[0]?.name).toBe("A");
    expect(mapped[1]?.name).toBe("B");
  });
});

