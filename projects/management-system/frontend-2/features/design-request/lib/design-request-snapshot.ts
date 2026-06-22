import type { QueryClient } from "@tanstack/react-query";

import type { DesignRequestDirection } from "@/api/types/designRequest";
import { QUERY_KEYS } from "@/constants";

import type { DesignRequestFormValues } from "./constants";

export interface DesignRequestSubmittedSnapshot {
  direction: DesignRequestDirection;
  spacing: string;
  main: DesignRequestFormValues["main"];
  submain: DesignRequestFormValues["submain"];
  lateral: DesignRequestFormValues["lateral"];
  submittedAt: string;
  requestedByName: string;
}

export function designRequestSnapshotQueryKey(
  organizationId: string,
  requestId: number
): readonly [string, string, number] {
  return [QUERY_KEYS.DESIGN_REQUEST_SNAPSHOT, organizationId, requestId];
}

export function readDesignRequestSnapshot(
  queryClient: QueryClient,
  organizationId: string,
  requestId: number
): DesignRequestSubmittedSnapshot | undefined {
  return queryClient.getQueryData<DesignRequestSubmittedSnapshot>(
    designRequestSnapshotQueryKey(organizationId, requestId)
  );
}

export function writeDesignRequestSnapshot(
  queryClient: QueryClient,
  organizationId: string,
  requestId: number,
  snapshot: DesignRequestSubmittedSnapshot
): void {
  queryClient.setQueryData(
    designRequestSnapshotQueryKey(organizationId, requestId),
    snapshot
  );
}

export function snapshotFromFormValues(
  formValues: DesignRequestFormValues,
  requestedByName: string
): DesignRequestSubmittedSnapshot {
  return {
    direction: formValues.direction as DesignRequestDirection,
    spacing: formValues.spacing,
    main: { ...formValues.main },
    submain: { ...formValues.submain },
    lateral: { ...formValues.lateral },
    submittedAt: new Date().toISOString(),
    requestedByName,
  };
}
