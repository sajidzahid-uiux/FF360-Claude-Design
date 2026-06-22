"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import type { QuickActionUpdatePayload } from "@/api/types";
import {
  QuickActionConvertModals,
  QuickActionDetailView,
  getQuickActionDisplayTitle,
} from "@/features/quick-actions";
import { useQuickActionConvertFlow } from "@/features/quick-actions/hooks/useQuickActionConvertFlow";
import { useRouteIds } from "@/hooks";
import {
  useDeleteQuickActionFile,
  useUpdateQuickAction,
  useUploadQuickActionFile,
} from "@/hooks/mutations";
import { useIsAdmin, useQuickAction } from "@/hooks/queries";
import { APP_ROUTES, orgPath } from "@/shared/config/routes";
import { ErrorState } from "@/shared/ui/common";
import { useCmsBreadcrumbLabel } from "@/shared/ui/layout/cmsBreadcrumbOverrides";

export default function QuickActionDetailPage() {
  const params = useParams();
  const { orgId: organizationId } = useRouteIds();
  const router = useRouter();
  const id = typeof params.id === "string" ? parseInt(params.id, 10) : NaN;
  const quickActionId = Number.isNaN(id) ? undefined : id;
  const isAdmin = useIsAdmin();
  const {
    data: quickAction,
    isLoading,
    error,
  } = useQuickAction(quickActionId, true);
  const updateMutation = useUpdateQuickAction();
  const uploadFileMutation = useUploadQuickActionFile(quickActionId);
  const deleteFileMutation = useDeleteQuickActionFile(quickActionId);

  const convertFlow = useQuickActionConvertFlow(quickActionId, quickAction);

  const breadcrumbTitle = useMemo(
    () => (quickAction ? getQuickActionDisplayTitle(quickAction) : undefined),
    [quickAction]
  );

  useCmsBreadcrumbLabel(breadcrumbTitle);

  const handleBack = useCallback(() => {
    if (!organizationId) {
      return;
    }
    router.push(orgPath(organizationId, APP_ROUTES.quickActions));
  }, [organizationId, router]);

  const handleSaveInline = useCallback(
    (payload: QuickActionUpdatePayload) => {
      if (quickActionId == null || !quickAction) return;
      updateMutation.mutate({ id: quickAction.id, payload });
    },
    [quickActionId, quickAction, updateMutation]
  );

  const handleUploadFile = useCallback(
    (file: File) => {
      uploadFileMutation.mutate({ file, title: `other_file_${file.name}` });
    },
    [uploadFileMutation]
  );

  const handleDeleteFile = useCallback(
    (fileId: number) => {
      deleteFileMutation.mutate(fileId);
    },
    [deleteFileMutation]
  );

  if (!organizationId) {
    return (
      <ErrorState
        action={{
          label: "Go to Home",
          onClick: () => router.push("/"),
        }}
        error={new Error("Organization ID is missing")}
      />
    );
  }

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.MD}
        text="Loading quick action..."
      />
    );
  }

  if (error || !quickAction || Number.isNaN(id)) {
    return (
      <ErrorState
        action={{
          label: "Back to Quick Actions",
          onClick: handleBack,
        }}
        error={error ?? new Error("Quick action not found or failed to load.")}
      />
    );
  }

  return (
    <>
      <QuickActionDetailView
        canManage={isAdmin}
        isSaving={updateMutation.isPending}
        isUploading={uploadFileMutation.isPending}
        quickAction={quickAction}
        onBack={handleBack}
        onConvertContact={convertFlow.openContact}
        onConvertJob={convertFlow.openJob}
        onConvertLead={convertFlow.openLead}
        onDeleteFile={isAdmin ? handleDeleteFile : undefined}
        onSave={isAdmin ? handleSaveInline : undefined}
        onUploadFile={isAdmin ? handleUploadFile : undefined}
      />

      {isAdmin ? (
        <QuickActionConvertModals
          flow={convertFlow}
          quickAction={quickAction}
        />
      ) : null}
    </>
  );
}
