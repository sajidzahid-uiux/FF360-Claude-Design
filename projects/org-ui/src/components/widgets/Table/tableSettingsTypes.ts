import type { TableColumnEditorConfig } from './tableColumnEditorTypes';
import type { TableVariant } from './tableVariantTypes';

export interface TableSettingsConfig {
  columnEditor: TableColumnEditorConfig;
  variant: TableVariant;
  onVariantChange: (variant: TableVariant) => void;
  /** Used by Reset to restore the table shell variant. */
  defaultVariant?: TableVariant;
}
