import { describe, expect, it } from "vitest";

import {
  buildOrderPipeItemPayload,
  validateOrderPipeItemDraft,
  validateOrderPipeItemsPayload,
} from "@/features/order-pipe/order-pipe-wizard/lib/order-pipe-item-validation";

describe("validateOrderPipeItemDraft", () => {
  it("requires category, option, and quantity >= 1", () => {
    expect(
      validateOrderPipeItemDraft({
        categoryCode: "",
        typeCode: "",
        optionValue: "",
        quantity: "",
        hasTypes: false,
      })
    ).toBe("Select a pipe category.");

    expect(
      validateOrderPipeItemDraft({
        categoryCode: "S",
        typeCode: "",
        optionValue: "",
        quantity: "2",
        hasTypes: false,
      })
    ).toBe("Select a pipe size/option.");

    expect(
      validateOrderPipeItemDraft({
        categoryCode: "S",
        typeCode: "",
        optionValue: "8",
        quantity: "0",
        hasTypes: false,
      })
    ).toBe("Quantity must be at least 1.");
  });

  it("requires type when category has types", () => {
    expect(
      validateOrderPipeItemDraft({
        categoryCode: "C",
        typeCode: "",
        optionValue: "8",
        quantity: "3",
        hasTypes: true,
      })
    ).toBe("Select a pipe type.");
  });

  it("builds API payload when draft is valid", () => {
    expect(
      buildOrderPipeItemPayload({
        categoryCode: "S",
        typeCode: "",
        optionValue: "8",
        quantity: "4",
        hasTypes: false,
      })
    ).toEqual({
      pipe_type: "S",
      size: "8",
      quantity: 4,
    });

    expect(
      buildOrderPipeItemPayload({
        categoryCode: "C",
        typeCode: "I",
        optionValue: "10",
        quantity: "2",
        hasTypes: true,
      })
    ).toEqual({
      pipe_type: "C",
      sub_type: "I",
      size: "10",
      quantity: 2,
    });
  });
});

describe("validateOrderPipeItemsPayload", () => {
  it("rejects empty vendor form items array", () => {
    expect(validateOrderPipeItemsPayload([])).toBe(
      "Add at least one order item."
    );
  });

  it("validates each line item before PATCH", () => {
    expect(
      validateOrderPipeItemsPayload([
        { pipe_type: "S", size: "8", quantity: 2 },
      ])
    ).toBeNull();

    expect(
      validateOrderPipeItemsPayload([{ pipe_type: "", size: "8", quantity: 2 }])
    ).toContain("pipe category");
  });
});
