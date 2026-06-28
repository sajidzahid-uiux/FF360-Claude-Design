"use client";

import { useCallback } from "react";

import { toast } from "sonner";

import { JobLeadTypeSegment } from "@/constants";
import { getLeadCreateErrorMessage } from "@/features/forms";
import { useLeadStatuses } from "@/hooks";
import {
  useCreateDrainageTilingLead,
  useCreateExcavationLead,
  useCreateRepairLead,
} from "@/hooks/mutations";
import { useModalStack } from "@/shared/model/use-modal-stack";

import type { LeadCreateSubmitValues } from "../model/jobLeadForm";
import {
  LEAD_ROUTE_CONFIGS,
  createJobLeadFormProps,
} from "../model/jobLeadRouteConfig";
import { JobLeadForm } from "./JobLeadForm";

const MODAL_KEY = "add-lead";

/** Map a selected type segment to its create mutation. */
function pickLeadMutation(
  segment: JobLeadTypeSegment | undefined,
  mutations: {
    tiling: ReturnType<typeof useCreateDrainageTilingLead>;
    excavation: ReturnType<typeof useCreateExcavationLead>;
    repair: ReturnType<typeof useCreateRepairLead>;
  }
) {
  if (segment === JobLeadTypeSegment.EXCAVATION) return mutations.excavation;
  if (segment === JobLeadTypeSegment.REPAIR) return mutations.repair;
  return mutations.tiling;
}

/**
 * Self-contained "Add Lead" modal driven by the URL stack (`?modal=add-lead`).
 * Rendered globally so the global "+" button can open it over ANY module
 * without navigating to the leads page. The user picks the lead type inside the
 * modal (the form's type switcher); an optional frame param `type` preselects it.
 */
export function AddLeadModalConnected() {
  const { stack, closeModalKey } = useModalStack();
  const frame = stack.find((f) => f.key === MODAL_KEY);
  const open = Boolean(frame);
  const preselected = frame?.params.type as JobLeadTypeSegment | undefined;

  const { data: leadStatuses } = useLeadStatuses();
  const createTilingLead = useCreateDrainageTilingLead();
  const createExcavationLead = useCreateExcavationLead();
  const createRepairLead = useCreateRepairLead();

  const isSubmitting =
    createTilingLead.isPending ||
    createExcavationLead.isPending ||
    createRepairLead.isPending;

  const handleSubmit = useCallback(
    async (values: LeadCreateSubmitValues) => {
      try {
        // Prototype runs on dummy data — fall back to the first status (or id 1)
        // when no explicit "new" status exists so creation never dead-ends.
        const newStatus =
          leadStatuses?.find((status) =>
            status.title.toLowerCase().includes("new")
          ) ??
          leadStatuses?.[0] ??
          null;

        const leadData = {
          name: values.selectedContact
            ? `Lead for Contact ${values.selectedContact}`
            : "New Lead",
          lead_type: values.lead_type || 1,
          lead_status: newStatus?.id ?? 1,
          contact: values.selectedContact
            ? parseInt(values.selectedContact)
            : undefined,
          farm_info: null,
          description: values.description || "",
          latitude: values.latitude,
          longitude: values.longitude,
          vertices: values.vertices,
          acre: values.acre,
          designers: values.designers || [],
        };

        const payload = values.selectedFarm
          ? { ...leadData, farm: parseInt(values.selectedFarm) }
          : leadData;

        const mutation = pickLeadMutation(preselected, {
          tiling: createTilingLead,
          excavation: createExcavationLead,
          repair: createRepairLead,
        });
        await mutation.mutateAsync(payload);

        closeModalKey(MODAL_KEY);
      } catch (error: unknown) {
        toast.error(getLeadCreateErrorMessage(error, "Failed to create lead"));
      }
    },
    [
      closeModalKey,
      createExcavationLead,
      createRepairLead,
      createTilingLead,
      leadStatuses,
      preselected,
    ]
  );

  if (!open) return null;

  const baseConfig =
    LEAD_ROUTE_CONFIGS[preselected ?? JobLeadTypeSegment.TILING] ??
    LEAD_ROUTE_CONFIGS[JobLeadTypeSegment.TILING];
  const formProps = createJobLeadFormProps(baseConfig).props;

  return (
    <JobLeadForm
      {...formProps}
      isOpen={open}
      isSubmitting={isSubmitting}
      requireTypeSelection={!preselected}
      onCancel={() => closeModalKey(MODAL_KEY)}
      onOpenChange={(next) => {
        if (!next) closeModalKey(MODAL_KEY);
      }}
      onSubmit={handleSubmit}
    />
  );
}
