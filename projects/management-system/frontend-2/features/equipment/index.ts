export {
  DEFAULT_ADD_EQUIPMENT_FORM_VALUES,
  MACHINE_FILTER_DEFINITIONS,
  VEHICLE_FILTER_DEFINITIONS,
  VEHICLE_SPECIFICATION_FIELD_KEYS,
  buildDefaultAddEquipmentFormValues,
  buildEquipmentNamePreview,
  createVehicleEditDraft,
  getFilterDefinitionsForType,
  resolveVehicleSpecificationValues,
} from "./model";
export type {
  AddEquipmentFormValues,
  EquipmentDetailAccess,
  EquipmentDetailImageSlotConfig,
  EquipmentFilterDefinition,
  EquipmentPageData,
  FilterStateItem,
  MachinePageData,
  MachineSubmitData,
  MaintenanceAttribute,
  TrailerPageData,
  TrailerSubmitData,
  VehicleDetailAssignmentState,
  VehicleDetailEditHandlers,
  VehicleDetailMaintenanceActions,
  VehicleDetailRecord,
  VehicleDetailSpecificationsState,
  VehicleDetailsPanelProps,
  VehicleEditableFields,
  VehiclePageData,
  VehicleSpecificationFieldKey,
  VehicleSubmitData,
} from "./model";
export {
  AddEquipmentModal,
  AddMaintenanceFilterDropdown,
  AddMaintenanceFilterModal,
  BatteryReplacement,
  DownloadMaintenanceLogButton,
  EquipmentGridCard,
  EquipmentNotes,
  EquipmentStatusBadge,
  EquipmentTable,
  FileInput,
  MediaViewer,
  VehicleDetailView,
} from "./ui";
export type {
  AddEquipmentModalProps,
  AddMaintenanceFilterDropdownProps,
  AddMaintenanceFilterFormData,
  AddMaintenanceFilterModalProps,
  DownloadMaintenanceLogButtonProps,
  EquipmentTableProps,
  MaintenanceFilterOption,
  MediaViewerProps,
  VehicleDetailViewProps,
} from "./ui";
export {
  getEquipmentType,
  getEquipmentTypeLabel,
  isMachineType,
  isVehicleType,
  normalizeEquipmentType,
} from "./lib/equipmentType";
export { useCmsEquipmentDetailBreadcrumb } from "./hooks/useCmsEquipmentDetailBreadcrumb";
export { useEquipmentMaintenanceLogDownload } from "./hooks/useEquipmentMaintenanceLogDownload";
export type { UseEquipmentMaintenanceLogDownloadParams } from "./hooks/useEquipmentMaintenanceLogDownload";
export {
  buildEquipmentDetailBreadcrumbPath,
  buildEquipmentDetailHref,
  buildEquipmentLogsHref,
  getEquipmentDisplayName,
  getEquipmentRecordId,
  mapEquipmentTypeToApiCollection,
  toEquipmentTypeQueryParam,
} from "./lib/equipment-routes";
export {
  addEquipmentFormToSubmitPayload,
  type AddEquipmentSubmitPayload,
} from "./lib/add-equipment-form-payload";
export {
  loadMachineForm,
  loadTrailerForm,
  loadVehicleForm,
} from "./lib/equipmentFormLoaders";
