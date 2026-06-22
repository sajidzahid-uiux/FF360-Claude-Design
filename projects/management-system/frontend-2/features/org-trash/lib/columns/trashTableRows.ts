import { formatContactWithFarm } from "@/shared/lib/formatContactWithFarm";
import { formatTableDateIsoPart } from "@/shared/lib/table/org-ui/tableDateFormat";

export type TrashItem = {
  id: number;
  type: string;
  title?: string;
  machine_name?: string;
  contact_info?: { full_name?: string };
  farm_info?: { name?: string };
  last_updated?: string;
  job_object_subclass?: string;
  lead_object_subclass?: string;
  equipment_type?: string;
  job_type?: string;
  current_hours?: number;
  current_miles?: number;
  license_plate?: string;
} & Record<string, unknown>;

export type TrashTableRow = {
  id: string;
  source: TrashItem;
  name: string;
  typeLabel: string;
  deletedDate: string;
  expiresLabel: string;
};

export function getTrashUniqueItemId(item: TrashItem): string {
  const itemType = item.type
    ? item.type.replace(/\s+/g, "-").toLowerCase()
    : "unknown";
  return `${itemType}-${item.id}`;
}

export function getTrashItemDisplayName(item: TrashItem): string {
  const hasContactWithFarm =
    "job_object_subclass" in item || "lead_object_subclass" in item;

  if (hasContactWithFarm) {
    return formatContactWithFarm(
      item.contact_info?.full_name,
      item.farm_info?.name
    );
  }

  return item.title ?? item.machine_name ?? item.contact_info?.full_name ?? "";
}

export function calculateTrashRemainingDaysLabel(
  lastUpdated: string | undefined
): string {
  if (!lastUpdated) return "Unavailable";

  const deletedDate = new Date(lastUpdated);
  if (Number.isNaN(deletedDate.getTime())) return "Expired";

  const thirtyDaysFromDelete = new Date(deletedDate);
  thirtyDaysFromDelete.setDate(deletedDate.getDate() + 30);

  const today = new Date();
  const remainingTime = thirtyDaysFromDelete.getTime() - today.getTime();
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

  if (remainingDays <= 0) return "Expired";
  return `${remainingDays} days`;
}

export function buildTrashTableRows(items: TrashItem[]): TrashTableRow[] {
  return items.map((item) => ({
    id: getTrashUniqueItemId(item),
    source: item,
    name: getTrashItemDisplayName(item),
    typeLabel: item.type ? item.type : "N/A",
    deletedDate: formatTableDateIsoPart(item.last_updated),
    expiresLabel: calculateTrashRemainingDaysLabel(item.last_updated),
  }));
}
