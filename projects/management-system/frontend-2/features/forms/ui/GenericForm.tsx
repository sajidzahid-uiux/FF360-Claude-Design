"use client";

import { useEffect, useMemo, useState } from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";

import { Button, ButtonVariantEnum, cn } from "@fieldflow360/org-ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  applyZodIssuesToForm,
  extractApiErrorPayload,
  getErrorMessage,
  mapContactDetailsToFieldErrors,
  parseErrorDetails,
} from "@/features/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives/card";
import { Separator } from "@/shared/ui/primitives/separator";

import { FormField } from "./FormField";
import type {
  FormField as FormFieldType,
  FormSection,
  GenericFormProps,
} from "./types";
import {
  checkFieldPermissions,
  checkSectionPermissions,
  useFormPermissions,
} from "./utils/permissions";

function buildZodSchema(fields: FormFieldType[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    if (field.validation) {
      fieldSchema = field.validation;
    } else {
      switch (field.type) {
        case "text":
        case "textarea": {
          let textSchema: z.ZodString = z.string();
          if (field.maxLength) {
            textSchema = textSchema.max(
              field.maxLength,
              `Maximum ${field.maxLength} characters allowed`
            );
          }
          fieldSchema = textSchema;
          break;
        }
        case "email": {
          let emailSchema: z.ZodString = z
            .string()
            .email("Please enter a valid email address");
          if (field.maxLength) {
            emailSchema = emailSchema.max(
              field.maxLength,
              `Maximum ${field.maxLength} characters allowed`
            );
          }
          // Allow empty string only when optional and prop set (form often sends "" not undefined)
          if (field.skipEmailValidationWhenEmpty && !field.required) {
            fieldSchema = z.union([z.literal(""), emailSchema]);
          } else {
            fieldSchema = emailSchema;
          }
          break;
        }
        case "tel": {
          let telSchema: z.ZodString = z.string();
          if (field.maxLength) {
            telSchema = telSchema.max(
              field.maxLength,
              `Maximum ${field.maxLength} characters allowed`
            );
          }
          fieldSchema = telSchema;
          break;
        }
        case "number": {
          let numberSchema: z.ZodTypeAny = z
            .string()
            .transform((val) => {
              if (val === "" || val === undefined) return undefined;
              const num = Number(val);
              return Number.isNaN(num) ? undefined : num;
            })
            .pipe(z.number().optional());

          if (field.min !== undefined || field.max !== undefined) {
            numberSchema = numberSchema.refine(
              (val) => {
                const numVal = val as number | undefined;
                if (numVal === undefined || numVal === null) return true;
                if (field.min !== undefined && numVal < field.min) return false;
                if (field.max !== undefined && numVal > field.max) return false;
                return true;
              },
              {
                message:
                  field.min !== undefined && field.max !== undefined
                    ? `Value must be between ${field.min} and ${field.max}`
                    : field.min !== undefined
                      ? `Minimum value is ${field.min}`
                      : `Maximum value is ${field.max}`,
              }
            );
          }

          fieldSchema = numberSchema;
          break;
        }
        case "select":
          fieldSchema = z.string().or(z.number());
          break;
        case "multiselect":
          fieldSchema = z.array(z.string().or(z.number()));
          break;
        case "custom": {
          fieldSchema = field.validation ?? z.unknown();
          break;
        }
        default:
          fieldSchema = z.string();
      }

      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      } else {
        if (field.type !== "custom") {
          if (
            field.type === "text" ||
            field.type === "email" ||
            field.type === "tel" ||
            field.type === "textarea"
          ) {
            fieldSchema = (fieldSchema as z.ZodString).min(
              1,
              `${field.label} is required`
            );
          } else if (field.type === "number") {
            fieldSchema = (fieldSchema as z.ZodNumber).refine(
              (val) => val !== undefined && val !== null,
              { message: `${field.label} is required` }
            ) as z.ZodTypeAny;
          } else if (field.type === "select") {
            fieldSchema = fieldSchema.refine(
              (val) => val !== undefined && val !== null && val !== "",
              { message: `${field.label} is required` }
            );
          } else if (field.type === "multiselect") {
            fieldSchema = (fieldSchema as z.ZodArray<z.ZodTypeAny>).min(
              1,
              `${field.label} is required`
            );
          }
        }
      }
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
}

function parseApiErrors(
  error: unknown,
  setError: (name: string, error: { type: string; message: string }) => void
) {
  const errorData = extractApiErrorPayload(error);
  if (!errorData) return null;

  const details = parseErrorDetails(errorData.details);
  const fieldErrors = mapContactDetailsToFieldErrors(details);
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field, { type: "server", message });
  });
  if (Object.keys(fieldErrors).length > 0) return fieldErrors;
  return null;
}

export function GenericForm({
  schema,
  onSubmit,
  onCancel,
  initialValues = {},
  isLoading = false,
  className,
  permissionResource,
  onFormReady,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  showSuccessToast = false,
  showErrorToast = true,
  resetOnSuccess = false,
  modalTitle,
  showModal = false,
  modalClassName,
  disableSubmitWhen,
  readOnly = false,
  embedInParentForm = false,
}: GenericFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => {
      const initial = new Set<string>();
      schema.sections.forEach((section) => {
        if (section.collapsible && section.defaultCollapsed !== false) {
          initial.add(section.id);
        }
      });
      return initial;
    }
  );

  const allFields = useMemo(
    () => schema.sections.flatMap((section) => section.fields),
    [schema]
  );

  const formSchema = useMemo(() => buildZodSchema(allFields), [allFields]);

  type FormValues = Record<string, unknown>;

  const resolver = useMemo(
    () => zodResolver(formSchema) as unknown as Resolver<FormValues>,
    [formSchema]
  );

  const methods = useForm<FormValues>({
    resolver,
    defaultValues: initialValues,
  });

  const { handleSubmit, watch, reset, setError } = methods;

  const isFormLoading = isLoading || internalLoading;

  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const watchedValues = watch();

  const { permissionCodes: allPermissionCodes } = useFormPermissions();

  const isFieldVisible = (field: FormFieldType): boolean => {
    if (!field.dependsOn) return true;

    const { field: depField, condition, showWhen, effect } = field.dependsOn;
    const dependentValue = watchedValues[depField];
    const conditionMet = condition(dependentValue);

    if (effect === "disabled") return true;
    return conditionMet === showWhen;
  };

  const isFieldDisabledByDependency = (field: FormFieldType): boolean => {
    if (!field.dependsOn || field.dependsOn.effect !== "disabled") return false;

    const { field: depField, condition, showWhen } = field.dependsOn;
    const dependentValue = watchedValues[depField];
    const conditionMet = condition(dependentValue);

    return conditionMet !== showWhen;
  };

  const getFieldPermissionState = (field: FormFieldType) => {
    if (!permissionResource || !field.permissions) {
      return {
        isVisible: true,
        isDisabled: field.disabled || false,
      };
    }

    const fieldPerms = checkFieldPermissions(
      allPermissionCodes,
      field.permissions,
      permissionResource
    );

    return {
      isVisible: !fieldPerms.shouldHide,
      isDisabled: field.disabled || fieldPerms.shouldDisable,
    };
  };

  const getSectionPermissionState = (section: FormSection) => {
    if (!permissionResource || !section.permissions) {
      return {
        isVisible: true,
        shouldDisableFields: false,
      };
    }

    const sectionPerms = checkSectionPermissions(
      allPermissionCodes,
      section.permissions,
      permissionResource
    );

    return {
      isVisible: !sectionPerms.shouldHide,
      shouldDisableFields: sectionPerms.shouldDisable,
    };
  };

  const onSubmitHandler = async (data: Record<string, unknown>) => {
    setFormError(null);
    setInternalLoading(true);

    try {
      await onSubmit(data);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      if (onSuccess) onSuccess(data);

      if (resetOnSuccess) {
        reset(initialValues);
      }
    } catch (error: unknown) {
      const fieldErrors = parseApiErrors(error, setError);

      const errorMsg =
        errorMessage ||
        getErrorMessage(error) ||
        "Failed to submit form. Please check the errors and try again.";

      if (!fieldErrors || Object.keys(fieldErrors).length === 0) {
        setFormError(errorMsg);
      }

      if (showErrorToast) {
        toast.error(errorMsg);
      }

      if (onError) onError(error);
    } finally {
      setInternalLoading(false);
    }
  };

  const onInvalidHandler = (_errors: Record<string, unknown>) => {
    console.error("Form validation errors:", _errors);
  };

  const submitWithValidation = handleSubmit(onSubmitHandler, onInvalidHandler);

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    try {
      const maybePromise = submitWithValidation(e);
      Promise.resolve(maybePromise).catch((err: unknown) => {
        applyZodIssuesToForm(err, setError);
      });
    } catch (err: unknown) {
      void err;
    }
  };

  useEffect(() => {
    if (onFormReady) {
      onFormReady(methods);
    }
  }, [onFormReady, methods]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const isSectionCollapsed = (sectionId: string) =>
    collapsedSections.has(sectionId);

  const renderFormContent = () => {
    const FormWrapper = embedInParentForm ? "div" : "form";
    const formWrapperProps = embedInParentForm
      ? {
          className: cn(isFormLoading && "pointer-events-none opacity-60"),
        }
      : {
          noValidate: true as const,
          className: cn(isFormLoading && "pointer-events-none opacity-60"),
          onSubmit: onFormSubmit,
        };

    return (
      <FormWrapper {...(formWrapperProps as React.HTMLAttributes<HTMLElement>)}>
        {schema.sections.map((section, sectionIndex) => {
          const sectionPermState = getSectionPermissionState(section);
          if (!sectionPermState.isVisible) return null;

          const isCollapsed =
            section.collapsible && isSectionCollapsed(section.id);

          return (
            <div key={section.id}>
              {section.showSeparator && sectionIndex > 0 && (
                <Separator className="bg-border my-4 h-[1px] w-full" />
              )}

              {section.collapsible ? (
                <button
                  className="flex w-full items-center gap-2 text-base font-semibold focus:outline-none"
                  type="button"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex w-full items-center justify-between">
                    <label className="text-text-primary text-[20px] font-semibold">
                      {section.title || "Section"}
                    </label>
                    {isCollapsed ? (
                      <ChevronDown className="text-text-muted" size={20} />
                    ) : (
                      <ChevronUp className="text-text-muted" size={20} />
                    )}
                  </div>
                </button>
              ) : section.useCard === false ? (
                <div className={cn("mb-4", section.className ?? "space-y-4")}>
                  {section.title && (
                    <label className="text-text-primary mb-2 block text-[20px] font-semibold">
                      {section.title}
                    </label>
                  )}
                  <div className="space-y-4">
                    {section.fields.map((field) => {
                      const visible = isFieldVisible(field);
                      const perms = getFieldPermissionState(field);
                      const depDisabled = isFieldDisabledByDependency(field);

                      const finalVisible = visible && perms.isVisible;
                      const finalDisabled =
                        readOnly ||
                        perms.isDisabled ||
                        sectionPermState.shouldDisableFields ||
                        depDisabled;

                      return (
                        <FormField
                          key={field.name}
                          field={field}
                          isDisabled={finalDisabled}
                          isVisible={finalVisible}
                        />
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Card className="mb-4">
                  {section.title && (
                    <CardHeader>
                      <CardTitle>{section.title}</CardTitle>
                    </CardHeader>
                  )}
                  <CardContent className="space-y-4">
                    {section.fields.map((field) => {
                      const visible = isFieldVisible(field);
                      const perms = getFieldPermissionState(field);
                      const depDisabled = isFieldDisabledByDependency(field);

                      const finalVisible = visible && perms.isVisible;
                      const finalDisabled =
                        readOnly ||
                        perms.isDisabled ||
                        sectionPermState.shouldDisableFields ||
                        depDisabled;

                      return (
                        <FormField
                          key={field.name}
                          field={field}
                          isDisabled={finalDisabled}
                          isVisible={finalVisible}
                        />
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {section.collapsible && !isCollapsed && (
                <div className="mt-6 flex flex-col gap-4">
                  {section.fields.map((field) => {
                    const visible = isFieldVisible(field);
                    const perms = getFieldPermissionState(field);
                    const depDisabled = isFieldDisabledByDependency(field);

                    const finalVisible = visible && perms.isVisible;
                    const finalDisabled =
                      readOnly ||
                      perms.isDisabled ||
                      sectionPermState.shouldDisableFields ||
                      depDisabled;

                    return (
                      <FormField
                        key={field.name}
                        field={field}
                        isDisabled={finalDisabled}
                        isVisible={finalVisible}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {!readOnly &&
          (schema.submitButton?.show !== false ||
            (onCancel && schema.cancelButton?.show !== false)) && (
            <div className="mt-6 flex justify-between">
              {onCancel && schema.cancelButton?.show !== false && (
                <Button
                  aria-label={schema.cancelButton?.label || "Cancel"}
                  disabled={isFormLoading}
                  title={schema.cancelButton?.label || "Cancel"}
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={onCancel}
                />
              )}
              {schema.submitButton?.show !== false && (
                <Button
                  aria-label={
                    isFormLoading
                      ? schema.submitButton?.loadingLabel || "Submitting..."
                      : schema.submitButton?.label || "Submit"
                  }
                  disabled={
                    isFormLoading ||
                    (disableSubmitWhen
                      ? disableSubmitWhen(watchedValues)
                      : false)
                  }
                  loading={isFormLoading}
                  title={
                    isFormLoading
                      ? schema.submitButton?.loadingLabel || "Submitting..."
                      : schema.submitButton?.label || "Submit"
                  }
                  type="submit"
                />
              )}
            </div>
          )}
      </FormWrapper>
    );
  };

  if (showModal) {
    return (
      <FormProvider {...methods}>
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 py-8 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Card
            className={cn(
              "bg-bg-surface-elevated max-h-[calc(100vh-4rem)] w-[740px]",
              modalClassName
            )}
          >
            <div className="overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {modalTitle && (
                <CardHeader className="p-6 pb-0">
                  <CardTitle className="text-text-primary text-3xl font-bold">
                    {modalTitle}
                  </CardTitle>
                </CardHeader>
              )}
              <CardContent className="p-6">
                <div className={cn("relative", className)}>
                  {isFormLoading && (
                    <div className="bg-bg-app/80 absolute inset-0 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="text-accent h-6 w-6 animate-spin" />
                        <p className="text-text-muted text-sm">Submitting...</p>
                      </div>
                    </div>
                  )}

                  {formError && (
                    <Card className="border-feedback-error bg-feedback-error-soft mb-4">
                      <CardContent className="pt-6">
                        <p className="text-feedback-error text-sm" role="alert">
                          {formError}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {renderFormContent()}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className={cn("relative", className)}>
        {isFormLoading && (
          <div className="bg-bg-app/80 absolute inset-0 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="text-accent h-6 w-6 animate-spin" />
              <p className="text-text-muted text-sm">Submitting...</p>
            </div>
          </div>
        )}

        {formError && (
          <Card className="border-feedback-error bg-feedback-error-soft mb-4">
            <CardContent className="pt-6">
              <p className="text-feedback-error text-sm" role="alert">
                {formError}
              </p>
            </CardContent>
          </Card>
        )}

        {renderFormContent()}
      </div>
    </FormProvider>
  );
}
