/** Matches `FIELD_FLOW_APP_LAYOUT_MOBILE_MEDIA_QUERY` (820px). */
export const MODAL_MOBILE_MAX_WIDTH = '820px';

/** Overlay: edge-to-edge modal shell on small viewports (no backdrop padding). */
export const overlayMobileFullscreenClassName =
  'max-[820px]:items-stretch max-[820px]:justify-stretch max-[820px]:p-0';

/** Modal panel: full viewport on small screens (forms, org switcher — not confirm dialogs). */
export const modalMobileFullscreenClassName =
  'max-[820px]:fixed max-[820px]:inset-0 max-[820px]:z-10 max-[820px]:flex max-[820px]:h-full max-[820px]:max-h-none max-[820px]:w-full max-[820px]:max-w-none max-[820px]:rounded-none';

/**
 * Confirm/alert dialogs: stay a compact card on mobile (centered in overlay, not full viewport).
 */
export const dialogMobileShellClassName =
  'max-[820px]:my-auto max-[820px]:max-h-[min(90dvh,100%)] max-[820px]:w-[calc(100%-2rem)] max-[820px]:max-w-md max-[820px]:shrink-0 max-[820px]:overflow-y-auto';

/** Stack dialog actions vertically on narrow screens so labels are not truncated. */
export const dialogMobileActionsClassName =
  'max-[820px]:flex-col max-[820px]:flex-col-reverse sm:flex-row';
