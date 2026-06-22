import { describe, expect, it } from "vitest";

import { boundsFromPoints } from "../mapBounds";

describe("boundsFromPoints", () => {
  it("returns null for empty input", () => {
    expect(boundsFromPoints([], true)).toBeNull();
  });

  it("computes bounds when points are lat-first", () => {
    const bounds = boundsFromPoints(
      [
        [40, -100],
        [41, -99],
      ],
      true
    );
    expect(bounds).toEqual({
      south: 40,
      north: 41,
      west: -100,
      east: -99,
    });
  });

  it("computes bounds when points are lng-first", () => {
    const bounds = boundsFromPoints(
      [
        [-100, 40],
        [-99, 41],
      ],
      false
    );
    expect(bounds).toEqual({
      south: 40,
      north: 41,
      west: -100,
      east: -99,
    });
  });

  it("skips non-finite coordinates", () => {
    const bounds = boundsFromPoints(
      [
        [NaN, -100],
        [40, -100],
        [41, -99],
      ],
      true
    );
    expect(bounds).toEqual({
      south: 40,
      north: 41,
      west: -100,
      east: -99,
    });
  });
});
