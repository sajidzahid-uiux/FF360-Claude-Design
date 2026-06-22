import type { CrewGroupDetail } from "@/api/types";

export type CrewGroupFormMode = "create" | "edit";

export type CrewGroupFormEditContext = CrewGroupDetail;

export interface CrewGroupFormValues {
  name: string;
  selectedMemberIds: number[];
  selectedProjectTypeIds: number[];
  membersToDeactivate: number[];
}

export const DEFAULT_CREW_GROUP_FORM_VALUES: CrewGroupFormValues = {
  name: "",
  selectedMemberIds: [],
  selectedProjectTypeIds: [],
  membersToDeactivate: [],
};
