export type {
  EquipmentPageData,
  MachinePageData,
  MachineSubmitData,
  MaintenanceAttribute,
  TrailerPageData,
  TrailerSubmitData,
  VehiclePageData,
  VehicleSubmitData,
} from "./types";
export {
  VEHICLE_SPECIFICATION_FIELD_KEYS,
  createVehicleEditDraft,
  resolveVehicleSpecificationValues,
} from "./vehicle-detail";
export type {
  EquipmentDetailAccess,
  EquipmentDetailImageSlotConfig,
  VehicleDetailAssignmentState,
  VehicleDetailEditHandlers,
  VehicleDetailMaintenanceActions,
  VehicleDetailRecord,
  VehicleDetailSpecificationsState,
  VehicleDetailsPanelProps,
  VehicleEditableFields,
  VehicleSpecificationFieldKey,
} from "./vehicle-detail";
export {
  DEFAULT_ADD_EQUIPMENT_FORM_VALUES,
  buildDefaultAddEquipmentFormValues,
  buildEquipmentNamePreview,
  getFilterDefinitionsForType,
} from "./addEquipmentForm";
export type {
  AddEquipmentFormValues,
  FilterStateItem,
} from "./addEquipmentForm";
export {
  MACHINE_FILTER_DEFINITIONS,
  VEHICLE_FILTER_DEFINITIONS,
} from "./equipmentFilterDefinitions";
export type { EquipmentFilterDefinition } from "./equipmentFilterDefinitions";
