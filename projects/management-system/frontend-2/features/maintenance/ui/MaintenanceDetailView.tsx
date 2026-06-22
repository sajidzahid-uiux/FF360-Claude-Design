"use client";

import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  SearchableDropdown,
  type SearchableDropdownOption,
} from "@fieldflow360/org-ui";
import { Wrench } from "lucide-react";
import { toast } from "sonner";

import type { RecordEquipment } from "@/api/types";
import type {
  EnrichedMaintenanceItem,
  MaintenanceWorkItem,
} from "@/features/maintenance";
import { useAssigneeDropdownItems } from "@/features/team/hooks";
import {
  useDialogManager,
  useEquipmentComments,
  useMaintenanceData,
  useMaintenanceItems,
  useRecordEquipment,
  useTeamData,
} from "@/hooks";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import type { DropdownItem } from "@/shared/ui/common";
import {
  DetailFormSection,
  DetailReadOnlyField,
  DetailViewPage,
  DialogManager,
  Dropdown,
  Notes,
} from "@/shared/ui/common";
import { Badge } from "@/shared/ui/primitives";
import { buildRowActions } from "@/utils/actions";
import { getErrorMessage } from "@/utils/apiError";
import { formatMaintenanceTitle } from "@/utils/formatMaintenanceTitle";

export interface MaintenanceDetailViewProps {
  maintenance: EnrichedMaintenanceItem;
  onBack: () => void;
}

function isSelectableAssigneeDropdownItem(item: DropdownItem): item is {
  id: string;
  label: React.ReactNode;
  disabled?: boolean;
} {
  return item.type !== "separator" && item.type !== "header";
}

function MaintenanceWorkItemCard({
  item,
  completed,
  isLoading,
  canComplete,
  onToggle,
}: {
  item: MaintenanceWorkItem;
  completed: boolean;
  isLoading: boolean;
  canComplete: boolean;
  onToggle: (item: MaintenanceWorkItem) => void;
}) {
  const displayTitle = formatMaintenanceTitle(item.title ?? "");

  return (
    <div className="border-border-subtle bg-bg-surface flex flex-col gap-2 rounded-lg border p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Wrench
          aria-hidden
          className="text-text-muted h-4 w-4"
          strokeWidth={2}
        />
        <span className="font-semibold">{displayTitle}</span>
        {completed ? (
          <Badge
            className="ml-auto w-[100px] border border-green-500 bg-green-50 text-xs text-green-600 sm:w-auto sm:text-sm"
            variant="outline"
          >
            Fixed
          </Badge>
        ) : (
          <Badge
            className="ml-auto w-[100px] text-[10px] sm:w-auto sm:text-sm"
            variant="destructive"
          >
            Needs Maintenance
          </Badge>
        )}
      </div>
      <div className="text-text-muted mb-1 flex justify-between text-xs">
        <span>Over Due Date:</span>
        <span>{new Date(item.created_at).toLocaleString()}</span>
      </div>
      <div className="text-text-muted mb-1 flex justify-between text-xs">
        <span>Fixed:</span>
        <span>{completed ? "Yes" : "No"}</span>
      </div>
      <Button
        aria-label={
          isLoading
            ? completed
              ? "Uncompleting..."
              : "Completing..."
            : completed
              ? "Mark as not completed"
              : "Mark as completed"
        }
        disabled={isLoading || !canComplete}
        loading={isLoading}
        title={
          isLoading
            ? completed
              ? "Uncompleting..."
              : "Completing..."
            : completed
              ? "Mark as not completed"
              : "Mark as completed"
        }
        variant={completed ? ButtonVariantEnum.SURFACE : undefined}
        onClick={() => onToggle(item)}
      />
    </div>
  );
}

export function MaintenanceDetailView({
  maintenance: job,
  onBack,
}: MaintenanceDetailViewProps) {
  const userRole = useDataFromStorageByKey(StorageKey.USER_ROLE);
  const memberIdStr = useDataFromStorageByKey(StorageKey.MEMBER_ID);
  const memberId = memberIdStr ? Number.parseInt(memberIdStr, 10) : null;
  const permissionCodes = useDataFromStorageByKey(StorageKey.PERM_CODES) || [];
  const isAdmin = userRole?.is_admin === true;
  const hasEquipmentReadPermission = permissionCodes.includes("equipment_read");
  const hasEquipmentWritePermission =
    permissionCodes.includes("equipment_write");
  const isAssignedMember = memberId === job.assigned_to?.[0];
  const canComplete = isAssignedMember || isAdmin;
  const canDelete = isAdmin;
  const canViewNotes =
    (isAssignedMember && hasEquipmentReadPermission) || isAdmin;
  const canEditNotes =
    (isAssignedMember && hasEquipmentWritePermission) || isAdmin;

  const {
    data: comments,
    postComment,
    patchComment,
    deleteComment,
  } = useEquipmentComments(canViewNotes ? job.equipment : undefined);
  const { updateMaintenance, completeMaintenance, deleteMaintenance } =
    useMaintenanceData();
  const { patchMaintenanceItem } = useMaintenanceItems();
  const [contacting, setContacting] = useState(false);
  const [contacted, setContacted] = useState(
    Boolean(job.service_contacted || job.maintenance_contacted)
  );
  const [itemLoading, setItemLoading] = useState<Record<number, boolean>>({});
  const [itemCompleted, setItemCompleted] = useState<Record<number, boolean>>(
    () =>
      Object.fromEntries(
        (job.items ?? []).map((item) => [item.id, item.completed])
      )
  );
  const [completeLoading, setCompleteLoading] = useState(false);
  const dialogManager = useDialogManager();

  const { data: equipment } = useRecordEquipment({ paginate: false }) as {
    data: RecordEquipment[] | undefined;
  };
  const { data: team } = useTeamData();

  const equipmentName =
    job.equipment_name ||
    equipment?.find((item) => item.id === job.equipment)?.name ||
    "Unknown Equipment";

  const rawAssignedId = job.assigned_to?.[0];
  const assignedMemberId =
    rawAssignedId == null ? undefined : Number(rawAssignedId);

  const assigneeDropdownItems = useAssigneeDropdownItems(
    team,
    assignedMemberId,
    { includeNone: false }
  );

  const assigneeSearchableOptions = useMemo(
    (): SearchableDropdownOption<string>[] =>
      assigneeDropdownItems
        .filter(isSelectableAssigneeDropdownItem)
        .filter((item) => !item.disabled)
        .map((item) => ({
          value: item.id,
          label: String(item.label),
        })),
    [assigneeDropdownItems]
  );

  const assignedLabel = useMemo(() => {
    const match = assigneeDropdownItems
      .filter(isSelectableAssigneeDropdownItem)
      .find((item) => item.id === String(assignedMemberId));
    return match ? String(match.label) : "Unassigned";
  }, [assigneeDropdownItems, assignedMemberId]);

  const allCompleted = (job.items ?? []).every(
    (item) => itemCompleted[item.id]
  );

  const handleContactMaintenance = async () => {
    setContacting(true);
    try {
      await updateMaintenance.mutateAsync({
        id: String(job.id),
        updatedMaintenance: {
          service_contacted: !contacted,
          equipment: job.equipment,
        },
      });
      setContacted(!contacted);
    } catch (error) {
      console.error(error);
      // Optionally show error
    } finally {
      setContacting(false);
    }
  };

  const handleToggleCompleted = useCallback(
    async (item: MaintenanceWorkItem) => {
      setItemLoading((prev) => ({ ...prev, [item.id]: true }));
      try {
        const newCompleted = !itemCompleted[item.id];
        await patchMaintenanceItem.mutateAsync({
          id: String(item.id),
          updatedMaintenance: { completed: newCompleted },
        });
        setItemCompleted((prev) => ({ ...prev, [item.id]: newCompleted }));
      } catch (error) {
        console.error(error);
        // Optionally show error
      } finally {
        setItemLoading((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [itemCompleted, patchMaintenanceItem]
  );

  const handleCompleteMaintenance = async () => {
    setCompleteLoading(true);
    try {
      await completeMaintenance.mutateAsync(String(job.id));
      onBack();
    } catch (error) {
      console.error(error);
      // Optionally show error
    } finally {
      setCompleteLoading(false);
    }
  };

  const handleUserChange = useCallback(
    async (userId: string) => {
      try {
        await updateMaintenance.mutateAsync({
          id: String(job.id),
          updatedMaintenance: {
            assigned_to: [Number.parseInt(userId, 10)],
            equipment: job.equipment,
          },
        });
      } catch (error) {
        console.error(error);
        // Optionally show error
      }
    },
    [job.equipment, job.id, updateMaintenance]
  );

  const headerActions = useMemo(() => {
    if (!canDelete) return null;

    const items = buildRowActions({
      canView: false,
      canEdit: false,
      canDelete: true,
      canTrack: false,
      canArchive: false,
      isArchived: false,
      onView: () => {},
      onDelete: () => {
        const itemTitle = equipmentName || String(job.id);
        dialogManager.openConfirmationDialog({
          title: "Delete Maintenance Job",
          confirmationType: "delete",
          itemTitle,
          variant: "destructive",
          confirmButtonText: "Delete",
          onConfirm: async () => {
            try {
              await deleteMaintenance.mutateAsync(String(job.id));
              toast.success("Maintenance job deleted successfully");
              onBack();
              dialogManager.closeDialog();
            } catch (error: unknown) {
              toast.error(
                getErrorMessage(error, "Failed to delete maintenance job")
              );
              dialogManager.setConfirmationProcessing(false);
              throw error;
            }
          },
        });
      },
    });

    return <Dropdown items={items} />;
  }, [
    canDelete,
    deleteMaintenance,
    dialogManager,
    equipmentName,
    job.id,
    onBack,
  ]);

  return (
    <DetailViewPage
      actions={headerActions}
      backLabel="Back to maintenance"
      className="flex-1"
      footer={<DialogManager manager={dialogManager} />}
      meta={
        <>
          <span
            className={
              contacted
                ? "text-sm font-semibold text-green-600 dark:text-green-400"
                : "text-sm font-semibold text-red-500 dark:text-red-400"
            }
          >
            {contacted ? "Maintenance contacted" : "Not contacted"}
          </span>
          {job.serial_number ? (
            <p className="text-text-muted text-sm">
              Serial: {job.serial_number}
            </p>
          ) : null}
        </>
      }
      subtitle={equipmentName}
      onBack={onBack}
    >
      <DetailFormSection
        description="Equipment assignment and maintenance workflow actions."
        title="Overview"
      >
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <DetailReadOnlyField label="Equipment" value={equipmentName} />
          <DetailReadOnlyField
            label="Serial number"
            value={job.serial_number ?? ""}
          />
          <div className="min-w-0 sm:col-span-2">
            <DetailReadOnlyField
              preserveLineBreaks
              label="Description"
              value={job.description ?? ""}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-end sm:gap-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-text-muted text-xs font-medium">Assigned to</p>
              {isAdmin ? (
                <SearchableDropdown
                  fullWidth
                  emptyStateText="No members found."
                  options={assigneeSearchableOptions}
                  searchPlaceholder="Search members..."
                  value={
                    assignedMemberId != null
                      ? String(assignedMemberId)
                      : undefined
                  }
                  onChange={handleUserChange}
                />
              ) : (
                <p className="text-text-primary text-sm">{assignedLabel}</p>
              )}
            </div>
            <Button
              aria-label={
                contacted
                  ? "Maintenance Contacted"
                  : contacting
                    ? "Contacting..."
                    : "Contact Maintenance"
              }
              disabled={!canComplete}
              loading={contacting}
              title={
                contacted
                  ? "Maintenance Contacted"
                  : contacting
                    ? "Contacting..."
                    : "Contact Maintenance"
              }
              variant={
                contacted
                  ? ButtonVariantEnum.SURFACE
                  : ButtonVariantEnum.DEFAULT
              }
              onClick={handleContactMaintenance}
            />
          </div>
        </div>

        {allCompleted ? (
          <Button
            aria-label={
              completeLoading
                ? "Completing..."
                : "Mark Maintenance as Completed"
            }
            className="w-full sm:w-auto"
            disabled={!canComplete}
            loading={completeLoading}
            title={
              completeLoading
                ? "Completing..."
                : "Mark Maintenance as Completed"
            }
            onClick={handleCompleteMaintenance}
          />
        ) : null}
      </DetailFormSection>

      <DetailFormSection
        description="Open issues reported for this maintenance job."
        title="Maintenance required"
      >
        {(job.items ?? []).length === 0 ? (
          <p className="text-text-muted text-sm">No maintenance items.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(job.items ?? []).map((item) => (
              <MaintenanceWorkItemCard
                key={item.id}
                canComplete={canComplete}
                completed={Boolean(itemCompleted[item.id])}
                isLoading={Boolean(itemLoading[item.id])}
                item={item}
                onToggle={handleToggleCompleted}
              />
            ))}
          </div>
        )}
      </DetailFormSection>

      {canViewNotes ? (
        <DetailFormSection
          description="Team notes and updates for this maintenance job."
          title="Notes & comments"
        >
          <Notes
            embedded
            comments={comments || []}
            deleteComment={(id) =>
              deleteComment?.mutateAsync
                ? deleteComment.mutateAsync({ comment_id: id }).then(() => id)
                : Promise.resolve(id)
            }
            patchComment={(id, payload) =>
              patchComment?.mutateAsync
                ? patchComment.mutateAsync({ comment_id: id, ...payload })
                : Promise.reject(new Error("Unable to update comment"))
            }
            postComment={async (payload) => postComment.mutateAsync(payload)}
            readOnly={!canEditNotes}
            showTitle={false}
          />
        </DetailFormSection>
      ) : null}
    </DetailViewPage>
  );
}
