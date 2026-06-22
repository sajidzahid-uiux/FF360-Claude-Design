import { describe, expect, it } from "vitest";

import {
  addVertex,
  isNearFirstVertex,
  shouldRenderClosedPolygon,
  undoVertex,
} from "../polygonEdit";

describe("polygonEdit", () => {
  const triangle = [
    { lat: 40, lng: -100 },
    { lat: 41, lng: -100 },
    { lat: 40.5, lng: -99 },
  ];

  it("addVertex appends a coordinate", () => {
    expect(addVertex(triangle, 40, -101)).toHaveLength(4);
  });

  it("undoVertex removes the last coordinate", () => {
    expect(undoVertex(triangle)).toHaveLength(2);
  });

  it("isNearFirstVertex detects clicks on the first vertex", () => {
    expect(isNearFirstVertex(triangle, 40.00005, -100.00005)).toBe(true);
    expect(isNearFirstVertex(triangle, 41, -100)).toBe(false);
  });

  it("isNearFirstVertex requires at least 3 vertices", () => {
    expect(isNearFirstVertex(triangle.slice(0, 2), 40, -100)).toBe(false);
  });

  it("shouldRenderClosedPolygon when explicitly closed", () => {
    expect(shouldRenderClosedPolygon(triangle, true, false)).toBe(true);
  });

  it("shouldRenderClosedPolygon when not drawing and 3+ vertices", () => {
    expect(shouldRenderClosedPolygon(triangle, false, false)).toBe(true);
  });

  it("shouldRenderClosedPolygon stays open while drawing", () => {
    expect(shouldRenderClosedPolygon(triangle, false, true)).toBe(false);
  });
});
