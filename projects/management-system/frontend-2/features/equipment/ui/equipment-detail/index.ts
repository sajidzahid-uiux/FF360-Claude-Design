export { VehicleDetailsPanel } from "./VehicleDetailsPanel";
export type { VehicleDetailsPanelProps } from "./VehicleDetailsPanel";
export { EquipmentDetailImageSlot } from "./EquipmentDetailImageSlot";
export type { EquipmentDetailImageSlotProps } from "./EquipmentDetailImageSlot";
export { EquipmentDetailLayout } from "./EquipmentDetailLayout";
export type { EquipmentDetailLayoutProps } from "./EquipmentDetailLayout";
export { EquipmentMaintenanceFilterCard } from "./EquipmentMaintenanceFilterCard";
export type { EquipmentMaintenanceFilterCardProps } from "./EquipmentMaintenanceFilterCard";

export const VEHICLE_DETAIL_TABS = [
  { value: "details", label: "Details" },
  { value: "filters", label: "Maintenance filters" },
  { value: "battery", label: "Battery" },
  { value: "notes", label: "Notes & comments" },
] as const;

export type VehicleDetailTabId = (typeof VEHICLE_DETAIL_TABS)[number]["value"];
