import { type Dispatch, type SetStateAction, useMemo } from "react";

import { Dropdown } from "@fieldflow360/org-ui";

import type { TeamMember } from "@/api/types/team";
import { PermissionCode } from "@/constants";
import {
  buildDesignerMultiPickOptions,
  designerMultiPickPlaceholder,
} from "@/features/team";
import { PermissionCodeGate } from "@/shared/ui/permissions";
import { isTeamMemberRemoved } from "@/utils/team/assignmentOrder";

import type { EntityDataState } from "../entityDataState";
import type { HandleCustomerPatchValue } from "../handleCustomerPatchValue";

interface DesignerSelectionProps {
  isDisabled: boolean;
  permissionCodes: PermissionCode[];
  allTeam: TeamMember[];
  entityDataState: EntityDataState;
  setEntityDataState: Dispatch<SetStateAction<EntityDataState>>;
  handleCustomerPatch: (
    field: string,
    value: HandleCustomerPatchValue
  ) => Promise<void>;
  /**
   * When true, changes are only buffered into local state and NOT patched
   * immediately — the parent section persists them on Save.
   */
  deferPatch?: boolean;
}

function memberFromTeam(team: TeamMember[] | undefined, id: number) {
  return team?.find((m) => m.id === id);
}

export const DesignerSelection = ({
  isDisabled,
  permissionCodes,
  allTeam,
  entityDataState,
  setEntityDataState,
  handleCustomerPatch,
  deferPatch = false,
}: DesignerSelectionProps) => {
  const selectedIds = useMemo(
    () => entityDataState.designers ?? [],
    [entityDataState.designers]
  );

  const removedSelectedDesigners = useMemo<TeamMember[]>(() => {
    if (selectedIds.length === 0) return [];
    const result: TeamMember[] = [];
    for (const id of selectedIds) {
      const member = memberFromTeam(allTeam, id);
      if (member && isTeamMemberRemoved(member)) {
        result.push(member);
      }
    }
    return result;
  }, [allTeam, selectedIds]);

  const options = useMemo(
    () =>
      buildDesignerMultiPickOptions(
        allTeam,
        selectedIds,
        removedSelectedDesigners
      ),
    [allTeam, selectedIds, removedSelectedDesigners]
  );

  const placeholder = useMemo(
    () => designerMultiPickPlaceholder(allTeam, selectedIds),
    [allTeam, selectedIds]
  );

  return (
    <div className="w-full">
      <p className="text-md mb-2 font-medium whitespace-nowrap">Designers</p>

      <PermissionCodeGate permissionCodes={permissionCodes}>
        <Dropdown
          fullWidth
          disabled={isDisabled}
          options={options}
          placeholder={placeholder}
          onChange={(value) => {
            if (!value || value === "empty") return;
            const designerId = parseInt(value, 10);
            if (Number.isNaN(designerId)) return;
            const currentDesigners = entityDataState.designers || [];
            const isSelected = currentDesigners.includes(designerId);

            const updatedDesigners = isSelected
              ? currentDesigners.filter((id: number) => id !== designerId)
              : [...currentDesigners, designerId];

            setEntityDataState((prev: EntityDataState) => ({
              ...prev,
              designers: updatedDesigners,
            }));
            if (!deferPatch) {
              handleCustomerPatch("designers", updatedDesigners);
            }
          }}
        />
      </PermissionCodeGate>
    </div>
  );
};
