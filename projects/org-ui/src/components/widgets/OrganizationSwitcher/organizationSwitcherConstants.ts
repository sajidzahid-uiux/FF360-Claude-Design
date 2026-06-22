/** Other org cards fade out before the selected card fills the switcher. */
export const ORG_SWITCHER_COLLAPSE_MS = 320;

/** Selected org expand animation. */
export const ORG_SWITCHER_EXPAND_MS = 640;

/** Expanded card stays on screen before navigation. */
export const ORG_SWITCHER_HOLD_MS = 720;

/** Collapse → expand, then hold, then `onSelectOrganization`. */
export const ORG_SWITCHER_SELECT_TOTAL_MS =
  ORG_SWITCHER_COLLAPSE_MS + ORG_SWITCHER_EXPAND_MS + ORG_SWITCHER_HOLD_MS;
