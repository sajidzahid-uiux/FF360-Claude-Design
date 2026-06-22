"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Dropdown } from "@fieldflow360/org-ui";

import type {
  QuickAction,
  QuickActionConvertToLeadPayload,
  QuickActionFarmSelectOption,
} from "@/api/types";
import {
  JOB_TYPE_LABELS,
  JobLeadTypeSegment,
  apiJobTypeToJobLeadTypeSegment,
} from "@/constants";
import type { ConvertModalRegistration } from "@/features/quick-actions/model/convertModalRegistration";
import { useLeadTypes } from "@/hooks/queries";

import { QuickActionConvertBase } from "./QuickActionConvertBase";

export function ConvertToLeadContent({
  quickAction,
  onConvertLead,
  farms = [],
  registerModal,
}: {
  quickAction: QuickAction;
  onConvertLead: (payload: QuickActionConvertToLeadPayload) => void;
  farms?: QuickActionFarmSelectOption[];
  registerModal?: (config: ConvertModalRegistration | null) => void;
}) {
  const { data: leadTypesData } = useLeadTypes();

  const [leadType, setLeadType] = useState("");
  const [leadSourceId, setLeadSourceId] = useState("");
  const [description, setDescription] = useState(quickAction.description ?? "");
  const [selectedFarmId, setSelectedFarmId] = useState<number | undefined>();

  const leadTypeOptions = useMemo(
    () =>
      Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
      })),
    []
  );

  const leadSourceOptions = useMemo(() => {
    const leadTypes = Array.isArray(leadTypesData)
      ? leadTypesData
      : ((
          leadTypesData as unknown as {
            results?: { id: number; title: string }[];
          }
        )?.results ?? []);
    return leadTypes.map((lt) => ({
      value: String(lt.id),
      label: lt.title,
    }));
  }, [leadTypesData]);

  const files = quickAction.files ?? [];

  const isValid = Boolean(leadType && leadSourceId);

  const handleSubmit = useCallback(() => {
    if (!leadType || !leadSourceId) {
      return;
    }
    const parsed = parseInt(leadSourceId, 10);
    if (Number.isNaN(parsed)) {
      return;
    }
    onConvertLead({
      lead_type:
        apiJobTypeToJobLeadTypeSegment(leadType) ?? JobLeadTypeSegment.TILING,
      lead_source: parsed,
      description: description.trim() || undefined,
      farm_id: selectedFarmId,
      designers: [],
    });
  }, [description, leadSourceId, leadType, onConvertLead, selectedFarmId]);

  useEffect(() => {
    registerModal?.({
      submit: handleSubmit,
      submitDisabled: !isValid,
      submitLabel: "Convert",
    });
  }, [handleSubmit, isValid, registerModal]);

  return (
    <QuickActionConvertBase
      description={description}
      farms={farms}
      files={files}
      selectedFarmId={selectedFarmId}
      onDescriptionChange={setDescription}
      onSelectFarm={setSelectedFarmId}
    >
      <h3 className="text-sm font-semibold">Lead Information</h3>
      <Dropdown
        fullWidth
        label="Lead Type *"
        options={leadTypeOptions}
        placeholder="Lead Type"
        value={leadType || undefined}
        onChange={setLeadType}
      />
      <Dropdown
        fullWidth
        label="Lead Source *"
        options={leadSourceOptions}
        placeholder="Select Lead Source"
        value={leadSourceId || undefined}
        onChange={setLeadSourceId}
      />
    </QuickActionConvertBase>
  );
}
