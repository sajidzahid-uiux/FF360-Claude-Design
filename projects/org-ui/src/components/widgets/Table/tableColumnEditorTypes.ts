import type {
  TableColumnDefinition,
  TableColumnPreferences,
} from './tableColumnPreferences';

export interface TableColumnEditorConfig {
  definitions: TableColumnDefinition[];
  preferences: TableColumnPreferences;
  onPreferencesChange: (preferences: TableColumnPreferences) => void;
  onReset?: () => void;
}
