"use client";

import { useCallback, useMemo } from "react";

import { Input } from "@fieldflow360/org-ui";
import { X } from "lucide-react";

import type {
  AvailableMember,
  CrewGroupMember,
  ProjectType,
} from "@/api/types";

import type { CrewGroupFormValues } from "../model/crewGroupForm";
import { CrewGroupProjectTypesJobFilter } from "./CrewGroupProjectTypesJobFilter";
import { CrewMemberPicker } from "./CrewMemberPicker";

interface CrewGroupFormFieldsProps {
  mode: "create" | "edit";
  values: CrewGroupFormValues;
  onChange: (values: CrewGroupFormValues) => void;
  projectTypes: ProjectType[];
  availableMembers: AvailableMember[];
  currentMembers?: CrewGroupMember[];
  isDefault?: boolean;
  membersLoading?: boolean;
  memberSearchTerm: string;
  onMemberSearchTermChange: (value: string) => void;
  jobFilterSyncKey: number;
  nameError?: string;
}

function getMemberDisplayName(
  memberId: number,
  availableMembers: AvailableMember[],
  currentMembers: CrewGroupMember[] = []
): string {
  const fromAvailable = availableMembers.find((m) => m.id === memberId);
  if (fromAvailable) return fromAvailable.user.username;

  const fromCurrent = currentMembers.find((m) => m.id === memberId);
  return fromCurrent?.user.username ?? `Member #${memberId}`;
}

export function CrewGroupFormFields({
  mode,
  values,
  onChange,
  projectTypes,
  availableMembers,
  currentMembers = [],
  isDefault = false,
  membersLoading = false,
  memberSearchTerm,
  onMemberSearchTermChange,
  jobFilterSyncKey,
  nameError,
}: CrewGroupFormFieldsProps) {
  const activeCurrentMembers = useMemo(
    () => currentMembers.filter((member) => member.is_active),
    [currentMembers]
  );

  const setField = useCallback(
    <K extends keyof CrewGroupFormValues>(
      field: K,
      fieldValue: CrewGroupFormValues[K]
    ) => {
      onChange({ ...values, [field]: fieldValue });
    },
    [onChange, values]
  );

  const removeCurrentMember = useCallback(
    (memberId: number) => {
      const willDeactivate = values.membersToDeactivate.includes(memberId);
      if (willDeactivate) {
        setField(
          "membersToDeactivate",
          values.membersToDeactivate.filter((id) => id !== memberId)
        );
        if (!values.selectedMemberIds.includes(memberId)) {
          setField("selectedMemberIds", [
            ...values.selectedMemberIds,
            memberId,
          ]);
        }
        return;
      }

      setField(
        "selectedMemberIds",
        values.selectedMemberIds.filter((id) => id !== memberId)
      );
      if (activeCurrentMembers.some((member) => member.id === memberId)) {
        setField("membersToDeactivate", [
          ...values.membersToDeactivate,
          memberId,
        ]);
      }
    },
    [
      activeCurrentMembers,
      setField,
      values.membersToDeactivate,
      values.selectedMemberIds,
    ]
  );

  const selectedMemberChips =
    mode === "create"
      ? values.selectedMemberIds
      : values.selectedMemberIds.filter((id) =>
          activeCurrentMembers.some((member) => member.id === id)
        );

  return (
    <div className="flex flex-col gap-5">
      <Input
        disabled={mode === "edit" && isDefault}
        error={nameError}
        label="Group name"
        placeholder="Enter group name"
        value={values.name}
        onChange={(event) => setField("name", event.target.value)}
      />
      {mode === "edit" && isDefault ? (
        <p className="text-text-muted -mt-3 text-xs">
          Default group names cannot be changed.
        </p>
      ) : null}

      {mode === "edit" ? (
        <div className="space-y-2">
          <p className="text-text-primary text-sm font-medium">
            Current members
          </p>
          <div className="flex flex-wrap gap-2">
            {activeCurrentMembers.map((member) => {
              const willDeactivate = values.membersToDeactivate.includes(
                member.id
              );
              return (
                <span
                  key={member.id}
                  className={`inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    willDeactivate
                      ? "bg-feedback-error/15 text-feedback-error"
                      : "bg-bg-surface text-text-primary"
                  }`}
                >
                  <span className="truncate">{member.user.username}</span>
                  <button
                    aria-label={`Remove ${member.user.username}`}
                    className="hover:bg-bg-surface rounded-full p-0.5"
                    type="button"
                    onClick={() => removeCurrentMember(member.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
          {values.membersToDeactivate.length > 0 ? (
            <p className="text-text-muted text-xs">
              {values.membersToDeactivate.length} member(s) will be removed from
              this group.
            </p>
          ) : null}
        </div>
      ) : null}

      {mode === "create" && selectedMemberChips.length > 0 ? (
        <div className="space-y-2">
          <p className="text-text-primary text-sm font-medium">
            Selected members
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMemberChips.map((memberId) => (
              <span
                key={memberId}
                className="bg-bg-surface text-text-primary inline-flex max-w-full items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
              >
                <span className="truncate">
                  {getMemberDisplayName(
                    memberId,
                    availableMembers,
                    currentMembers
                  )}
                </span>
                <button
                  aria-label="Remove member"
                  className="hover:bg-bg-surface rounded-full p-0.5"
                  type="button"
                  onClick={() =>
                    setField(
                      "selectedMemberIds",
                      values.selectedMemberIds.filter((id) => id !== memberId)
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <CrewGroupProjectTypesJobFilter
        projectTypes={projectTypes}
        selectedProjectTypeIds={values.selectedProjectTypeIds}
        toggleSyncKey={jobFilterSyncKey}
        onBulkDeselectIds={(ids) =>
          setField(
            "selectedProjectTypeIds",
            values.selectedProjectTypeIds.filter((id) => !ids.includes(id))
          )
        }
        onSetProjectTypeIds={(ids) => setField("selectedProjectTypeIds", ids)}
      />

      <CrewMemberPicker
        isLoading={membersLoading}
        members={availableMembers}
        searchTerm={memberSearchTerm}
        selectedMemberIds={values.selectedMemberIds}
        onSearchTermChange={onMemberSearchTermChange}
        onSelectedMemberIdsChange={(ids) => setField("selectedMemberIds", ids)}
      />
    </div>
  );
}
