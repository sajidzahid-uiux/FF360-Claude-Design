import { describe, expect, it } from "vitest";

import { EquipmentTypeEnum } from "@/api/types";

import {
  buildEquipmentDetailHref,
  buildEquipmentLogsHref,
  mapEquipmentTypeToApiCollection,
  toEquipmentTypeQueryParam,
} from "../equipment-routes";

describe("equipment-routes", () => {
  const equipment = {
    id: 10,
    equipment_ptr_id: 42,
    equipment_type: EquipmentTypeEnum.VEHICLE,
    machine_name: "Truck A",
  };

  it("builds detail href with ptr id and singular equipment_type", () => {
    expect(buildEquipmentDetailHref(7, equipment)).toBe(
      "/organizations/7/equipment/42?equipment_type=vehicle"
    );
  });

  it("builds logs href with encoded name", () => {
    expect(buildEquipmentLogsHref(7, equipment)).toBe(
      "/organizations/7/equipment/42/logs?equipment_type=vehicle&name=Truck%20A"
    );
  });

  it("normalizes plural equipment types for API collection", () => {
    expect(mapEquipmentTypeToApiCollection("trailers")).toBe("trailers");
    expect(toEquipmentTypeQueryParam("machines")).toBe(
      EquipmentTypeEnum.MACHINE
    );
  });
});
