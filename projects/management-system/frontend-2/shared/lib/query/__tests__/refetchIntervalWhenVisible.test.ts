import { describe, expect, it, vi } from "vitest";

import {
  SHELL_BADGE_REFETCH_MS,
  refetchIntervalWhenVisible,
} from "../refetchIntervalWhenVisible";

describe("refetchIntervalWhenVisible", () => {
  it("returns interval when document is visible", () => {
    vi.stubGlobal("document", { visibilityState: "visible" });
    expect(refetchIntervalWhenVisible(60_000)).toBe(60_000);
    vi.unstubAllGlobals();
  });

  it("returns false when document is hidden", () => {
    vi.stubGlobal("document", { visibilityState: "hidden" });
    expect(refetchIntervalWhenVisible(60_000)).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe("SHELL_BADGE_REFETCH_MS", () => {
  it("uses a two-minute cadence", () => {
    expect(SHELL_BADGE_REFETCH_MS).toBe(120_000);
  });
});
