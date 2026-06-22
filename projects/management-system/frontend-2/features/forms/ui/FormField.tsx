"use client";

import { useEffect, useState } from "react";
import {
  Controller,
  type FieldError,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form";

import { Button, ButtonVariantEnum, cn } from "@fieldflow360/org-ui";
import { Loader2, X } from "lucide-react";

import {
  TEAM_MEMBER_DROPDOWN_CONTENT_CLASS,
  TEAM_MEMBER_DROPDOWN_TRIGGER_CLASS,
} from "@/features/team/constants/teamMemberDropdown";
import { Dropdown, DropdownItem } from "@/shared/ui/common";
import {
  Label,
  SanitizedInput,
  SanitizedTextarea,
} from "@/shared/ui/primitives";

import type { FormField as FormFieldType, SelectOption } from "./types";

interface FormFieldProps {
  field: FormFieldType;
  isVisible: boolean;
  isDisabled: boolean;
}

export function FormField({ field, isVisible, isDisabled }: FormFieldProps) {
  const formContext = useFormContext();
  const {
    control,
    watch,
    formState: { errors },
  } = formContext;

  const error = errors[field.name] as FieldError | undefined;
  const errorMessage = error?.message as string | undefined;
  const formValues = watch();

  // Check if field should be visible based on dependency
  if (!isVisible) {
    return null;
  }

  const fieldDisabled = Boolean(isDisabled || field.disabled);

  const renderField = () => {
    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        return (
          <Controller
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <SanitizedInput
                {...formField}
                aria-describedby={
                  errorMessage ? `${field.name}-error` : undefined
                }
                aria-invalid={!!error}
                className={cn("w-full", error && "border-feedback-error")}
                disabled={fieldDisabled}
                id={field.name}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                type={field.type}
              />
            )}
          />
        );

      case "number":
        return (
          <Controller
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <SanitizedInput
                {...formField}
                aria-describedby={
                  errorMessage ? `${field.name}-error` : undefined
                }
                aria-invalid={!!error}
                className={cn("w-full", error && "border-feedback-error")}
                disabled={fieldDisabled}
                id={field.name}
                max={field.max}
                min={field.min}
                placeholder={field.placeholder}
                type="number"
                onChange={(e) => {
                  const value = e.target.value;
                  // Handle empty string as undefined for optional number fields
                  if (value === "") {
                    formField.onChange(undefined);
                  } else {
                    const numValue = Number(value);
                    formField.onChange(isNaN(numValue) ? undefined : numValue);
                  }
                }}
              />
            )}
          />
        );

      case "textarea":
        return (
          <Controller
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <SanitizedTextarea
                {...formField}
                aria-describedby={
                  errorMessage ? `${field.name}-error` : undefined
                }
                aria-invalid={!!error}
                className={cn(
                  "placeholder:text-text-muted placeholder:text-md mt-1 mt-4 w-full p-4",
                  error && "border-feedback-error"
                )}
                disabled={fieldDisabled}
                id={field.name}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
              />
            )}
          />
        );

      case "select":
        return (
          <SelectField
            error={error}
            errorMessage={errorMessage}
            field={field}
            fieldDisabled={fieldDisabled}
            formValues={formValues}
          />
        );

      case "multiselect":
        return (
          <MultiSelectField
            error={error}
            errorMessage={errorMessage}
            field={field}
            fieldDisabled={fieldDisabled}
            formValues={formValues}
          />
        );

      case "custom":
        if (!field.customComponent) {
          console.warn(
            `Field ${field.name} has type "custom" but no customComponent provided`
          );
          return null;
        }
        return (
          <Controller
            control={control}
            name={field.name}
            render={({ field: formField }) => {
              const rendered = field.customComponent!({
                value: formField.value,
                onChange: formField.onChange,
                field,
                formValues,
                formMethods: formContext as UseFormReturn<
                  Record<string, unknown>
                >,
                error,
                disabled: fieldDisabled,
              });
              // Wrap in fragment to ensure ReactElement type
              return <>{rendered}</>;
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {!field.hideLabel && (
        <Label
          className={cn(
            field.required &&
              !field.hideRequiredIndicator &&
              "after:text-feedback-error after:ml-0.5 after:content-['*']"
          )}
          htmlFor={field.name}
          variant="form"
        >
          {field.label}
        </Label>
      )}
      {field.type === "textarea" ? (
        renderField()
      ) : field.type === "custom" ? (
        <div className={field.hideLabel ? "" : "my-2"}>{renderField()}</div>
      ) : (
        <div className={field.hideLabel ? "" : "mt-2"}>{renderField()}</div>
      )}
      {field.description && !errorMessage && (
        <p className="text-text-muted mt-1 text-sm">{field.description}</p>
      )}
      {errorMessage && (
        <p
          className="text-feedback-error mt-1 text-sm"
          id={`${field.name}-error`}
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

/**
 * Select field component with async options support using Dropdown
 */
function SelectField({
  field,
  fieldDisabled,
  error,
  formValues,
}: {
  field: FormFieldType;
  fieldDisabled: boolean;
  error: FieldError | undefined;
  errorMessage?: string;
  formValues: Record<string, unknown>;
}) {
  const { control } = useFormContext();
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load options (sync or async) - re-run when formValues change for dynamic options
  useEffect(() => {
    if (!field.options) {
      setOptions([]);
      return;
    }

    if (typeof field.options === "function") {
      // Async options - can depend on form values
      setIsLoadingOptions(true);
      field
        .options(formValues)
        .then((loadedOptions) => {
          setOptions(loadedOptions);
          setIsLoadingOptions(false);
        })
        .catch((err) => {
          console.error(`Error loading options for field ${field.name}:`, err);
          setOptions([]);
          setIsLoadingOptions(false);
        });
    } else {
      // Sync options
      setOptions(field.options);
    }
  }, [field, formValues]);

  // Convert options to DropdownItem format
  const dropdownItems: DropdownItem[] = options.map((option) => ({
    id: option.value.toString(),
    label: option.label,
  }));

  const widenTeamMemberDropdown = options.some((o) => o.accessibilityLabel);

  // Add action button as header if provided
  const headerContent = field.selectActionButton ? (
    <div className="border-b px-2 py-1">
      <Button
        aria-label={field.selectActionButton.label}
        className="w-full justify-start"
        leftIcon={
          field.selectActionButton.icon ? (
            <span className="mr-2">{field.selectActionButton.icon}</span>
          ) : undefined
        }
        title={field.selectActionButton.label}
        variant={ButtonVariantEnum.GHOST}
        onClick={() => field.selectActionButton!.onClick(formValues)}
      />
    </div>
  ) : undefined;

  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: formField }) => {
        return (
          <div className={cn(error && "[&_button]:border-feedback-error")}>
            {isLoadingOptions ? (
              <div
                className={cn(
                  "dark:bg-bg-surface/30 border-border-subtle flex h-10 w-full items-center justify-center rounded-md border bg-transparent",
                  error && "border-feedback-error"
                )}
              >
                <Loader2 className="text-text-muted h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Dropdown
                align="start"
                contentClassName={cn(
                  "max-h-[300px] overflow-y-auto",
                  widenTeamMemberDropdown && TEAM_MEMBER_DROPDOWN_CONTENT_CLASS
                )}
                disabled={fieldDisabled || isLoadingOptions}
                header={headerContent}
                items={dropdownItems}
                mode="select"
                placeholder={field.placeholder || "Select..."}
                selectedValue={formField.value?.toString() || ""}
                triggerClassName={
                  widenTeamMemberDropdown
                    ? TEAM_MEMBER_DROPDOWN_TRIGGER_CLASS
                    : undefined
                }
                width="full"
                onValueChange={formField.onChange}
              />
            )}
          </div>
        );
      }}
    />
  );
}

function selectOptionRemoveAriaLabel(option: SelectOption): string {
  if (typeof option.label === "string") return option.label;
  return option.accessibilityLabel ?? String(option.value);
}

/**
 * Multi-select field component with async options support using Dropdown
 */
function MultiSelectField({
  field,
  fieldDisabled,
  error,
}: {
  field: FormFieldType;
  fieldDisabled: boolean;
  error: FieldError | undefined;
  errorMessage?: string;
  formValues?: Record<string, unknown>;
}) {
  const { control, watch } = useFormContext();
  const formValues = watch();
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Load options (sync or async) - re-run when formValues change for dynamic options
  useEffect(() => {
    if (!field.options) {
      setOptions([]);
      return;
    }

    if (typeof field.options === "function") {
      // Async options - can depend on form values
      setIsLoadingOptions(true);
      field
        .options(formValues)
        .then((loadedOptions) => {
          setOptions(loadedOptions);
          setIsLoadingOptions(false);
        })
        .catch((err) => {
          console.error(`Error loading options for field ${field.name}:`, err);
          setOptions([]);
          setIsLoadingOptions(false);
        });
    } else {
      // Sync options
      setOptions(field.options);
    }
  }, [field, formValues]);

  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: formField }) => {
        const selectedValues = Array.isArray(formField.value)
          ? formField.value
          : [];
        const selectedOptions = selectedValues
          .map((val) =>
            options.find((opt) => opt.value.toString() === val.toString())
          )
          .filter(Boolean) as SelectOption[];

        const handleSelect = (value: string) => {
          const currentValues = Array.isArray(formField.value)
            ? formField.value
            : [];
          if (!currentValues.includes(value)) {
            formField.onChange([...currentValues, value]);
          }
        };

        const handleRemove = (value: string | number) => {
          const currentValues = Array.isArray(formField.value)
            ? formField.value
            : [];
          formField.onChange(
            currentValues.filter((val) => val.toString() !== value.toString())
          );
        };

        // Filter out already selected options for the dropdown
        const availableOptions = options.filter(
          (opt) => !selectedValues.map(String).includes(opt.value.toString())
        );

        const dropdownItems: DropdownItem[] = availableOptions.map(
          (option) => ({
            id: option.value.toString(),
            label: option.label,
          })
        );

        const widenTeamMemberDropdown = options.some(
          (o) => o.accessibilityLabel
        );

        // Create display text for selected items
        const selectedCount = selectedOptions.length;
        const displayText =
          selectedCount > 0 ? `${selectedCount} selected` : undefined;

        // Check if all options are selected
        const allSelected = availableOptions.length === 0 && options.length > 0;

        return (
          <div className="space-y-2">
            <div className={cn(error && "[&_button]:border-feedback-error")}>
              {isLoadingOptions ? (
                <div
                  className={cn(
                    "dark:bg-bg-surface/30 border-border-subtle flex h-10 w-full items-center justify-center rounded-md border bg-transparent",
                    error && "border-feedback-error"
                  )}
                >
                  <Loader2 className="text-text-muted h-4 w-4 animate-spin" />
                </div>
              ) : allSelected ? (
                <div
                  className={cn(
                    "dark:bg-bg-surface/30 border-border-subtle text-text-muted flex h-10 w-full items-center rounded-md border bg-transparent px-3 py-2 text-sm",
                    error && "border-feedback-error"
                  )}
                >
                  All options selected
                </div>
              ) : (
                <Dropdown
                  align="start"
                  contentClassName={cn(
                    "max-h-[300px] overflow-y-auto",
                    widenTeamMemberDropdown &&
                      TEAM_MEMBER_DROPDOWN_CONTENT_CLASS
                  )}
                  disabled={fieldDisabled || isLoadingOptions}
                  items={dropdownItems}
                  mode="select"
                  placeholder={
                    displayText || field.placeholder || "Select options..."
                  }
                  selectedValue=""
                  triggerClassName={
                    widenTeamMemberDropdown
                      ? TEAM_MEMBER_DROPDOWN_TRIGGER_CLASS
                      : undefined
                  }
                  width="full"
                  onValueChange={handleSelect}
                />
              )}
            </div>
            {selectedOptions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedOptions.map((option) => (
                  <div
                    key={option.value.toString()}
                    className="bg-accent text-text-primary flex items-center gap-2 rounded-md px-2 py-1"
                  >
                    <span className="text-sm">{option.label}</span>
                    <button
                      aria-label={`Remove ${selectOptionRemoveAriaLabel(option)}`}
                      className="hover:bg-accent/80 rounded-full p-0.5 transition-colors"
                      disabled={fieldDisabled}
                      type="button"
                      onClick={() => handleRemove(option.value)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
