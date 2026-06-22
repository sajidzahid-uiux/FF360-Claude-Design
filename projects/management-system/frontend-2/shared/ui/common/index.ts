// Layout & UI
export { ColoredLabel } from "./ColoredLabel";
export { default as NavBar } from "./NavBar";
export {
  ThemeProvider,
  formatResolvedThemeModeLabel,
  useTheme,
} from "./ThemeProvider";
export { Toaster } from "./Toaster";
export type { UserSettingsAppearance } from "./ThemeProvider";
export { TouchSlideText } from "./TouchSlideText";
export { TouchSlideRow } from "./TouchSlideRow";
export { MarqueeText } from "./MarqueeText";

export {
  DetailViewPage,
  DetailViewPageHeader,
  DetailFormSection,
  DetailReadOnlyField,
  DetailViewEditActions,
} from "./detail-page";
export type {
  DetailViewPageProps,
  DetailViewPageHeaderProps,
  DetailFormSectionProps,
  DetailReadOnlyFieldProps,
  DetailViewEditActionsProps,
} from "./detail-page";

// Page Components - re-exported from page-renderer for convenience
export {
  DataBoundary,
  EmptyState,
  ErrorState,
  PageContainer,
  PageHeader,
  PageRenderer,
} from "./page-renderer";
export type {
  Breadcrumb,
  DataBoundaryProps,
  EmptyStateProps,
  ErrorStateProps,
  PageContainerProps,
  PageHeaderProps,
} from "./page-renderer";
export { DialogManager, ModalManager } from "./DialogManager";

// Data Display
export { default as FileCard } from "./FileCard";
export { GenericCard } from "./GenericCard";
export type {
  GenericCardProps,
  GenericCardField,
  GenericCardStatus,
  GenericCardProgress,
} from "./GenericCard";
export { MapFileCard } from "./MapFileCard";
export { default as Notes } from "./Notes";
export { default as SitesPopUp } from "./SitesPopUp";

// Forms & Inputs
export { default as ColorPicker } from "./ColorPicker";
export { default as UploadFile } from "./UploadFile";
export { FilesDragDropZone } from "./FilesDragDropZone";

// Dialogs & Modals
export { default as ContactSalesDialog } from "./ContactSalesDialog";
export { FormDialog, DialogTemplate } from "./dialogs";

// Table column helpers
export {
  ColumnBuilder,
  ColumnCells,
  ColumnPresets,
  ColumnUtils,
} from "./table/columnBuilder";
export type {
  ActionsColumnConfig,
  ColumnBuilderBuildOptions,
  ColumnRegistration,
  ColumnVisibilityPredicate,
  SelectColumnConfig,
  SortableColumnConfig,
  StatusColumnConfig,
} from "./table/columnBuilder";

// Error Views
export { ResourceErrorView } from "./ResourceErrorView";

// Chat
export { default as ChatBot } from "./ChatBot";

// Filter
export { Filter, FilterType } from "./filter";
export type {
  FilterConfig,
  FilterState,
  FilterProps,
  MultiFilterState,
  MultiFilterConfig,
} from "./filter";

// Dropdown Components
export {
  Dropdown,
  DetailsActionsDropdown,
  ShowMoreExtraActionsDropdown,
  StatusDropdown,
  MaterialStatusDropdown,
  OrderStatusBadge,
  ProjectTypeDropdown,
  UploadFileDropdown,
  type DropdownItem,
  type DropdownProps,
} from "./Dropdown";
