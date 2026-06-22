"use client";

/**
 * We use a single reusable JobsPageLayout component for all job pages (drainage-tiling, excavation, repair)
 * instead of creating separate layout components for each page, because all job pages share the same UI structure,
 * reducing code duplication and improving maintainability.
 */
import { type ReactElement } from "react";

import type { Job, PaginatedResponse } from "@/api/types";
import { PermissionCode } from "@/constants";
import { type JobsPageTab, isJobsPageTab } from "@/features/jobs";
import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView, PermissionCodeGate } from "@/shared/ui/permissions";

export type JobsTab = JobsPageTab;

export const isJobsTab = isJobsPageTab;

interface JobsPageLayoutProps {
  title: string;
  description: string;
  isLoading: boolean;
  data: PaginatedResponse<Job> | Job[] | undefined;
  error: Error | null;
  loadingMessage?: string;
  emptyState: {
    title: string;
    description: string;
  };
  permissionCode: PermissionCode;
  permissionDeniedMessage: string;
  table: ReactElement;
}

export function JobsPageLayout({
  title,
  description,
  isLoading,
  data,
  error,
  loadingMessage = "Loading jobs...",
  emptyState,
  permissionCode,
  permissionDeniedMessage,
  table,
}: JobsPageLayoutProps) {
  return (
    <PageRenderer
      data={data}
      description={description}
      emptyState={emptyState}
      error={error}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      renderChildrenWhenEmpty={true}
      title={title}
    >
      {() => {
        return (
          <PermissionCodeGate
            fallback={<AccessDeniedView message={permissionDeniedMessage} />}
            permissionCode={permissionCode}
          >
            <>
              <div className="cms-job-lead-list-table min-h-0 flex-1">
                {table}
              </div>
            </>
          </PermissionCodeGate>
        );
      }}
    </PageRenderer>
  );
}
