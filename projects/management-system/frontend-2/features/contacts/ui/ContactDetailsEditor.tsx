"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Input,
  cn,
} from "@fieldflow360/org-ui";
import { Phone, Plus, Star, Tag, Trash2, User } from "lucide-react";

import {
  type ContactDetailFormRow,
  addContactDetailRow,
  removeContactDetailRow,
  setPrimaryDetail,
  updateContactDetailRow,
} from "@/features/contacts/lib";
import { CONTACT_FIELD_LIMITS } from "@/features/contacts/model";
import { Label, SanitizedInput } from "@/shared/ui/primitives";
import { validatePhone } from "@/utils/validation/contactValidation";

export type ContactDetailsEditorVariant = "modal" | "farm";

interface ContactDetailsEditorProps {
  value: ContactDetailFormRow[];
  onChange: (rows: ContactDetailFormRow[]) => void;
  readOnly?: boolean;
  errors?: string;
  variant?: ContactDetailsEditorVariant;
}

function getPhoneErrorForRow(
  rows: ContactDetailFormRow[],
  index: number
): string | undefined {
  const phone = rows[index]?.phone_number.trim();
  if (!phone) return undefined;
  return validatePhone(rows[index].phone_number) ?? undefined;
}

export function ContactDetailsEditor({
  value,
  onChange,
  readOnly = false,
  errors,
  variant = "farm",
}: ContactDetailsEditorProps) {
  const isModal = variant === "modal";

  const handleAddAnother = () => {
    onChange(addContactDetailRow(value));
  };

  const handleSetPrimary = (index: number) => {
    if (readOnly) return;
    onChange(setPrimaryDetail(value, index));
  };

  const handleRemove = (index: number) => {
    if (readOnly) return;
    onChange(removeContactDetailRow(value, index));
  };

  const handleFieldChange = (
    index: number,
    field: keyof ContactDetailFormRow,
    fieldValue: string
  ) => {
    onChange(updateContactDetailRow(value, index, { [field]: fieldValue }));
  };

  const phoneFieldErrors = value
    .map((row, index) => {
      if (!row.phone_number.trim()) return null;
      const err = validatePhone(row.phone_number);
      return err ? { index, message: err } : null;
    })
    .filter(
      (item): item is { index: number; message: string } => item !== null
    );

  const hasBottomErrors = Boolean(errors) || phoneFieldErrors.length > 0;

  if (isModal) {
    return (
      <div className="space-y-4">
        {value.map((row, index) => {
          const phoneError = getPhoneErrorForRow(value, index);
          const canRemove = !readOnly && value.length > 1;

          return (
            <div
              key={row.id ?? `detail-${index}`}
              className={cn(
                "border-border-subtle bg-bg-surface/30 space-y-4 rounded-xl border p-4",
                index > 0 && "mt-1"
              )}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  disabled={readOnly}
                  label={row.is_primary ? "Name *" : "Name"}
                  leftIcon={
                    <User aria-hidden className="h-4 w-4" strokeWidth={2} />
                  }
                  maxLength={CONTACT_FIELD_LIMITS.full_name}
                  placeholder="Contact name"
                  required={row.is_primary}
                  value={row.name}
                  onChange={(event) =>
                    handleFieldChange(index, "name", event.target.value)
                  }
                />
                <Input
                  disabled={readOnly}
                  error={phoneError}
                  label="Phone number"
                  leftIcon={
                    <Phone aria-hidden className="h-4 w-4" strokeWidth={2} />
                  }
                  maxLength={CONTACT_FIELD_LIMITS.phone_number}
                  placeholder="Phone number (optional)"
                  type="tel"
                  value={row.phone_number}
                  onChange={(event) =>
                    handleFieldChange(index, "phone_number", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <Input
                    disabled={readOnly}
                    label="Label"
                    leftIcon={
                      <Tag aria-hidden className="h-4 w-4" strokeWidth={2} />
                    }
                    placeholder="e.g. Mobile, Office"
                    value={row.label}
                    onChange={(event) =>
                      handleFieldChange(index, "label", event.target.value)
                    }
                  />
                </div>
                {!readOnly ? (
                  <div className="flex shrink-0 items-center gap-2 self-end">
                    <Button
                      disabled={row.is_primary}
                      leftIcon={
                        <Star
                          aria-hidden
                          className={cn(
                            "h-4 w-4",
                            row.is_primary && "fill-current"
                          )}
                          strokeWidth={2}
                        />
                      }
                      size={ComponentSizeEnum.SM}
                      title="Primary"
                      variant={
                        row.is_primary
                          ? ButtonVariantEnum.ACCENT
                          : ButtonVariantEnum.SURFACE
                      }
                      onClick={() => handleSetPrimary(index)}
                    />
                    {canRemove ? (
                      <Button
                        iconOnly
                        aria-label="Remove contact detail"
                        leftIcon={
                          <Trash2
                            aria-hidden
                            className="h-4 w-4"
                            strokeWidth={2}
                          />
                        }
                        size={ComponentSizeEnum.SM}
                        variant={ButtonVariantEnum.DELETE}
                        onClick={() => handleRemove(index)}
                      />
                    ) : null}
                  </div>
                ) : row.is_primary ? (
                  <span className="text-text-muted shrink-0 pb-2 text-xs font-medium">
                    Primary
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {!readOnly ? (
          <Button
            fullWidth
            leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
            title="Add another"
            variant={ButtonVariantEnum.SURFACE}
            onClick={handleAddAnother}
          />
        ) : null}

        <div
          aria-live="polite"
          className={cn(
            "text-sm text-[var(--color-feedback-error)]",
            hasBottomErrors ? "space-y-1" : undefined
          )}
          role={hasBottomErrors ? "alert" : undefined}
        >
          {errors ? <p>{errors}</p> : null}
          {phoneFieldErrors.map(({ index, message }) => (
            <p key={`phone-error-${index}`}>
              Phone {index + 1}: {message}
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {value.map((row, index) => (
        <div
          key={row.id ?? `detail-${index}`}
          className={cn(index > 0 && "border-border-subtle border-t pt-4")}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-0">
                <Label htmlFor={`detail-name-${index}`} variant="formMedium">
                  Name {row.is_primary ? "*" : ""}
                </Label>
                <SanitizedInput
                  className="mt-1 w-full"
                  disabled={readOnly}
                  id={`detail-name-${index}`}
                  maxLength={CONTACT_FIELD_LIMITS.full_name}
                  placeholder="Name"
                  required={row.is_primary}
                  value={row.name}
                  onChange={(e) =>
                    handleFieldChange(index, "name", e.target.value)
                  }
                />
              </div>

              <div className="min-w-0">
                <Label htmlFor={`detail-phone-${index}`} variant="formMedium">
                  Phone Number
                </Label>
                <SanitizedInput
                  className={cn(
                    "mt-1 w-full",
                    phoneFieldErrors.some((e) => e.index === index) &&
                      "border-feedback-error"
                  )}
                  disabled={readOnly}
                  id={`detail-phone-${index}`}
                  maxLength={CONTACT_FIELD_LIMITS.phone_number}
                  placeholder="Phone Number"
                  value={row.phone_number}
                  onChange={(e) =>
                    handleFieldChange(index, "phone_number", e.target.value)
                  }
                />
              </div>

              <div className="min-w-0">
                <Label htmlFor={`detail-label-${index}`} variant="formMedium">
                  Label
                </Label>
                <SanitizedInput
                  className="mt-1 w-full"
                  disabled={readOnly}
                  id={`detail-label-${index}`}
                  placeholder="Add Label"
                  value={row.label}
                  onChange={(e) =>
                    handleFieldChange(index, "label", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-row items-center gap-2 sm:w-auto">
              <Button
                className={cn("flex-1 sm:flex-none", row.is_primary)}
                disabled={readOnly || row.is_primary}
                leftIcon={
                  <Star
                    className={cn("h-4 w-4", row.is_primary && "fill-current")}
                  />
                }
                size={ComponentSizeEnum.SM}
                title="Primary"
                variant={
                  row.is_primary
                    ? ButtonVariantEnum.DEFAULT
                    : ButtonVariantEnum.SURFACE
                }
                onClick={() => handleSetPrimary(index)}
              />
              {!readOnly ? (
                <Button
                  iconOnly
                  aria-label="Remove contact detail"
                  leftIcon={<Trash2 className="h-5 w-5" />}
                  size={ComponentSizeEnum.SM}
                  variant={ButtonVariantEnum.DELETE}
                  onClick={() => handleRemove(index)}
                />
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {!readOnly ? (
        <Button
          fullWidth
          leftIcon={<Plus className="h-4 w-4" />}
          title="Add Another"
          variant={ButtonVariantEnum.SURFACE}
          onClick={handleAddAnother}
        />
      ) : null}

      <div
        aria-live="polite"
        className={cn(
          "text-feedback-error text-sm",
          hasBottomErrors ? "min-h-0 space-y-1" : "min-h-0"
        )}
        role={hasBottomErrors ? "alert" : undefined}
      >
        {errors ? <p>{errors}</p> : null}
        {phoneFieldErrors.map(({ index, message }) => (
          <p key={`phone-error-${index}`}>
            Phone {index + 1}: {message}
          </p>
        ))}
      </div>
    </div>
  );
}
