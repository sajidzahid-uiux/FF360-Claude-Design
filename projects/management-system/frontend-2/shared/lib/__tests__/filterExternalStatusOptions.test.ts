import { describe, expect, it } from "vitest";

import {
  filterExternalStatusOptions,
  isTerminalStatusTitle,
} from "../filterExternalStatusOptions";

describe("isTerminalStatusTitle", () => {
  it("recognizes completed and cancelled variants", () => {
    expect(isTerminalStatusTitle("Completed")).toBe(true);
    expect(isTerminalStatusTitle("cancelled")).toBe(true);
    expect(isTerminalStatusTitle("Canceled")).toBe(true);
  });

  it("returns false for active statuses", () => {
    expect(isTerminalStatusTitle("In Progress")).toBe(false);
    expect(isTerminalStatusTitle("On Hold")).toBe(false);
  });
});

describe("filterExternalStatusOptions", () => {
  it("removes terminal statuses from dropdown options", () => {
    const options = [
      { id: 1, title: "In Progress" },
      { id: 2, title: "Completed" },
      { id: 3, title: "Cancelled" },
    ];

    expect(filterExternalStatusOptions(options)).toEqual([
      { id: 1, title: "In Progress" },
    ]);
  });
});
