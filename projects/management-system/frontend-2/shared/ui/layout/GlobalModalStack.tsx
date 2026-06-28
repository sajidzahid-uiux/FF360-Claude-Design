"use client";

import { Suspense } from "react";

import { ModalStackRenderer } from "@/shared/ui/common/ModalStack";

/**
 * Globally-mounted URL-driven modal stack. Wrapped in Suspense because
 * ModalStackRenderer reads useSearchParams().
 */
export function GlobalModalStack() {
  return (
    <Suspense fallback={null}>
      <ModalStackRenderer />
    </Suspense>
  );
}
