import { ReactNode } from "react";

import { DropdownItem } from "../Dropdown/types";

/**
 * Status badge configuration
 */
export interface GenericCardStatus {
  label: string;
  color: string;
}

/**
 * Field (label-value pair) for the card
 */
export interface GenericCardField {
  label: string;
  value: ReactNode;
  /** Stack label above value (e.g. multi-line Clients and Farms). */
  layout?: "inline" | "stack";
  /** Render value only (e.g. Clients and Farms uses row icons instead of a label). */
  hideLabel?: boolean;
}

/**
 * Progress bar configuration
 */
export interface GenericCardProgress {
  value: number; // 0-100
  label?: string; // e.g., "5/5"
}

/**
 * Inline status editing configuration for grid cards
 */
export interface GenericCardStatusEditable {
  statusTypes: Array<{ id: number; title: string; color?: string }>;
  currentStatus:
    | { id: number; title: string; color?: string }
    | number
    | null
    | undefined;
  onStatusChange: (statusId: number) => void;
  disabled?: boolean;
  labelMatch?: string;
}

/**
 * Props for GenericCard component
 */
export interface GenericCardProps {
  // Content
  title: ReactNode;
  subtitle?: ReactNode;
  status?: GenericCardStatus | GenericCardStatus[];
  statusEditable?: GenericCardStatusEditable;
  fields?: GenericCardField[];
  /** Min-height for the fields block when optional rows are omitted. */
  fieldsMinHeight?: string;
  progress?: GenericCardProgress;

  // Visual
  leading?: ReactNode; // e.g., avatar, thumbnail
  borderHighlight?: boolean; // e.g., yellow border for on-hold items
  borderColor?: string; // e.g., "#eab308" for yellow
  className?: string;

  // Interaction
  onClick?: () => void;
  onDoubleClick?: () => void;

  // Selection
  selected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
  showCheckbox?: boolean;
  checkboxDisabled?: boolean;

  // Actions
  actionItems: DropdownItem[];

  // Metadata (e.g., "Last updated: 2024-01-29 by John Doe")
  metadata?: ReactNode;
}
