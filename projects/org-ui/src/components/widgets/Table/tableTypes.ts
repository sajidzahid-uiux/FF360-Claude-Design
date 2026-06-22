export type TableSortDirection = 'asc' | 'desc';

export interface TableSortRule {
  columnKey: string;
  direction: TableSortDirection;
}

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilterDefinition {
  id: string;
  label: string;
  options: TableFilterOption[];
  /** When true, multiple option values can be active for this filter. Default true. */
  multiple?: boolean;
}

export interface TableFilterValue {
  filterId: string;
  values: string[];
}

export interface TableSearchConfig {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
