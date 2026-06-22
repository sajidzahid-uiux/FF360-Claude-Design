"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AppFormModal,
  Button,
  ButtonVariantEnum,
  Input,
  SearchableDropdown,
  type SearchableDropdownOption,
} from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { JobType, coerceJobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import {
  getEquipmentTypeLabel,
  isMachineType,
  isVehicleType,
} from "@/features/equipment";
import type {
  JobEquipmentAssignmentMode,
  JobEquipmentAssignmentRecord,
  JobEquipmentHoursState,
  JobEquipmentOption,
} from "@/features/jobs";
import {
  JobEquipmentTruncatedName,
  getJobEquipmentPermissionCodes,
  getMaintenanceFilters,
  getMaintenanceStatus,
  invalidateJobEquipmentQueries,
  recordEquipmentToJobEquipmentOptions,
  useJobEquipmentMaintenanceCheck,
} from "@/features/jobs";
import {
  getDistanceLabel,
  useDialogManager,
  useIsMobile,
  useJobEquipment,
  useUnitSystem,
} from "@/hooks";
import { usePatchJob } from "@/hooks/mutations";
import {
  useJobPermissions,
  useJobProgressPermissions,
} from "@/hooks/permissions";
import { useRecordEquipment } from "@/hooks/useRecordData";
import { DialogManager } from "@/shared/ui/common";
import { PermissionCodeGate } from "@/shared/ui/permissions";
import { getErrorMessage } from "@/utils/apiError";
import {
  formatDueSoonText,
  formatMaintenanceTitle,
} from "@/utils/formatMaintenanceTitle";

export interface JobEquipmentAssignmentProps {
  jobId: number;
  jobType: JobType;
  assignments: JobEquipmentAssignmentRecord[];
  disabled?: boolean;
  farmerJob?: boolean;
  /** `manage` — production tracking (assign/remove). `track` — on-site hours + maintenance. */
  mode?: JobEquipmentAssignmentMode;
  hideMaintenance?: boolean;
  /** Parent renders `DetailFormSection`; omit duplicate headings. */
  embedded?: boolean;
}

function equipmentLabel(option: JobEquipmentOption): string {
  return option.serial_number
    ? `${option.machine_name} - ${option.serial_number}`
    : option.machine_name;
}

export function JobEquipmentAssignment({
  jobId,
  jobType,
  assignments,
  disabled = false,
  farmerJob = false,
  mode = "track",
  hideMaintenance = false,
  embedded = false,
}: JobEquipmentAssignmentProps) {
  const queryClient = useQueryClient();
  const dialogManager = useDialogManager();
  const patchJob = usePatchJob();
  const { updateJobEquipment } = useJobEquipment();
  const isMobile = useIsMobile();
  const unitSystem = useUnitSystem();
  const distanceLabel = getDistanceLabel(unitSystem);
  const recordJobType = coerceJobLeadTypeSegment(jobType);
  const permissionCodes = getJobEquipmentPermissionCodes(jobType);
  const isManageMode = mode === "manage";

  const { data: recordEquipmentData, refetch: refetchEquipment } =
    useRecordEquipment({
      resourceType: ResourceType.JOB,
      jobType: recordJobType,
    });

  const equipmentOptions = useMemo(
    () => recordEquipmentToJobEquipmentOptions(recordEquipmentData),
    [recordEquipmentData]
  );

  const { maintenanceCheck, refetchMaintenance } =
    useJobEquipmentMaintenanceCheck(jobId, jobType, farmerJob);

  const { canUpdateEquipmentHours } = useJobProgressPermissions(jobId, jobType);
  const {
    canRead,
    canEdit,
    isLoading: permissionsLoading,
  } = useJobPermissions(jobType);

  const selectedEquipmentRef = useRef<number[]>([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const [hoursData, setHoursData] = useState<
    Record<number, JobEquipmentHoursState>
  >({});

  const previousDataRef = useRef<string>("");
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!assignments.length && !equipmentOptions) return;

    const existingIds = assignments.map((item) => item.equipment);
    const dataKey = JSON.stringify([...existingIds].sort());

    if (
      isInitialMount.current ||
      (!assignModalOpen && previousDataRef.current !== dataKey)
    ) {
      if (isInitialMount.current) isInitialMount.current = false;
      previousDataRef.current = dataKey;
      selectedEquipmentRef.current = existingIds;
      if (isManageMode) setSelectedEquipment(existingIds);

      const initialHours: Record<number, JobEquipmentHoursState> = {};
      for (const item of assignments) {
        const equipment = equipmentOptions?.find(
          (e) => e.id === item.equipment
        );
        if (equipment && isMachineType(equipment.equipment_type)) {
          const current = equipment.current_hours ?? 0;
          initialHours[item.id] = { start: current, end: current };
        }
      }
      setHoursData(initialHours);
    }
  }, [assignments, equipmentOptions, assignModalOpen, isManageMode]);

  useEffect(() => {
    if (!jobId) return;
    void invalidateJobEquipmentQueries(queryClient, jobId, jobType);
    void refetchEquipment();
  }, [jobId, jobType, queryClient, refetchEquipment]);

  const assignedEquipment = useMemo(
    () =>
      equipmentOptions?.filter((equipment) =>
        assignments.some((row) => row.equipment === equipment.id)
      ) ?? [],
    [assignments, equipmentOptions]
  );

  const dropdownOptions = useMemo((): SearchableDropdownOption<string>[] => {
    return (equipmentOptions ?? []).map((eq) => ({
      value: String(eq.id),
      label: equipmentLabel(eq),
    }));
  }, [equipmentOptions]);

  const syncAfterMutation = useCallback(async () => {
    await invalidateJobEquipmentQueries(queryClient, jobId, jobType);
    await refetchEquipment();
    await refetchMaintenance();
  }, [jobId, jobType, queryClient, refetchEquipment, refetchMaintenance]);

  const handleAssignEquipment = async () => {
    if (selectedEquipmentRef.current.length === 0) {
      toast.error("Select at least one piece of equipment");
      return;
    }

    try {
      await patchJob.mutateAsync({
        id: jobId,
        updatedJob: {
          equipments: selectedEquipmentRef.current.map((id) => ({
            equipment: id,
          })),
        },
        jobType,
      });
      toast.success("Equipment updated");
      setAssignModalOpen(false);
      await syncAfterMutation();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update equipment"));
    }
  };

  const handleRemoveEquipment = useCallback(
    (equipment: JobEquipmentOption) => {
      dialogManager.openConfirmationDialog({
        title: "Remove equipment",
        confirmationType: "delete",
        itemTitle: equipment.machine_name,
        variant: "destructive",
        onConfirm: async () => {
          const updated = selectedEquipmentRef.current.filter(
            (id) => id !== equipment.id
          );
          selectedEquipmentRef.current = updated;
          await patchJob.mutateAsync({
            id: jobId,
            updatedJob: {
              equipments: updated.map((id) => ({ equipment: id })),
            },
            jobType,
          });
          setSelectedEquipment(updated);
          toast.success("Equipment removed");
          await syncAfterMutation();
        },
      });
    },
    [dialogManager, jobId, jobType, patchJob, syncAfterMutation]
  );

  const handleHoursUpdate = async (
    jobEquipmentId: number,
    equipmentId: number
  ) => {
    const hours = hoursData[jobEquipmentId];
    if (!hours) return;

    try {
      await updateJobEquipment.mutateAsync({
        equipmentId: String(jobEquipmentId),
        jobEquipmentData: {
          start: hours.start,
          end: hours.end,
          equipment: equipmentId,
        },
      });
      setHoursData((prev) => ({
        ...prev,
        [jobEquipmentId]: { start: hours.end, end: hours.end },
      }));
      toast.success("Hours updated");
      await syncAfterMutation();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update hours"));
    }
  };

  const toggleEquipmentSelection = (id: number) => {
    setSelectedEquipment((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((entry) => entry !== id)
        : [...prev, id];
      selectedEquipmentRef.current = updated;
      return updated;
    });
  };

  const renderTrackItem = (equipment: JobEquipmentOption) => {
    const jobEquipment = assignments.find(
      (item) => item.equipment === equipment.id
    );
    if (!jobEquipment) return null;

    const hours = hoursData[jobEquipment.id] ?? {
      start: equipment.current_hours ?? 0,
      end: equipment.current_hours ?? 0,
    };
    const isMachine = isMachineType(equipment.equipment_type);
    const isVehicle = isVehicleType(equipment.equipment_type);
    const filters = getMaintenanceFilters(
      equipment.machine_name,
      maintenanceCheck
    );

    return (
      <div
        key={equipment.id}
        className="border-border-subtle bg-bg-app rounded-lg border p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-text-primary text-sm font-semibold">
                <JobEquipmentTruncatedName
                  machineName={equipment.machine_name}
                  serialNumber={equipment.serial_number}
                />
              </span>
              <span className="bg-bg-surface text-text-muted rounded-md px-2 py-0.5 text-xs">
                {getEquipmentTypeLabel(equipment.equipment_type)}
              </span>
              {filters.overdue.map((filter) => (
                <span
                  key={`overdue-${filter}`}
                  className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                >
                  {formatMaintenanceTitle(filter)}
                </span>
              ))}
              {filters.dueSoon.map(({ filter, hoursLeft }) => {
                const suffix =
                  hoursLeft != null
                    ? formatDueSoonText(
                        hoursLeft,
                        isVehicle,
                        unitSystem,
                        distanceLabel
                      )
                    : null;
                return (
                  <span
                    key={`due-${filter}`}
                    className="rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                  >
                    {formatMaintenanceTitle(filter)}
                    {suffix ? ` ${suffix}` : null}
                  </span>
                );
              })}
            </div>
            {isMachine ? (
              <span className="bg-accent/15 text-accent inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                {jobEquipment.total_hours.toFixed(2)} hrs logged
              </span>
            ) : null}
          </div>
        </div>

        {isMachine && canUpdateEquipmentHours ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                disabled={disabled}
                label="Start hours"
                min={0}
                step="0.01"
                type="number"
                value={String(hours.start)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (Number.isNaN(value)) return;
                  setHoursData((prev) => ({
                    ...prev,
                    [jobEquipment.id]: {
                      ...(prev[jobEquipment.id] ?? hours),
                      start: value,
                    },
                  }));
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <Input
                disabled={disabled}
                label="End hours"
                min={0}
                step="0.01"
                type="number"
                value={String(hours.end)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (Number.isNaN(value)) return;
                  setHoursData((prev) => ({
                    ...prev,
                    [jobEquipment.id]: {
                      ...(prev[jobEquipment.id] ?? hours),
                      end: value,
                    },
                  }));
                }}
              />
            </div>
            <Button
              aria-label="Update hours"
              disabled={disabled}
              title="Update hours"
              onClick={() => handleHoursUpdate(jobEquipment.id, equipment.id)}
            />
          </div>
        ) : null}
      </div>
    );
  };

  const renderManageItem = (equipment: JobEquipmentOption) => {
    const jobEquipment = assignments.find(
      (item) => item.equipment === equipment.id
    );
    if (!jobEquipment) return null;

    return (
      <div
        key={equipment.id}
        className="border-border-subtle bg-bg-app rounded-lg border p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <span className="text-text-primary text-sm font-semibold">
              <JobEquipmentTruncatedName machineName={equipment.machine_name} />
            </span>
            <span className="bg-bg-surface text-text-muted inline-flex rounded-md px-2 py-0.5 text-xs">
              {getEquipmentTypeLabel(equipment.equipment_type)}
            </span>
            {isMachineType(equipment.equipment_type) ? (
              <span className="bg-accent/15 text-accent inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                {jobEquipment.total_hours.toFixed(2)} hrs
              </span>
            ) : null}
          </div>
          <PermissionCodeGate permissionCode={permissionCodes.delete}>
            <Button
              aria-label={`Remove ${equipment.machine_name}`}
              disabled={disabled}
              leftIcon={<Trash2 aria-hidden className="h-4 w-4" />}
              variant={ButtonVariantEnum.DELETE}
              onClick={() => handleRemoveEquipment(equipment)}
            />
          </PermissionCodeGate>
        </div>
      </div>
    );
  };

  const listContent = permissionsLoading ? (
    <p className="text-text-muted py-8 text-center text-sm">
      Loading permissions…
    </p>
  ) : !canRead ? (
    <p className="text-text-muted py-8 text-center text-sm">
      You do not have permission to view equipment on this job.
    </p>
  ) : assignedEquipment.length === 0 ? (
    <>
      <p className="text-text-muted py-8 text-center text-sm">
        No equipment assigned yet.
      </p>
      {canEdit && isManageMode ? (
        <p className="text-text-muted mt-1 text-center text-sm">
          Use Update equipment to assign machines.
        </p>
      ) : null}
    </>
  ) : (
    <div
      className={
        isManageMode
          ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          : "flex flex-col gap-4"
      }
    >
      {assignedEquipment.map((equipment) =>
        isManageMode ? renderManageItem(equipment) : renderTrackItem(equipment)
      )}
    </div>
  );

  const assignAction = isManageMode ? (
    <PermissionCodeGate permissionCode={permissionCodes.write}>
      <Button
        disabled={disabled}
        leftIcon={<PlusCircle aria-hidden className="h-4 w-4" />}
        title="Update equipment"
        onClick={() => {
          setSelectedEquipment([...selectedEquipmentRef.current]);
          setAssignModalOpen(true);
        }}
      />
    </PermissionCodeGate>
  ) : null;

  const sectionShellClass = embedded
    ? "space-y-4"
    : "border-border-subtle bg-bg-surface-elevated space-y-4 rounded-xl border p-4 sm:p-5";

  return (
    <>
      <DialogManager manager={dialogManager} />

      <div className={sectionShellClass}>
        {!embedded ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-text-primary text-base font-semibold">
              Equipment assignment
            </h2>
            {assignAction}
          </div>
        ) : assignAction ? (
          <div className="flex justify-end">{assignAction}</div>
        ) : null}

        {listContent}
      </div>

      {!hideMaintenance && !isManageMode ? (
        <div className={embedded ? "mt-5 space-y-3" : sectionShellClass}>
          <h3 className="text-text-primary text-base font-semibold">
            Maintenance status
          </h3>
          {assignedEquipment
            .filter((equipment) => isMachineType(equipment.equipment_type))
            .map((equipment) => (
              <div
                key={`maint-${equipment.id}`}
                className="border-border-subtle bg-bg-app rounded-lg border p-4"
              >
                <p className="text-text-primary mb-3 text-sm font-semibold">
                  <JobEquipmentTruncatedName
                    machineName={equipment.machine_name}
                  />
                </p>
                <div className="space-y-2">
                  {(equipment.maintenance_attributes ?? [])
                    .filter((attr) => {
                      const status = getMaintenanceStatus(
                        equipment.machine_name,
                        attr.title,
                        maintenanceCheck
                      );
                      return attr.automatic || status.status !== "Good";
                    })
                    .map((attr) => {
                      const status = getMaintenanceStatus(
                        equipment.machine_name,
                        attr.title,
                        maintenanceCheck
                      );
                      const title = formatMaintenanceTitle(
                        attr.title
                      ).toUpperCase();
                      const truncated =
                        isMobile && title.length > 15
                          ? `${title.slice(0, 15)}…`
                          : title;

                      return (
                        <div
                          key={attr.id ?? attr.title}
                          className="border-border-subtle flex items-center justify-between gap-2 rounded-md border px-2 py-1.5"
                        >
                          <span className="text-text-primary flex items-center gap-2 text-xs sm:text-sm">
                            <span
                              aria-hidden
                              className={`inline-block h-2.5 w-2.5 rounded-full ${status.dotClassName}`}
                            />
                            {truncated}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.textColor}`}
                          >
                            {status.status}
                            {status.remainingHours != null
                              ? ` · ${status.remainingHours.toFixed(1)} hrs`
                              : null}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
      ) : null}

      {isManageMode ? (
        <AppFormModal
          showCancel
          isOpen={assignModalOpen}
          isSubmitting={patchJob.isPending}
          submitDisabled={selectedEquipment.length === 0}
          submitLabel="Save"
          title="Assign equipment"
          width={560}
          onClose={() => {
            setSelectedEquipment([...selectedEquipmentRef.current]);
            setAssignModalOpen(false);
          }}
          onSubmit={(event) => {
            event.preventDefault();
            void handleAssignEquipment();
          }}
        >
          <div className="space-y-4">
            <SearchableDropdown
              fullWidth
              emptyStateText="No equipment matches your search"
              helperText="Select one or more items; click a chip to remove."
              label="Equipment"
              options={dropdownOptions}
              placeholder="Search equipment…"
              searchPlaceholder="Search by name or serial…"
              value={undefined}
              onChange={(value) => {
                const id = parseInt(value, 10);
                if (!Number.isNaN(id)) toggleEquipmentSelection(id);
              }}
            />
            {selectedEquipment.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedEquipment.map((id) => {
                  const eq = equipmentOptions?.find((e) => e.id === id);
                  if (!eq) return null;
                  return (
                    <button
                      key={id}
                      className="bg-accent/15 text-accent hover:bg-accent/25 flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                      type="button"
                      onClick={() => toggleEquipmentSelection(id)}
                    >
                      {equipmentLabel(eq)}
                      <span aria-hidden>×</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </AppFormModal>
      ) : null}
    </>
  );
}
