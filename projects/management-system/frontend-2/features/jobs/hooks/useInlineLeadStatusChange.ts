"use client";

import { useCallback } from "react";

import { LeadType } from "@/constants";
import { usePatchLead } from "@/hooks/mutations/useLeadMutations";

export function useInlineLeadStatusChange(leadType: LeadType) {
  const patchLead = usePatchLead();

  const handleInlineLeadStatusChange = useCallback(
    async (leadId: number, statusId: number) => {
      await patchLead.mutateAsync({
        id: leadId,
        leadType,
        updatedLead: { lead_status: statusId },
      });
    },
    [patchLead, leadType]
  );

  return {
    handleInlineLeadStatusChange,
    isPending: patchLead.isPending,
  };
}
