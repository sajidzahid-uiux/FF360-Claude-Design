import { JobType } from "@/constants";

/** Reserved height for up to 3 badge rows in grid/kanban Clients and Farms. */
export const CLIENTS_AND_FARMS_CARD_MIN_HEIGHT = "min-h-[4.5rem]";

/** Fields block min-height when optional rows are omitted (whitespace padding). */
export const JOB_CARD_FIELDS_MIN_HEIGHT: Record<JobType, string> = {
  [JobType.TILING]: "min-h-[11.5rem]",
  [JobType.EXCAVATION]: "min-h-[9rem]",
  [JobType.REPAIR]: "min-h-[7.5rem]",
};

export const LEAD_CARD_FIELDS_MIN_HEIGHT = "min-h-[9rem]";
