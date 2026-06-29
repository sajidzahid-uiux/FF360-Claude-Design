'use client';

// Components
export { Button } from './components/ui-components/Button';
export type { ButtonProps } from './components/ui-components/Button';

export { Input } from './components/ui-components/Input';
export type { InputProps } from './components/ui-components/Input';

export { Textarea } from './components/ui-components/Textarea';
export type { TextareaProps } from './components/ui-components/Textarea';

export { Avatar } from './components/ui-components/Avatar';
export type { AvatarProps, AvatarSize } from './components/ui-components/Avatar';

export { Checkbox } from './components/ui-components/Checkbox';
export type { CheckboxProps } from './components/ui-components/Checkbox';

export { ColorPicker } from './components/ui-components/ColorPicker';
export type { ColorPickerProps } from './components/ui-components/ColorPicker';

export { Radio } from './components/ui-components/Radio';
export type { RadioProps } from './components/ui-components/Radio';

export { Slider } from './components/ui-components/Slider';
export type { SliderProps } from './components/ui-components/Slider';

export { Toggle } from './components/ui-components/Toggle';
export type { ToggleProps, ToggleVariant } from './components/ui-components/Toggle';

export { TabsSwitcher } from './components/ui-components/TabsSwitcher';
export type {
  TabsSwitcherItem,
  TabsSwitcherProps,
  TabsSwitcherRadius,
  TabsSwitcherSize,
  TabsSwitcherViewMode,
} from './components/ui-components/TabsSwitcher';

export { Dropdown } from './components/ui-components/Dropdown';
export type {
  DropdownOption,
  DropdownProps,
  DropdownTriggerRenderProps,
} from './components/ui-components/Dropdown';

export {
  SearchableDropdown,
  searchableDropdownOptionClassName,
} from './components/ui-components/SearchableDropdown';
export type {
  SearchableDropdownOption,
  SearchableDropdownProps,
  SearchableDropdownTriggerRenderProps,
} from './components/ui-components/SearchableDropdown';

export { SearchSelect } from './components/ui-components/SearchSelect';
export type { SearchSelectOption, SearchSelectProps } from './components/ui-components/SearchSelect';

export { SearchInput } from './components/ui-components/SearchInput';
export type { SearchInputProps, SearchInputVariant } from './components/ui-components/SearchInput';

export { Loader } from './components/widgets/Loader';
export type { LoaderProps } from './components/widgets/Loader';

export {
  AuthFormDivider,
  AuthFormFooter,
  AuthFormHeader,
  AuthSignInContent,
  AuthSignInCornerBrand,
  AuthSignInLayout,
  SignInForm,
  signInSchema,
} from './components/widgets/AuthSignIn';
export type {
  AuthFormFooterProps,
  AuthFormHeaderProps,
  AuthSignInBrandProps,
  AuthSignInContentProps,
  AuthSignInCornerBrandProps,
  AuthSignInErrorPayload,
  AuthSignInLayoutProps,
  SignInFormData,
  SignInFormProps,
} from './components/widgets/AuthSignIn';

export {
  DEFAULT_ORGANIZATION_WELCOME_PATHS,
  FieldFlowLogoMark,
  ORGANIZATION_PICKER_QUERY,
  OrganizationWelcomeLayout,
  OrganizationWelcomePageContent,
  WelcomeHeroPanel,
  withOrganizationPickerAfterAuth,
  useOrganizationPickerFromQuery,
  defaultCmsWelcomeFeatures,
  defaultTileDesignWelcomeFeatures,
  getOrganizationWelcomePreset,
  FieldFlowProduct,
} from './components/widgets/OrganizationWelcome';
export type {
  OrganizationWelcomeLayoutProps,
  OrganizationWelcomePageContentProps,
  OrganizationWelcomePreset,
  UseOrganizationPickerFromQueryOptions,
  WelcomeHeroFeature,
  WelcomeHeroPanelProps,
} from './components/widgets/OrganizationWelcome';
export {
  FIELD_FLOW_AUTH_ROUTES,
  FIELD_FLOW_ORG_CREATE_ROUTE,
  FIELD_FLOW_ORG_ROUTE_PREFIX,
  SIGN_IN_FRESH_QUERY,
  isLegacyNumericOrgPath,
  isOrganizationScopedPath,
  isPathUnderOrg,
  isSignInFreshPath,
  orgScopedPath,
  relativeOrgAppPath,
  signInFreshPath,
} from './constants/fieldFlowAuthRoutes';

export {
  ChartContainer,
  ChartEmptyState,
  ChartLegend,
  FieldFlowBarChart,
  FieldFlowGroupedBarChart,
  FieldFlowTrendChart,
  FieldFlowRadialChart,
  CHART_SERIES_COLORS,
  getChartSeriesColor,
  hasChartValues,
  sumChartValues,
} from './components/widgets/Charts';
export type {
  ChartContainerProps,
  ChartEmptyStateProps,
  ChartLegendItem,
  ChartLegendProps,
  FieldFlowBarChartDatum,
  FieldFlowBarChartProps,
  FieldFlowGroupedBarChartDatum,
  FieldFlowGroupedBarChartProps,
  FieldFlowGroupedBarSeries,
  FieldFlowTrendChartDatum,
  FieldFlowTrendChartProps,
  FieldFlowTrendSeries,
  FieldFlowRadialChartCenterLabel,
  FieldFlowRadialChartDatum,
  FieldFlowRadialChartProps,
} from './components/widgets/Charts';

export { FileUpload } from './components/widgets/FileUpload';
export type { FileUploadProps } from './components/widgets/FileUpload';

export { DownloadedFile } from './components/widgets/DownloadedFile';
export type { DownloadedFileProps } from './components/widgets/DownloadedFile';

export { NotFound } from './components/widgets/NotFound';
export type { NotFoundProps } from './components/widgets/NotFound';

export { NavGroupLink } from './components/system-components/NavGroupLink';
export type { NavGroupLinkProps } from './components/system-components/NavGroupLink';

export { NavExpandableMenuItem } from './components/system-components/NavExpandableMenuItem';
export type {
  NavExpandableMenuChild,
  NavExpandableMenuItemProps,
} from './components/system-components/NavExpandableMenuItem';

export { SidebarHeader } from './components/system-components/SidebarHeader';
export type { SidebarHeaderProps } from './components/system-components/SidebarHeader';

export { SidebarCollapseButton } from './components/system-components/SidebarCollapseButton';
export { SidebarFooter } from './components/system-components/SidebarFooter';
export type {
  SidebarFooterAction,
  SidebarFooterProps,
  SidebarFooterUser,
} from './components/system-components/SidebarFooter';

export { AppBreadcrumbs } from './components/system-components/AppBreadcrumbs';
export type { AppBreadcrumbItem, AppBreadcrumbsProps } from './components/system-components/AppBreadcrumbs';

export { OrganizationSwitcherModal } from './components/widgets/OrganizationSwitcher';
export {
  OrganizationInfo,
  DeleteOrganization,
  OrganizationLogoMark,
} from './components/widgets/OrganizationSwitcher';
export {
  CreateOrganizationModal,
  OrganizationCreateForm,
} from './components/widgets/OrganizationSwitcher';
export type {
  CreateOrganizationModalProps,
  CreateOrganizationModalValues,
  OrganizationCreateFormProps,
  OrganizationCreateFormValues,
  OrganizationCreateFormInitialValues,
  OrganizationCreateFieldErrors,
  OrganizationLogoMarkProps,
  DeleteOrganizationProps,
  OrganizationInfoData,
  OrganizationInfoProps,
  OrganizationSwitcherItem,
  OrganizationSwitcherModalProps,
} from './components/widgets/OrganizationSwitcher';
export {
  FieldFlowOrganizationSourceEnum,
  mapOrganizationToFieldFlow,
  mapOrganizationsToFieldFlow,
  organizationSourceSupportsLogo,
} from './adapters/organization';
export { toOrganizationCreateFormData } from './adapters/organizationCreateFormData';
export type { FieldFlowOrganizationNormalized } from './adapters/organization';
export type {
  CmsOrganizationApiRecord,
  TileDesignOrganizationApiRecord,
} from './types/organization-api';

export {
  Table,
  TableBulkBar,
  TableColumnHeader,
  TableHeaderLabel,
  TableEmptyState,
  TableGridCard,
  TableGridView,
  TableKanbanView,
  TableListView,
  TablePagination,
  TableToolbar,
  TableToolbarPanel,
  TableReveal,
  TableViewSwitcher,
  TableViewModeEnum,
  TableVariantEnum,
  DEFAULT_TABLE_PAGE_SIZE,
  applyTableFilters,
  applyTableSearch,
  applyTableSort,
  clearTableFilters,
  clearTableSortRules,
  countActiveTableFilters,
  cycleTableColumnSort,
  getTableFilterValue,
  groupTableItemsByStatus,
  setTableFilterValue,
  toggleTableFilterOption,
  formatTableSortOrderingParam,
  serializeTableServerQuery,
  TableDataModeEnum,
  useServerTableQuery,
  useClientTableQuery,
  useTableColumnPreferences,
  useTablePreferences,
  applyColumnPreferences,
  createDefaultColumnPreferences,
  getTableColumnDefinitions,
  mergeColumnPreferences,
  moveColumnInPreferences,
  toggleColumnVisibility,
  reorderColumnInPreferences,
  buildKanbanMoveEvent,
  loadTableVariant,
  saveTableVariant,
} from './components/widgets/Table';
export type {
  Column,
  TableProps,
  BuildServerPaginationOptions,
  SerializeTableServerQueryOptions,
  TableDataMode,
  TableServerPaginationMeta,
  TableServerQuery,
  TableServerQueryParamNames,
  UseServerTableQueryOptions,
  ClientTableController,
  ClientTableListControls,
  ClientTableQueryState,
  ClientTableToolbarDefinition,
  UseClientTableQueryOptions,
  TableBulkAction,
  TableBulkBarProps,
  TableColumnHeaderProps,
  TableHeaderLabelProps,
  TableEmptyStateProps,
  TableFilterDefinition,
  TableFilterOption,
  TableFilterValue,
  TableGridCardProps,
  TableGridViewConfig,
  TableGridViewProps,
  TableItemRenderContext,
  TableKanbanColumnDefinition,
  TableKanbanViewConfig,
  TableKanbanViewProps,
  TableListViewProps,
  TablePaginationConfig,
  TablePaginationProps,
  TableSearchConfig,
  TableSortDirection,
  TableSortRule,
  TableSortableColumn,
  TableToolbarProps,
  TableToolbarPanelProps,
  TableRefinementPersistence,
  TableRevealProps,
  TableViewMode,
  TableViewSwitcherProps,
  TableVariant,
  TableColumnDefinition,
  TableColumnPreferences,
  TableColumnEditorConfig,
  TableSettingsConfig,
  TableKanbanMoveEvent,
  UseTableColumnPreferencesOptions,
  UseTableColumnPreferencesResult,
  UseTablePreferencesOptions,
  UseTablePreferencesResult,
} from './components/widgets/Table';

export {
  TableActions,
  TABLE_ACTIONS_TOUCH_LAYOUT_MEDIA_QUERY,
  tableActionIcons,
} from './components/widgets/TableActions';
export type { TableAction, TableActionsProps } from './components/widgets/TableActions';
export { Archive, Eye, MoreHorizontal, Pencil, Trash2 } from './components/widgets/TableActions';

export { LocationPicker } from './components/map-components';
export type { LocationPickerProps, Point as LocationPoint } from './components/map-components';
export { LocationPickerMap, MapZoomControls } from './components/map-components';
export type { MapZoomControlsProps } from './components/map-components';

export { ThemeControls } from './components/widgets/ThemeControls';
export type {
  ThemeControlsAppearanceStyle,
  ThemeControlsProps,
} from './components/widgets/ThemeControls';

export { Overlay } from './components/system-components/Overlay';
export type { OverlayProps } from './components/system-components/Overlay';

export { Modal } from './components/system-components/Modal';
export type { ModalProps, ModalSize } from './components/system-components/Modal';

export { AppFormModal } from './components/system-components/AppFormModal';
export type { AppFormModalProps } from './components/system-components/AppFormModal';

export { FieldFlowAppLayout } from './components/system-components/AppLayout';
export { createFieldFlowToolsConfig } from './components/system-components/AppLayout';
export { createFieldFlowSettingsConfigFromTools } from './components/system-components/AppLayout';
export {
  FIELD_FLOW_APP_LAYOUT_MOBILE_MEDIA_QUERY,
  FIELD_FLOW_APP_LAYOUT_MOBILE_SIDEBAR_WIDTH_PX,
} from './components/system-components/AppLayout';
export type {
  CreateFieldFlowSettingsConfigFromToolsOptions,
  CreateFieldFlowToolsConfigOptions,
  FieldFlowAppLayoutProps,
  FieldFlowOrganizationSettingsConfig,
  FieldFlowSidebarGroup,
  FieldFlowSidebarLink,
  FieldFlowSidebarNavRenderArgs,
  FieldFlowToolsConfig,
  FieldFlowUserSettingsConfig,
  FieldFlowUserMenuAction,
} from './components/system-components/AppLayout';

export {
  FieldFlowSettingsLayout,
  FieldFlowSettingsPageLayout,
  createDefaultSettingsConfig,
} from './components/system-components/SettingsLayout';
export type {
  CreateSettingsConfigOptions,
  FieldFlowSettingsConfig,
  FieldFlowSettingsLayoutProps,
  FieldFlowSettingsLink,
  FieldFlowSettingsPageLayoutProps,
  FieldFlowSettingsSection,
} from './components/system-components/SettingsLayout';

export { Dialog, DeleteDialog } from './components/system-components/Dialog';
export type { DialogProps, DeleteDialogProps } from './components/system-components/Dialog';

export { DynamicFavicon } from './components/system-components/DynamicFavicon';
export type { DynamicFaviconProps } from './components/system-components/DynamicFavicon';

// Shared enums/constants
export {
  ButtonVariantEnum,
  ComponentSizeEnum,
  CornerRadiusEnum,
  SurfaceVariantEnum,
  TabsSwitcherViewEnum,
  ThemeControlsAppearanceStyleEnum,
  ThemeControlsOrientationEnum,
  ThemeModeEnum,
} from './constants';
export type {
  ButtonVariant,
  ComponentSize,
  CornerRadius,
  SurfaceVariant,
  TabsSwitcherView,
  ThemeControlsAppearanceStyle as ThemeControlsAppearanceStyleValue,
  ThemeControlsOrientation,
} from './constants';

// Utils
export { cn } from './utils/cn';
export { getAccentTextColor, toAccentLight } from './utils/accent';

// Grouped component exports for easier discovery
export * as UIComponents from './components/ui-components';
export * as Widgets from './components/widgets';
export * as SystemComponents from './components/system-components';
export * as MapComponents from './components/map-components';

// Theme
export {
  ACCENT_PRESET_PALETTE,
  colors,
  darkTheme,
  lightTheme,
  nightTheme,
  resolveThemeMode,
  theme,
  ThemeProvider,
  tokens,
  useTheme,
} from './theme';
export type {
  AccentPreset,
  Colors,
  ResolvedThemeMode,
  Theme,
  ThemeMode,
  ThemeProviderProps,
  ThemeTransitionOptions,
  Tokens,
} from './theme';

