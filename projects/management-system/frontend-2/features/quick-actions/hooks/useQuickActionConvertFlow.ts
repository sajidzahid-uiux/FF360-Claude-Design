"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  QuickAction,
  QuickActionConvertToJobPayload,
  QuickActionConvertToLeadPayload,
  QuickActionFarmSelectOption,
} from "@/api/types";
import { ResourceType } from "@/constants";
import {
  useConvertQuickActionToContact,
  useConvertQuickActionToJob,
  useConvertQuickActionToLead,
} from "@/hooks/mutations";
import { useQuickActionContactLookup } from "@/hooks/queries";
import { useModalStack } from "@/shared/model/use-modal-stack";

import { QuickActionConvertTarget } from "../ui/QuickActionConvertDropdown";

const CONVERT_MODAL_KEY = "convert-quick-action";

function isConvertTarget(value: string | undefined): value is QuickActionConvertTarget {
  return value === "contact" || value === "job" || value === "lead";
}

const CONVERT_MODAL_COPY: Record<
  QuickActionConvertTarget,
  { title: string; subtitle: string }
> = {
  contact: {
    title: "Convert to Official Contact",
    subtitle:
      "Complete the form below to convert your request into an official contact.",
  },
  job: {
    title: "Convert to Official Job",
    subtitle:
      "Complete the form below to convert your request into an official job.",
  },
  lead: {
    title: "Convert to Lead",
    subtitle:
      "Complete the form below to convert your request into an official lead.",
  },
};

export function useQuickActionConvertFlow(
  quickActionId: number | undefined,
  quickAction: QuickAction | undefined
) {
  const { stack, openModal, updateModalParams, closeModalKey } =
    useModalStack();
  const convertFrame = stack.find((f) => f.key === CONVERT_MODAL_KEY);
  const mode: QuickActionConvertTarget | null = isConvertTarget(
    convertFrame?.params.type
  )
    ? convertFrame.params.type
    : null;

  const setMode = useCallback(
    (next: QuickActionConvertTarget) => {
      if (convertFrame) {
        updateModalParams({ type: next }, CONVERT_MODAL_KEY);
      } else {
        openModal(CONVERT_MODAL_KEY, { type: next });
      }
    },
    [convertFrame, openModal, updateModalParams]
  );

  const [intendedConversionAfterContact, setIntendedConversionAfterContact] =
    useState<ResourceType | null>(null);

  const contactLookup = useQuickActionContactLookup(
    quickActionId,
    mode === "contact"
  );
  const convertToContactMutation =
    useConvertQuickActionToContact(quickActionId);
  const convertToJobMutation = useConvertQuickActionToJob(quickActionId);
  const convertToLeadMutation = useConvertQuickActionToLead(quickActionId);

  const contactLookupMatches = useMemo(() => {
    const data = contactLookup.data;
    if (!data || data.done) return null;
    return data.matches ?? null;
  }, [contactLookup.data]);

  const leadFarms: QuickActionFarmSelectOption[] = useMemo(() => {
    const farms = quickAction?.conversion?.contact?.farms;
    if (!farms?.length) return [];
    return farms.map((farm) => ({ ...farm }));
  }, [quickAction?.conversion?.contact?.farms]);

  const hasContact = Boolean(quickAction?.conversion?.contact);

  const close = useCallback(() => {
    closeModalKey(CONVERT_MODAL_KEY);
    setIntendedConversionAfterContact(null);
  }, [closeModalKey]);

  const openContact = useCallback(() => setMode("contact"), [setMode]);
  const openLead = useCallback(() => setMode(ResourceType.LEAD), [setMode]);
  const openJob = useCallback(() => setMode(ResourceType.JOB), [setMode]);

  const continueAfterContact = useCallback(() => {
    if (intendedConversionAfterContact === ResourceType.LEAD) {
      setMode(ResourceType.LEAD);
      setIntendedConversionAfterContact(null);
      return;
    }
    if (intendedConversionAfterContact === ResourceType.JOB) {
      setMode(ResourceType.JOB);
      setIntendedConversionAfterContact(null);
      return;
    }
    close();
  }, [close, intendedConversionAfterContact, setMode]);

  const handleConnectContact = useCallback(
    (contactId: number) => {
      convertToContactMutation.mutate(
        { contact_id: contactId },
        { onSuccess: continueAfterContact }
      );
    },
    [convertToContactMutation, continueAfterContact]
  );

  const handleCreateContact = useCallback(
    (payload: { name: string; email?: string; phone_number?: string }) => {
      convertToContactMutation.mutate(payload, {
        onSuccess: continueAfterContact,
      });
    },
    [convertToContactMutation, continueAfterContact]
  );

  const handleConvertLead = useCallback(
    (payload: QuickActionConvertToLeadPayload) => {
      convertToLeadMutation.mutate(payload, { onSuccess: close });
    },
    [convertToLeadMutation, close]
  );

  const handleConvertJob = useCallback(
    (payload: QuickActionConvertToJobPayload) => {
      convertToJobMutation.mutate(payload, { onSuccess: close });
    },
    [convertToJobMutation, close]
  );

  const requestContactForConversion = useCallback((target: ResourceType) => {
    setIntendedConversionAfterContact(target);
    setMode("contact");
  }, [setMode]);

  const modalCopy = mode ? CONVERT_MODAL_COPY[mode] : null;

  return {
    mode,
    modalCopy,
    openContact,
    openLead,
    openJob,
    close,
    hasContact,
    leadFarms,
    contactLookup,
    contactLookupMatches,
    convertToContactMutation,
    convertToJobMutation,
    convertToLeadMutation,
    handleConnectContact,
    handleCreateContact,
    handleConvertLead,
    handleConvertJob,
    requestContactForConversion,
  };
}

export type QuickActionConvertFlow = ReturnType<
  typeof useQuickActionConvertFlow
>;
