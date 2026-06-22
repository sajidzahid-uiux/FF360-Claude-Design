import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

import {
  AppFormModal,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { Lead, RecordEquipment } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import { JobType, getJobTypePathSegment } from "@/constants";
import { buildDesignerMultiPickOptions } from "@/features/team";
import { useRouteIds } from "@/hooks";
import { orgPath } from "@/shared/config/routes";

import type { EntityDataState } from "../entityDataState";
import type {
  ShowMoreCardConfig,
  ShowMoreCardConvertHookResult,
} from "../types";

interface ConvertToJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ShowMoreCardConfig;
  entityDataState: EntityDataState;
  entityData: EntityDataState | Lead | undefined;
  allTeam: TeamMember[];
  allEquipment: RecordEquipment[];
  convertHook: ShowMoreCardConvertHookResult;
  canWriteExcavationEquipment: boolean;
  onSuccess: () => void;
  leadData?: Lead | EntityDataState;
}

function SelectedIdChips({
  ids,
  resolveLabel,
  onRemove,
}: {
  ids: number[];
  resolveLabel: (id: number) => string;
  onRemove: (id: number) => void;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {ids.map((id) => (
        <div
          key={id}
          className="bg-accent text-text-primary flex items-center gap-2 rounded-md px-2 py-1"
        >
          <span>{resolveLabel(id)}</span>
          <button
            className="hover:bg-accent/80 rounded-full p-1"
            type="button"
            onClick={() => onRemove(id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConvertToJobDialog({
  open,
  onOpenChange,
  config,
  entityDataState,
  entityData,
  allTeam,
  allEquipment,
  convertHook,
  canWriteExcavationEquipment,
  onSuccess,
  leadData,
}: ConvertToJobDialogProps) {
  const router = useRouter();
  const { orgId } = useRouteIds();
  const [selectedDesignerIds, setSelectedDesignerIds] = useState<number[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>(
    []
  );
  const [convertLoading, setConvertLoading] = useState(false);

  const isSubmitting = convertHook.isPending || convertLoading;
  const modalTitle = `Convert to ${config.jobType === JobType.TILING ? "Jobs" : "Job"}`;

  const designerOptions = useMemo(
    () =>
      buildDesignerMultiPickOptions(
        Array.isArray(allTeam) ? (allTeam as TeamMember[]) : [],
        selectedDesignerIds
      ),
    [allTeam, selectedDesignerIds]
  );

  const equipmentOptions = useMemo((): DropdownOption<string>[] => {
    if (allEquipment.length === 0) {
      return [
        { value: "empty", label: "No equipment available", disabled: true },
      ];
    }
    return allEquipment.map((eq) => {
      const isSelected = selectedEquipmentIds.includes(eq.id);
      return {
        value: eq.id.toString(),
        label: `${isSelected ? "✓ " : ""}${eq.name}${eq.serial_number ? ` - ${eq.serial_number}` : ""}`,
      };
    });
  }, [allEquipment, selectedEquipmentIds]);

  const resetSelections = () => {
    setSelectedDesignerIds([]);
    setSelectedEquipmentIds([]);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
    resetSelections();
  };

  const handleConvert = async () => {
    setConvertLoading(true);
    try {
      const leadId = entityDataState?.id || leadData?.id || entityData?.id;

      if (!leadId) {
        toast.error("Lead ID is missing");
        return;
      }

      if (config.jobType === JobType.TILING) {
        await convertHook.mutateAsync({
          leadId,
          designers:
            selectedDesignerIds.length > 0 ? selectedDesignerIds : undefined,
        });
      } else if (config.jobType === JobType.EXCAVATION) {
        await convertHook.mutateAsync({
          leadId,
          equipments:
            selectedEquipmentIds.length > 0
              ? selectedEquipmentIds.map((id) => ({ equipment: id }))
              : undefined,
        });
      } else {
        await convertHook.mutateAsync({ leadId });
      }

      toast.success("Lead converted to job successfully");
      onOpenChange(false);
      resetSelections();
      onSuccess();
      if (orgId) {
        router.push(
          orgPath(
            orgId,
            `/jobs/${getJobTypePathSegment(config.jobType)}/${leadId}`
          )
        );
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
      };
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to convert lead to job";
      toast.error(errorMessage);
    } finally {
      setConvertLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleConvert();
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={isSubmitting}
      submitLabel={isSubmitting ? "Converting…" : "Convert"}
      title={modalTitle}
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {config.jobType === JobType.TILING ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-medium">
              Choose designer{" "}
              <span className="text-text-muted font-normal">(optional)</span>
            </p>
            <p className="text-text-muted mt-1 text-sm">
              You can assign a designer now or later.
            </p>
          </div>
          <Dropdown
            fullWidth
            label="Designer"
            options={designerOptions}
            placeholder="Select a designer (optional)…"
            onChange={(value) => {
              const id = parseInt(value, 10);
              if (Number.isNaN(id)) return;
              setSelectedDesignerIds((prev) =>
                prev.includes(id)
                  ? prev.filter((dId) => dId !== id)
                  : [...prev, id]
              );
            }}
          />
          <SelectedIdChips
            ids={selectedDesignerIds}
            resolveLabel={(id) => {
              const designer = Array.isArray(allTeam)
                ? (allTeam as TeamMember[]).find((d) => d.id === id)
                : undefined;
              return designer?.user?.username ?? `Designer #${id}`;
            }}
            onRemove={(id) =>
              setSelectedDesignerIds((prev) => prev.filter((dId) => dId !== id))
            }
          />
        </div>
      ) : null}

      {config.jobType === JobType.EXCAVATION && canWriteExcavationEquipment ? (
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-medium">
              Choose equipment{" "}
              <span className="text-text-muted font-normal">(optional)</span>
            </p>
            <p className="text-text-muted mt-1 text-sm">
              You can assign equipment now or later.
            </p>
          </div>
          <Dropdown
            fullWidth
            label="Equipment"
            options={equipmentOptions}
            placeholder="Select equipment (optional)…"
            onChange={(value) => {
              const id = parseInt(value, 10);
              if (Number.isNaN(id)) return;
              setSelectedEquipmentIds((prev) =>
                prev.includes(id)
                  ? prev.filter((eId) => eId !== id)
                  : [...prev, id]
              );
            }}
          />
          <SelectedIdChips
            ids={selectedEquipmentIds}
            resolveLabel={(id) => {
              const equipment = allEquipment.find((e) => e.id === id);
              const name = equipment?.name ?? `Equipment #${id}`;
              return equipment?.serial_number
                ? `${name} - ${equipment.serial_number}`
                : name;
            }}
            onRemove={(id) =>
              setSelectedEquipmentIds((prev) =>
                prev.filter((eId) => eId !== id)
              )
            }
          />
        </div>
      ) : null}
    </AppFormModal>
  );
}
