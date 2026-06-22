"use client";

import { useCallback, useMemo, useState } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type {
  PaymentStatus,
  ProjectType,
  ProjectTypeCategory,
  ProjectTypeCreatePayload,
  ProjectTypeUpdatePayload,
} from "@/api/types";
import { JobOrLeadType } from "@/constants";
import { useDialogManager, usePaymentStatusesSettings } from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import {
  useLeadStatusesSettings,
  useLeadTypesSettings,
  useOrganizationStatusesSettings,
} from "@/hooks/queries";
import useProjectTypesSettings from "@/hooks/useProjectTypesSettings";
import { APP_ROUTE_LABELS } from "@/shared/config/routes";
import { groupProjectTypesByCategory } from "@/shared/lib";
import { DialogManager, PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";
import {
  type JobStatusesByType,
  transformJobStatuses,
} from "@/utils/transformJobStatuses";

import {
  toJobStatusGridItem,
  toLeadStatusGridItem,
  toLeadTypeGridItem,
  toPaymentStatusGridItem,
  toProjectTypeGridItem,
} from "../lib/statusGridItems";
import { jobTypeTabToApiTypeChar } from "../lib/statusLabels";
import {
  JOB_TYPE_TAB_ITEMS,
  type JobTypeTab,
  PROJECT_TYPE_TAB_ITEMS,
  type ProjectTypeTab,
  type StatusManagementTab,
} from "../model/tabs";
import {
  type OrganizationStatusFormValues,
  type OrganizationStatusModalInitialData,
  type OrganizationStatusModalType,
  type ProjectTypeFormValues,
  type ProjectTypeModalState,
  type SettingsDeletableEntity,
  type SettingsDeleteOption,
  type StatusModalState,
  getSettingsEntityLabel,
} from "../model/types";
import { OrganizationStatusModal } from "./OrganizationStatusModal";
import { ProjectTypeModal } from "./ProjectTypeModal";
import { StatusAddCard } from "./StatusAddCard";
import { StatusGridCard } from "./StatusGridCard";
import { StatusManagementBreadcrumbToolbar } from "./StatusManagementBreadcrumbToolbar";
import { StatusSectionPanel } from "./StatusSectionPanel";

const STATUS_GRID_CLASS = "grid grid-cols-1 items-start gap-3 md:grid-cols-3";

export function StatusManagementPageContent() {
  const { read: canViewSettings, write: canEditSettings } =
    useRoutePermissions() || {};
  const dialogManager = useDialogManager();

  const [activeTab, setActiveTab] = useState<StatusManagementTab>("job-status");
  const [jobTypeTab, setJobTypeTab] = useState<JobTypeTab>("Repair");
  const [projectTypeTab, setProjectTypeTab] = useState<ProjectTypeTab>(
    JobOrLeadType.REPAIR
  );
  const [statusModal, setStatusModal] = useState<StatusModalState | null>(null);
  const [projectTypeModal, setProjectTypeModal] =
    useState<ProjectTypeModalState | null>(null);

  const {
    addLeadType,
    deleteLeadType,
    updateLeadType,
    data: leadTypes,
  } = useLeadTypesSettings();

  const {
    addStatus,
    deleteStatus,
    updateStatus,
    data: jobStatuses,
    isLoading,
    error,
  } = useOrganizationStatusesSettings({});

  const {
    addLeadStatus,
    deleteLeadStatus,
    updateLeadStatus,
    data: leadStatuses,
  } = useLeadStatusesSettings();

  const {
    addProjectType,
    deleteProjectType,
    updateProjectType,
    data: projectTypes,
  } = useProjectTypesSettings({});

  const {
    addPaymentStatus,
    deletePaymentStatus,
    updatePaymentStatus,
    data: paymentStatuses,
  } = usePaymentStatusesSettings();

  const jobStatusesByType = useMemo((): JobStatusesByType | null => {
    if (!jobStatuses) return null;
    return transformJobStatuses(jobStatuses);
  }, [jobStatuses]);

  const projectTypesByCategory = useMemo(
    () => groupProjectTypesByCategory(projectTypes),
    [projectTypes]
  );

  const categoryToolbarItems = useMemo(() => {
    if (activeTab === "job-status") {
      return [...JOB_TYPE_TAB_ITEMS];
    }
    if (activeTab === "project-type") {
      return [...PROJECT_TYPE_TAB_ITEMS];
    }
    return undefined;
  }, [activeTab]);

  const categoryToolbarValue =
    activeTab === "job-status"
      ? jobTypeTab
      : activeTab === "project-type"
        ? projectTypeTab
        : undefined;

  const handleCategoryToolbarChange = useCallback(
    (value: string) => {
      if (activeTab === "job-status") {
        setJobTypeTab(value as JobTypeTab);
      } else if (activeTab === "project-type") {
        setProjectTypeTab(value as ProjectTypeTab);
      }
    },
    [activeTab]
  );

  const openStatusModal = useCallback(
    (
      mode: "add" | "edit",
      type: OrganizationStatusModalType,
      initialData?: OrganizationStatusModalInitialData
    ) => {
      setStatusModal({ open: true, mode, type, initialData });
    },
    []
  );

  const handleDeleteClick = useCallback(
    (entity: SettingsDeletableEntity, option: SettingsDeleteOption) => {
      if (!canEditSettings) return;

      dialogManager.openConfirmationDialog({
        title:
          option === "projectType" ? "Delete project type" : "Delete status",
        confirmationType: "delete",
        itemTitle: getSettingsEntityLabel(entity),
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            if (option === "jobStatus") {
              await deleteStatus.mutateAsync(entity.id);
            } else if (option === "leadStatus") {
              await deleteLeadStatus.mutateAsync(entity.id);
            } else if (option === "leadType") {
              await deleteLeadType.mutateAsync(entity.id);
            } else if (option === "projectType") {
              await deleteProjectType.mutateAsync(entity.id);
            } else if (option === "paymentStatus") {
              await deletePaymentStatus.mutateAsync(entity.id);
            }
            toast.success("Deleted successfully");
            dialogManager.closeDialog();
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Failed to delete";
            toast.error(message);
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [
      canEditSettings,
      deleteLeadStatus,
      deleteLeadType,
      deletePaymentStatus,
      deleteProjectType,
      deleteStatus,
      dialogManager,
    ]
  );

  const openProjectTypeModal = useCallback(
    (
      mode: "add" | "edit",
      initialData?: ProjectTypeModalState["initialData"],
      defaultCategory?: ProjectTypeCategory
    ) => {
      setProjectTypeModal({ open: true, mode, initialData, defaultCategory });
    },
    []
  );

  const handleProjectTypeModalSubmit = useCallback(
    async (values: ProjectTypeFormValues) => {
      if (!projectTypeModal || !canEditSettings) return;

      const { mode } = projectTypeModal;

      try {
        if (mode === "add") {
          await addProjectType.mutateAsync({
            name: values.name,
            color: values.color,
            category: values.category,
          } as ProjectTypeCreatePayload);
        } else if (values.id != null) {
          await updateProjectType.mutateAsync({
            id: values.id,
            name: values.name,
            color: values.color,
            category: values.category,
          } as { id: number } & ProjectTypeUpdatePayload);
        }
        setProjectTypeModal(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save";
        toast.error(message);
      }
    },
    [addProjectType, canEditSettings, projectTypeModal, updateProjectType]
  );

  const handleStatusModalSubmit = useCallback(
    async (values: OrganizationStatusFormValues) => {
      if (!statusModal || !canEditSettings) return;

      const { mode, type, initialData } = statusModal;

      try {
        if (mode === "add") {
          if (type === "jobStatus") {
            await addStatus.mutateAsync({
              newStatus: {
                title: values.title,
                color: values.color,
                order: Number(values.number),
              },
              Type: jobTypeTabToApiTypeChar(initialData?.jobType ?? jobTypeTab),
            });
          } else if (type === "leadStatus") {
            await addLeadStatus.mutateAsync({
              title: values.title,
              color: values.color,
            });
          } else if (type === "leadType") {
            await addLeadType.mutateAsync({
              title: values.title,
              color: values.color,
            });
          } else if (type === "paymentStatus") {
            await addPaymentStatus.mutateAsync({
              title: values.title,
              color: values.color,
            });
          }
        } else if (values.id != null) {
          if (type === "jobStatus") {
            await updateStatus.mutateAsync({
              id: values.id,
              title: values.title,
              color: values.color,
              order: Number(values.number),
            });
          } else if (type === "leadStatus") {
            await updateLeadStatus.mutateAsync({
              id: values.id,
              title: values.title,
              color: values.color,
            });
          } else if (type === "leadType") {
            await updateLeadType.mutateAsync({
              id: values.id,
              title: values.title,
              color: values.color,
            });
          } else if (type === "paymentStatus") {
            await updatePaymentStatus.mutateAsync({
              id: values.id,
              title: values.title,
              color: values.color,
            });
          }
        }

        setStatusModal(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to save status";
        toast.error(message);
      }
    },
    [
      addLeadStatus,
      addLeadType,
      addPaymentStatus,
      addStatus,
      canEditSettings,
      jobTypeTab,
      statusModal,
      updateLeadStatus,
      updateLeadType,
      updatePaymentStatus,
      updateStatus,
    ]
  );

  const requireEdit = useCallback(
    (message: string) => {
      if (!canEditSettings) {
        toast.error(message);
        return false;
      }
      return true;
    },
    [canEditSettings]
  );

  const renderJobStatusSection = () => {
    const statuses = jobStatusesByType?.[jobTypeTab] ?? [];

    return (
      <StatusSectionPanel
        description="Configure and manage job statuses for each job type."
        footerNote={`Note: "New" is always the first status and "Completed" is always the last status.`}
        title="Job status management"
      >
        <div className={STATUS_GRID_CLASS}>
          {statuses.map((status) => (
            <StatusGridCard
              key={status.id}
              item={toJobStatusGridItem(status)}
              onDelete={() => handleDeleteClick(status, "jobStatus")}
              onEdit={() => {
                if (
                  !requireEdit("You don't have permission to edit statuses")
                ) {
                  return;
                }
                openStatusModal("edit", "jobStatus", {
                  id: status.id,
                  title: status.title,
                  color: status.color,
                  number: status.number,
                  editable: status.editable,
                  isDefault: status.is_default,
                  jobType: jobTypeTab,
                });
              }}
            />
          ))}
          {canEditSettings ? (
            <StatusAddCard
              label="Add status"
              onClick={() =>
                openStatusModal("add", "jobStatus", { jobType: jobTypeTab })
              }
            />
          ) : null}
        </div>
      </StatusSectionPanel>
    );
  };

  const renderLeadSettings = () => (
    <div className="flex flex-col gap-6">
      <StatusSectionPanel
        description="Configure and manage lead statuses for your organization."
        title="Lead status management"
      >
        <div className={STATUS_GRID_CLASS}>
          {(leadStatuses ?? []).map((status) => (
            <StatusGridCard
              key={status.id}
              item={toLeadStatusGridItem(status)}
              onDelete={() => handleDeleteClick(status, "leadStatus")}
              onEdit={() => {
                if (
                  !requireEdit("You don't have permission to edit statuses")
                ) {
                  return;
                }
                openStatusModal("edit", "leadStatus", {
                  id: status.id,
                  title: status.title,
                  color: status.color,
                  isDefault: status.is_default,
                });
              }}
            />
          ))}
          {canEditSettings ? (
            <StatusAddCard
              label="Add status"
              onClick={() => openStatusModal("add", "leadStatus")}
            />
          ) : null}
        </div>
      </StatusSectionPanel>

      <StatusSectionPanel
        description="Configure and manage lead sources for your organization."
        title="Lead source management"
      >
        <div className={STATUS_GRID_CLASS}>
          {(leadTypes ?? []).map((status) => (
            <StatusGridCard
              key={status.id}
              item={toLeadTypeGridItem(status)}
              onDelete={() => handleDeleteClick(status, "leadType")}
              onEdit={() => {
                if (
                  !requireEdit("You don't have permission to edit lead sources")
                ) {
                  return;
                }
                openStatusModal("edit", "leadType", {
                  id: status.id,
                  title: status.title,
                  color: status.color,
                  isDefault: status.is_default,
                });
              }}
            />
          ))}
          {canEditSettings ? (
            <StatusAddCard
              label="Add lead source"
              onClick={() => openStatusModal("add", "leadType")}
            />
          ) : null}
        </div>
      </StatusSectionPanel>
    </div>
  );

  const renderPaymentStatuses = () => (
    <StatusSectionPanel
      description="Configure and manage payment statuses for your organization."
      title="Payment status management"
    >
      <div className={STATUS_GRID_CLASS}>
        {(paymentStatuses ?? []).map((status: PaymentStatus) => (
          <StatusGridCard
            key={status.id}
            item={toPaymentStatusGridItem(status)}
            onDelete={() => handleDeleteClick(status, "paymentStatus")}
            onEdit={() => {
              if (
                !requireEdit(
                  "You don't have permission to edit payment statuses"
                )
              ) {
                return;
              }
              openStatusModal("edit", "paymentStatus", {
                id: status.id,
                title: status.title,
                color: status.color,
                isDefault: status.is_default,
              });
            }}
          />
        ))}
        {canEditSettings ? (
          <StatusAddCard
            label="Add status"
            onClick={() => openStatusModal("add", "paymentStatus")}
          />
        ) : null}
      </div>
    </StatusSectionPanel>
  );

  const renderProjectTypes = () => {
    const types = projectTypesByCategory[projectTypeTab] ?? [];

    return (
      <StatusSectionPanel
        description="Configure project types by job category."
        title="Project type management"
      >
        <div className={STATUS_GRID_CLASS}>
          {types.map((projectType: ProjectType) => (
            <StatusGridCard
              key={projectType.id}
              item={toProjectTypeGridItem(projectType)}
              onDelete={() => handleDeleteClick(projectType, "projectType")}
              onEdit={() => {
                if (
                  !requireEdit(
                    "You don't have permission to edit project types"
                  )
                ) {
                  return;
                }
                openProjectTypeModal("edit", {
                  id: projectType.id,
                  name: projectType.name,
                  color: projectType.color,
                  category: projectType.category,
                  is_default: projectType.is_default,
                });
              }}
            />
          ))}
          {canEditSettings ? (
            <StatusAddCard
              label="Add project type"
              onClick={() =>
                openProjectTypeModal("add", undefined, projectTypeTab)
              }
            />
          ) : null}
        </div>
      </StatusSectionPanel>
    );
  };

  if (!jobStatusesByType && !isLoading) {
    return null;
  }

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={jobStatusesByType ? Object.values(jobStatusesByType).flat() : []}
      description="Configure statuses and project types for your organization."
      emptyState={{
        title: "No settings data",
        description: "Settings information will appear here.",
      }}
      error={
        error ? new Error(error.message || "Failed to load statuses") : null
      }
      isLoading={isLoading}
      loadingMessage="Loading settings..."
      title={APP_ROUTE_LABELS.statusManagement}
    >
      {() => {
        if (!canViewSettings) {
          return <AccessDeniedView />;
        }

        return (
          <div className="flex flex-col gap-6">
            <StatusManagementBreadcrumbToolbar
              activeTab={activeTab}
              categoryItems={categoryToolbarItems}
              categoryTab={categoryToolbarValue}
              onCategoryTabChange={handleCategoryToolbarChange}
              onTabChange={setActiveTab}
            />

            {isLoading ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader
                  size={ComponentSizeEnum.MD}
                  text="Loading settings..."
                />
              </div>
            ) : (
              <>
                {activeTab === "job-status" && renderJobStatusSection()}
                {activeTab === "lead-settings" && renderLeadSettings()}
                {activeTab === "payment-status" && renderPaymentStatuses()}
                {activeTab === "project-type" && renderProjectTypes()}
              </>
            )}

            <DialogManager manager={dialogManager} />

            {statusModal ? (
              <OrganizationStatusModal
                canEdit={canEditSettings}
                initialData={statusModal.initialData}
                mode={statusModal.mode}
                open={statusModal.open}
                type={statusModal.type}
                onOpenChange={(open) => {
                  if (!open) setStatusModal(null);
                }}
                onSubmit={handleStatusModalSubmit}
              />
            ) : null}

            {projectTypeModal ? (
              <ProjectTypeModal
                canEdit={canEditSettings}
                defaultCategory={projectTypeModal.defaultCategory}
                initialData={projectTypeModal.initialData}
                isSubmitting={
                  addProjectType.isPending || updateProjectType.isPending
                }
                mode={projectTypeModal.mode}
                open={projectTypeModal.open}
                onOpenChange={(open) => {
                  if (!open) setProjectTypeModal(null);
                }}
                onSubmit={handleProjectTypeModalSubmit}
              />
            ) : null}
          </div>
        );
      }}
    </PageRenderer>
  );
}

export default StatusManagementPageContent;
