import type { Maintenance, MaintenanceWorkItem } from "@/api/types";

type MaintenanceLog = Pick<
  Maintenance,
  "date" | "description" | "assigned_to"
> & {
  items?: Pick<MaintenanceWorkItem, "title">[];
};

export type FlattenedMaintenanceLog = {
  date: string;
  description: string;
  assigned_to: number[] | null;
};

export function flattenMaintenanceLogs(
  maintenanceLogs: MaintenanceLog[] = []
): FlattenedMaintenanceLog[] {
  return maintenanceLogs.flatMap((log) => {
    const base = {
      date: log.date,
      assigned_to: log.assigned_to,
    };

    const itemRows =
      log.items?.map((item) => ({
        ...base,
        description: item.title?.trim() || "Maintenance Item",
      })) ?? [];

    if (itemRows.length) {
      return itemRows;
    }

    return [
      {
        ...base,
        description: log.description?.trim() || "No description",
      },
    ];
  });
}
