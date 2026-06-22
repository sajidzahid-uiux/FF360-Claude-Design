"use client";

import { ReactElement } from "react";

import { useDialogManager } from "@/hooks";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

interface BookKeepingPageLayoutProps {
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
  hasAccess: boolean;
  table: ReactElement;
  dialogManager: ReturnType<typeof useDialogManager>;
}

export function BookKeepingPageLayout({
  title,
  description,
  isLoading,
  data,
  error,
  loadingMessage = "Loading invoices...",
  emptyState,
  hasAccess,
  table,
  dialogManager,
}: BookKeepingPageLayoutProps) {
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
        if (!hasAccess) {
          return <AccessDeniedView />;
        }

        return (
          <>
            <div className="cms-job-lead-list-table min-h-0 flex-1">
              {table}
            </div>
            <DialogManager manager={dialogManager} />
          </>
        );
      }}
    </PageRenderer>
  );
}
