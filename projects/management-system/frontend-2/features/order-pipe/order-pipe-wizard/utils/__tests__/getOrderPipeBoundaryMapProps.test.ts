import { describe, expect, it } from "vitest";

import type { VendorFormV2 } from "@/api/types";

import { getOrderPipeBoundaryMapProps } from "../getOrderPipeBoundaryMapProps";

const baseOrder: VendorFormV2 = {
  id: 1,
  job: 42012,
  vendor_id: null,
  vendor: null,
  location: "",
  items: [],
  order_pdf: null,
  order_status: "Pending",
  delivery_locations: [],
};

describe("getOrderPipeBoundaryMapProps", () => {
  it("draws a ring per job_farms entry", () => {
    const props = getOrderPipeBoundaryMapProps({
      ...baseOrder,
      job_farms: [
        {
          id: 23063,
          name: "farm test 1",
          is_primary: true,
          latitude: 37.96,
          longitude: -119.84,
          vertices: [
            [-119.81, 37.97],
            [-119.85, 37.96],
            [-119.83, 37.95],
          ],
        },
        {
          id: 23050,
          name: "irontiltfarm1",
          is_primary: false,
          latitude: 39.82,
          longitude: -98.57,
          vertices: [
            [-98.57, 39.83],
            [-98.58, 39.83],
            [-98.57, 39.82],
          ],
        },
      ],
    });
    expect(props.vertexRings).toHaveLength(2);
    expect(props.primaryRingIndex).toBe(0);
    expect(props.vertexRings[0][0]).toEqual({ lat: 37.97, lng: -119.81 });
    expect(props.location).toEqual({ lat: 37.96, lng: -119.84 });
  });

  it("falls back to job_field_boundaries when job_farms is absent", () => {
    const props = getOrderPipeBoundaryMapProps({
      ...baseOrder,
      job_field_boundaries: {
        latitude: 37.96,
        longitude: -119.84,
        vertices: [
          [-119.81, 37.97],
          [-119.85, 37.96],
          [-119.83, 37.95],
        ],
      },
    });
    expect(props.vertexRings).toHaveLength(1);
    expect(props.location).toEqual({ lat: 37.96, lng: -119.84 });
  });
});
