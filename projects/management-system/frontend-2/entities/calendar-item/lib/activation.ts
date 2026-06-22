import type { KeyboardEvent } from "react";

/**
 * Handler factory for keyboard activation on `role="button"` elements. Calls
 * `fn` (with `preventDefault`) when the user presses Enter or Space — the
 * standard activation contract for non-`<button>` interactive elements.
 *
 * Usage:
 *   onKeyDown={handleClick ? onActivation(handleClick) : undefined}
 */
export function onActivation<E extends Element = Element>(
  fn: () => void
): (event: KeyboardEvent<E>) => void {
  return (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      fn();
    }
  };
}
