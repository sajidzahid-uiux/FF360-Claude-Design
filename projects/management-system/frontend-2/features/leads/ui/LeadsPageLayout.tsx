"use client";

/**
 * We use a single reusable LeadsPageLayout component for all leads pages (drainage-tiling, excavation, repair)
 * instead of creating separate layout components for each page, because all leads pages share the same UI structure,
 * reducing code duplication and improving maintainability.
 */
import { type ReactElement } from "react";

import type { Lead, PaginatedResponse } from "@/api/types";
import { PermissionCode } from "@/constants";
import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView, PermissionCodeGate } from "@/shared/ui/permissions";

interface LeadsPageLayoutProps {
  title: string;
  description: string;
  isLoading: boolean;
  data: PaginatedResponse<Lead> | Lead[] | undefined;
  error: Error | null;
  loadingMessage?: string;
  emptyState: {
    title: string;
    description: string;
  };
  permissionCode: PermissionCode;
  table: ReactElement;
}

export function LeadsPageLayout({
  title,
  description,
  isLoading,
  data,
  error,
  loadingMessage = "Loading leads...",
  emptyState,
  permissionCode,
  table,
}: LeadsPageLayoutProps) {
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
            fallback={
              <AccessDeniedView message="You do not have permission to view leads." />
            }
            permissionCode={permissionCode}
          >
            <div className="cms-job-lead-list-table min-h-0 flex-1">
              {table}
            </div>
          </PermissionCodeGate>
        );
      }}
    </PageRenderer>
  );
}
