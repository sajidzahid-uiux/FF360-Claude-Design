import { describe, expect, it } from "vitest";

import {
  collectMapItemFarmVertices,
  sortMapMarkerFarms,
  toMapMarkerFarms,
} from "../mapFarmGeometry";

describe("collectMapItemFarmVertices", () => {
  it("draws every farm in farms[] when present", () => {
    const rings = collectMapItemFarmVertices({
      vertices: [[-1, 1]],
      farms: [
        {
          farm_id: 1,
          farm_name: "Primary",
          is_primary: true,
          vertices: [
            [-119.81, 37.97],
            [-119.85, 37.96],
            [-119.83, 37.95],
          ],
        },
        {
          farm_id: 2,
          farm_name: "Secondary",
          is_primary: false,
          vertices: [
            [-98.57, 39.83],
            [-98.58, 39.83],
            [-98.57, 39.82],
          ],
        },
      ],
    });
    expect(rings).toHaveLength(2);
    expect(rings[0][0]).toEqual({ lat: 37.97, lng: -119.81 });
    expect(rings[1][0]).toEqual({ lat: 39.83, lng: -98.57 });
  });

  it("falls back to top-level vertices when farms is absent", () => {
    const rings = collectMapItemFarmVertices({
      vertices: [
        [-119.81, 37.97],
        [-119.85, 37.96],
        [-119.83, 37.95],
      ],
    });
    expect(rings).toHaveLength(1);
    expect(rings[0]).toHaveLength(3);
  });

  it("skips farms without enough vertices", () => {
    const rings = collectMapItemFarmVertices({
      farms: [
        {
          farm_id: 1,
          farm_name: "Too few",
          is_primary: true,
          vertices: [[-1, 1]],
        },
      ],
    });
    expect(rings).toHaveLength(0);
  });
});

describe("toMapMarkerFarms", () => {
  it("maps farms array for popup", () => {
    expect(
      toMapMarkerFarms({
        farms: [
          { farm_id: 10, farm_name: "A", is_primary: false },
          { farm_id: 11, farm_name: "B", is_primary: true },
        ],
      })
    ).toEqual([
      { farm_id: 10, farm_name: "A", is_primary: false },
      { farm_id: 11, farm_name: "B", is_primary: true },
    ]);
  });

  it("falls back to legacy farm_id and farm_name", () => {
    expect(toMapMarkerFarms({ farm_id: 5, farm_name: "Legacy Farm" })).toEqual([
      { farm_id: 5, farm_name: "Legacy Farm", is_primary: true },
    ]);
  });
});

describe("sortMapMarkerFarms", () => {
  it("puts primary first", () => {
    const sorted = sortMapMarkerFarms([
      { farm_id: 2, farm_name: "Beta", is_primary: false },
      { farm_id: 1, farm_name: "Alpha", is_primary: true },
    ]);
    expect(sorted[0].farm_id).toBe(1);
    expect(sorted[1].farm_id).toBe(2);
  });
});
