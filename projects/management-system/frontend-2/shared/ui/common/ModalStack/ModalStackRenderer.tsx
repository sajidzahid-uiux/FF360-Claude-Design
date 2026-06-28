"use client";

import { Fragment } from "react";

import { useModalStack } from "@/shared/model/use-modal-stack";

import { getModalEntry } from "./registry";

/**
 * Renders the URL-driven modal stack. Mounted once, globally.
 *
 * Every frame in the `?modal=` param is rendered as an overlay on top of the
 * current page. Closing a frame (or browser Back) pops it off the URL. The
 * underlying module stays mounted the whole time.
 */
export function ModalStackRenderer() {
  const { stack, closeModalKey } = useModalStack();

  if (!stack.length) return null;

  return (
    <>
      {stack.map((frame, index) => {
        const entry = getModalEntry(frame.key);
        // Keys not in the global registry are "Pattern B" modals — rendered
        // in-place by their own page from the URL stack, not globally here.
        if (!entry) {
          return null;
        }

        const isTop = index === stack.length - 1;
        return (
          <Fragment key={`${frame.key}-${index}`}>
            {entry.render({
              params: frame.params,
              isTop,
              close: () => closeModalKey(frame.key),
            })}
          </Fragment>
        );
      })}
    </>
  );
}
