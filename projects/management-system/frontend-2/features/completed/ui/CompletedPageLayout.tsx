"use client";

import { ReactElement } from "react";

import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

interface CompletedPageLayoutProps {
  title: string;
  description: string;
  isLoading: boolean;
  data: unknown[] | { results: unknown[] } | null | undefined;
  error: Error | null;
  loadingMessage?: string;
  emptyState: {
    title: string;
    description: string;
  };
  canViewPage: boolean;
  table: ReactElement;
}

export function CompletedPageLayout({
  title,
  description,
  isLoading,
  data,
  error,
  loadingMessage = "Loading completed jobs...",
  emptyState,
  canViewPage,
  table,
}: CompletedPageLayoutProps) {
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
        if (canViewPage === false) {
          return (
            <AccessDeniedView message="You do not have permission to view completed jobs." />
          );
        }

        return (
          <div className="cms-job-lead-list-table min-h-0 flex-1">{table}</div>
        );
      }}
    </PageRenderer>
  );
}
