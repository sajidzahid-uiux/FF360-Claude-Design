import type { KeyboardEvent } from "react";

import { describe, expect, it, vi } from "vitest";

import { onActivation } from "../activation";

function keyEvent(key: string): KeyboardEvent<HTMLDivElement> {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent<HTMLDivElement>;
}

describe("onActivation", () => {
  it("invokes the handler on Enter and Space", () => {
    const fn = vi.fn();
    const handler = onActivation(fn);

    handler(keyEvent("Enter"));
    handler(keyEvent(" "));

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("ignores other keys", () => {
    const fn = vi.fn();
    const handler = onActivation(fn);

    handler(keyEvent("Tab"));

    expect(fn).not.toHaveBeenCalled();
  });
});
