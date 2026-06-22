"use client";

import { useDesignRequestPanelScope } from "../model/design-request-panel-store";
import { useDesignRequestEffectiveStatus } from "./useDesignRequestEffectiveStatus";

export function useDesignRequestPanelRequestId(): number | null {
  const scope = useDesignRequestPanelScope();
  const statusItem = useDesignRequestEffectiveStatus(
    scope?.organizationId,
    scope?.sourceType,
    scope?.sourceId,
    Boolean(scope)
  );
  return statusItem?.id ?? null;
}
