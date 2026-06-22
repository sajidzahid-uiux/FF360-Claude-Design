"use client";

import { ReactElement } from "react";

import { useDialogManager } from "@/hooks";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

interface OrderPipePageLayoutProps {
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
  dialogManager?: ReturnType<typeof useDialogManager>;
}

export function OrderPipePageLayout({
  title,
  description,
  isLoading,
  data,
  error,
  loadingMessage = "Loading orders...",
  emptyState,
  canViewPage,
  table,
  dialogManager,
}: OrderPipePageLayoutProps) {
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
        if (!canViewPage) {
          return <AccessDeniedView />;
        }

        return (
          <>
            <div className="cms-job-lead-list-table min-h-0 flex-1">
              {table}
            </div>
            {dialogManager && <DialogManager manager={dialogManager} />}
          </>
        );
      }}
    </PageRenderer>
  );
}
