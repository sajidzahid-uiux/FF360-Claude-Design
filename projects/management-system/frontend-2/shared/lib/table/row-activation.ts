/**
 * Selector matching elements that own their own click behaviour inside a
 * clickable row/card (action menus, status selectors, checkboxes, links).
 * A click on any of these must NOT trigger row-level navigation.
 *
 * Add `data-no-row-nav` to any custom interactive cell to opt it out.
 */
const INTERACTIVE_TARGET_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[contenteditable="true"]',
  "[data-no-row-nav]",
].join(",");

/** True when the click originated from an element that handles its own click. */
export function isInteractiveRowTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(INTERACTIVE_TARGET_SELECTOR));
}
