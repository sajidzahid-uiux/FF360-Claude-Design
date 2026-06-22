import { JobType } from "@/constants";

import type { TrashItem } from "./columns";

export function inferTrashItem(item: Record<string, unknown>): TrashItem {
  if ("lead_object_subclass" in item) {
    if (item.lead_object_subclass === "RepairLead")
      return { ...item, type: "Repair Lead" } as TrashItem;
    if (item.lead_object_subclass === "ExcavationLead")
      return { ...item, type: "Excavation Lead" } as TrashItem;
    if (item.lead_object_subclass === "Drainage_TilingLead")
      return { ...item, type: "Tile Lead" } as TrashItem;
    return { ...item, type: "Unknown Lead" } as TrashItem;
  }

  if ("job_type" in item || "type" in item) {
    const jobType = String(item.job_type ?? item.type ?? "");
    if (jobType.toLowerCase().includes(JobType.REPAIR)) {
      return {
        ...item,
        type: "Repair Job",
        job_object_subclass: "RepairJob",
      } as TrashItem;
    }
    if (jobType.toLowerCase().includes(JobType.EXCAVATION)) {
      return {
        ...item,
        type: "Excavation Job",
        job_object_subclass: "ExcavationJob",
      } as TrashItem;
    }
    if (jobType.toLowerCase().includes("tiling")) {
      return {
        ...item,
        type: "Tile Job",
        job_object_subclass: "Drainage_TilingJob",
      } as TrashItem;
    }
    return { ...item, type: "Unknown Job" } as TrashItem;
  }

  if ("current_hours" in item)
    return {
      ...item,
      type: "Machine Equipment",
      equipment_type: "machines",
    } as TrashItem;
  if ("current_miles" in item)
    return {
      ...item,
      type: "Vehicle Equipment",
      equipment_type: "vehicles",
    } as TrashItem;
  if ("license_plate" in item && !("current_miles" in item))
    return {
      ...item,
      type: "Trailer Equipment",
      equipment_type: "trailers",
    } as TrashItem;

  return { ...item, type: "Unknown" } as TrashItem;
}

export function filterTrashByCategories(
  items: TrashItem[],
  selectedCategories: string[]
): TrashItem[] {
  if (selectedCategories.length === 0) return items;
  return items.filter((item) => {
    if (selectedCategories.includes("leads") && item.type.includes("Lead"))
      return true;
    if (selectedCategories.includes("jobs") && item.type.includes("Job"))
      return true;
    if (
      selectedCategories.includes("equipment") &&
      item.type.includes("Equipment")
    )
      return true;
    return false;
  });
}
