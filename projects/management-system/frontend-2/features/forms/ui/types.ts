import type { ReactNode } from "react";
import type { FieldError, UseFormReturn } from "react-hook-form";

import { z } from "zod";

import type { PermissionResource } from "@/hooks/permissions";

/**
 * Supported field types in the form system
 */
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "multiselect"
  | "custom"; // Custom component type

/**
 * Permission configuration for a field
 */
export interface FieldPermissions {
  read?: string; // Permission code required to read/view the field
  write?: string; // Permission code required to write/edit the field
  hideIfNoRead?: boolean; // Hide field if user doesn't have read permission
  disableIfNoWrite?: boolean; // Disable field if user doesn't have write permission
}

/**
 * Field dependency configuration
 */
export interface FieldDependency {
  field: string; // Name of the field this depends on
  condition: (value: unknown) => boolean; // Function to check if condition is met
  showWhen: boolean; // When condition === showWhen, dependency is considered satisfied
  effect?: "visibility" | "disabled"; // Default: "visibility"
}

/**
 * Select option type
 */
export interface SelectOption {
  label: ReactNode;
  value: string | number;
  /** For aria-label when `label` is not a plain string */
  accessibilityLabel?: string;
}

/**
 * Action button in select dropdown
 */
export interface SelectActionButton {
  label: string;
  onClick: (formValues: Record<string, unknown>) => void;
  icon?: ReactNode;
}

/**
 * Custom component render function
 */
export type CustomFieldRenderer = (props: {
  value: unknown;
  onChange: (value: unknown) => void;
  field: FormField;
  formValues: Record<string, unknown>;
  formMethods: UseFormReturn<Record<string, unknown>>;
  error?: FieldError;
  disabled?: boolean;
}) => ReactNode;

/**
 * Form field definition
 */
export interface FormField {
  name: string; // Field name (used as key in form data)
  label: string; // Display label
  type: FieldType; // Field type
  required?: boolean; // Is field required
  placeholder?: string; // Placeholder text
  defaultValue?: unknown; // Default value
  validation?: z.ZodSchema; // Zod validation schema for this field
  maxLength?: number; // Maximum character length
  min?: number; // Minimum value (for number fields)
  max?: number; // Maximum value (for number fields)
  permissions?: FieldPermissions; // Permission configuration
  dependsOn?: FieldDependency; // Field dependency
  options?:
    | SelectOption[]
    | ((formValues: Record<string, unknown>) => Promise<SelectOption[]>); // Options for select fields (can depend on form values)
  disabled?: boolean; // Is field disabled
  description?: string; // Help text/description
  multiple?: boolean; // For select fields, allow multiple selection (deprecated, use type: "multiselect")
  // Custom component support
  customComponent?: CustomFieldRenderer; // Custom render function for type: "custom"
  // Select action buttons (e.g., "Create New Farm")
  selectActionButton?: SelectActionButton; // Action button to show in select dropdown
  // Custom label rendering (for fields without standard labels)
  hideLabel?: boolean; // Hide the label (useful for custom components that render their own)
  hideRequiredIndicator?: boolean; // Hide the asterisk even if field is required
  /** When true, email field accepts empty string without validating format (for optional email) */
  skipEmailValidationWhenEmpty?: boolean;
}

/**
 * Permission configuration for a section
 */
export interface SectionPermissions {
  read?: string; // Permission code required to read/view the section
  write?: string; // Permission code required to write/edit the section
  hideIfNoRead?: boolean; // Hide section if user doesn't have read permission
  disableIfNoWrite?: boolean; // Disable all fields in section if user doesn't have write permission
}

/**
 * Form section for grouping fields
 */
export interface FormSection {
  id: string; // Unique section identifier
  title?: string; // Section title
  fields: FormField[]; // Fields in this section
  permissions?: SectionPermissions; // Permission configuration for the section
  collapsible?: boolean; // Make section collapsible
  defaultCollapsed?: boolean; // Default collapsed state (default: true)
  showSeparator?: boolean; // Show separator before this section
  useCard?: boolean; // Wrap section in Card (default: true)
  className?: string; // CSS classes for section wrapper when useCard is false
}

/**
 * Form schema configuration
 */
export interface FormSchema {
  id: string; // Unique form identifier
  sections: FormSection[]; // Form sections
  submitButton?: {
    label?: string; // Submit button label
    loadingLabel?: string; // Label when submitting
    show?: boolean; // Show submit button (default: true)
    className?: string; // CSS classes for submit button
  };
  cancelButton?: {
    label?: string; // Cancel button label
    show?: boolean; // Show cancel button
    className?: string; // CSS classes for cancel button
  };
}

/**
 * GenericForm component props
 */
export interface GenericFormProps {
  schema: FormSchema; // Form schema configuration
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>; // Submit handler
  onCancel?: () => void; // Cancel handler
  initialValues?: Record<string, unknown>; // Initial form values
  isLoading?: boolean; // Loading state
  className?: string; // Additional CSS classes
  permissionResource?: PermissionResource; // Base permission resource for the form
  onFormReady?: (formMethods: UseFormReturn<Record<string, unknown>>) => void; // Callback to get form methods for accessing values
  onSuccess?: (values: Record<string, unknown>) => void; // Success callback
  onError?: (error: unknown) => void; // Error callback
  successMessage?: string; // Custom success message
  errorMessage?: string; // Custom error message
  showSuccessToast?: boolean; // Show success toast (default: true)
  showErrorToast?: boolean; // Show error toast (default: true)
  resetOnSuccess?: boolean; // Reset form on successful submission (default: false)
  // Modal wrapper support
  modalTitle?: string; // Title for modal wrapper
  showModal?: boolean; // Wrap form in modal (default: false)
  modalClassName?: string; // Additional classes for modal
  // Submit button disable condition
  disableSubmitWhen?: (formValues: Record<string, unknown>) => boolean; // Function to determine when submit should be disabled
  // Read-only mode: same form UI but all fields disabled, submit/cancel hidden
  readOnly?: boolean;
  /** Render fields inside a parent form (e.g. org-ui AppFormModal) without a nested form element. */
  embedInParentForm?: boolean;
}
