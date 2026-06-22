import type { TableSortRule } from "@fieldflow360/org-ui";

import type { EquipmentV2 } from "@/api/types";
import { SortOrder } from "@/constants";
import { type EquipmentPageData, getEquipmentType } from "@/features/equipment";
import { CMS_DEFAULT_PAGE_SIZE as DEFAULT_PAGE_SIZE } from "@/shared/lib/table";

export type EquipmentImageField =
  | "equipment_image"
  | "insurance_image"
  | "registration_image"
  | "serial_number_image";

export interface EquipmentPaginationData {
  results?: EquipmentV2[];
  total_count?: number;
  count?: number;
  total_pages?: number;
  page_size?: number;
}

export function appendImageFields(
  formData: FormData,
  values: Partial<Record<EquipmentImageField, File | null | undefined>>,
  fields: EquipmentImageField[]
): boolean {
  let hasImages = false;

  for (const field of fields) {
    const value = values[field];
    if (value instanceof File) {
      formData.append(field, value);
      hasImages = true;
    }
  }

  return hasImages;
}

export function equipmentSortRulesToSortOrder(
  rules: TableSortRule[]
): SortOrder | undefined {
  const firstRule = rules[0];
  if (!firstRule) return undefined;
  return firstRule.direction === "asc" ? SortOrder.ASC : SortOrder.DESC;
}

export function sortOrderToEquipmentSortRules(
  sortOrder: SortOrder | undefined
): TableSortRule[] {
  if (!sortOrder) return [];
  return [
    {
      columnKey: "machine_name",
      direction: sortOrder === SortOrder.ASC ? "asc" : "desc",
    },
  ];
}

export function getEquipmentResults(data: unknown): EquipmentV2[] {
  if (Array.isArray(data)) return data as EquipmentV2[];
  if (data && typeof data === "object" && "results" in data) {
    return ((data as EquipmentPaginationData).results ?? []) as EquipmentV2[];
  }
  return [];
}

export function toEquipmentRows(data: unknown): EquipmentPageData[] {
  return getEquipmentResults(data).map((item) => {
    const type = getEquipmentType(item);
    const equipmentId = item.equipment_ptr_id || item.id;

    return {
      ...item,
      id: equipmentId,
      equipment_ptr_id: equipmentId,
      equipment_type: type,
    };
  });
}

export function buildEquipmentPaginationInfo(
  data: unknown,
  equipmentDataLength: number
) {
  if (!data || Array.isArray(data)) {
    const totalCount = Array.isArray(data) ? data.length : equipmentDataLength;
    return {
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE)),
      pageSize: DEFAULT_PAGE_SIZE,
    };
  }

  const paginatedData = data as EquipmentPaginationData;
  const totalCount = paginatedData.total_count || paginatedData.count || 0;
  const pageSize = paginatedData.page_size || DEFAULT_PAGE_SIZE;

  return {
    totalCount,
    totalPages:
      paginatedData.total_pages ||
      Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize,
  };
}

export const EQUIPMENT_TYPE_FILTER_ID = "equipment_type";
