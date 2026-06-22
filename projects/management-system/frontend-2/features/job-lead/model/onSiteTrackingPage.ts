import type { ReactNode } from "react";

import type { ContactSummaryPartial, Status } from "@/api/types";
import type { JobType, PermissionCode } from "@/constants";

export type JobOnSiteContactInfo = ContactSummaryPartial & {
  id: number;
  full_name: string;
};

export interface JobOnSiteTrackingPageLayoutProps {
  jobType: JobType;
  jobId: string;
  orgId: string | null;
  canReadContact: boolean;
  canEditStatus: boolean;
  statusDisabled: boolean;
  statusTypes?: Status[];
  currentStatus?: Status | null;
  onStatusChange: (statusId: number) => void;
  contactInfo?: JobOnSiteContactInfo | null;
  poNumber?: string | null;
  progressBar?: string | number | null;
  detailHref: string;
  permissionCode: PermissionCode;
  /** Time tracking, installed hours, and tiling production sections. */
  primaryColumn: ReactNode;
  /** Equipment assignment and on-site notes. */
  secondaryColumn: ReactNode;
}
