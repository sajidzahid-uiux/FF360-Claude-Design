"use client";

import { Button, ButtonVariantEnum, cn } from "@fieldflow360/org-ui";
import { Check, User } from "lucide-react";

import type { Contact } from "@/api/types";
import { formatSecondaryContactNames } from "@/features/contacts/lib";
import { SanitizedInput } from "@/shared/ui/primitives";

interface SubContactSearchPickerProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  availableContacts: Contact[];
  isLoading: boolean;
  /** Ids currently ticked. */
  selectedIds: number[];
  /** Toggle a contact's selection. */
  onToggleContact: (contact: Contact) => void;
  /** When the max is reached, unticked rows are disabled. */
  disableUnselected?: boolean;
}

export function SubContactSearchPicker({
  searchTerm,
  onSearchTermChange,
  availableContacts,
  isLoading,
  selectedIds,
  onToggleContact,
  disableUnselected = false,
}: SubContactSearchPickerProps) {
  const selectedSet = new Set(selectedIds);

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <div className="shrink-0">
        <p className="mb-2 text-sm font-medium">Customer Name</p>
        <SanitizedInput
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      <div className="border-border-subtle bg-bg-app flex max-h-[22rem] min-h-0 flex-col overflow-hidden rounded-md border shadow-sm">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
          {isLoading ? (
            <p className="text-text-muted px-3 py-4 text-sm">Loading...</p>
          ) : availableContacts.length === 0 ? (
            <p className="text-text-muted px-3 py-4 text-sm">
              No contacts found
            </p>
          ) : (
            availableContacts.map((c) => {
              const secondary = formatSecondaryContactNames(
                c.contact_details,
                c.full_name
              );
              const selected = selectedSet.has(c.id);
              const disabled = !selected && disableUnselected;
              return (
                <button
                  key={c.id}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors",
                    selected ? "bg-accent/10" : "hover:bg-bg-surface",
                    disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
                  )}
                  disabled={disabled}
                  type="button"
                  onClick={() => onToggleContact(c)}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "bg-accent border-accent text-white"
                        : "border-border bg-white"
                    )}
                  >
                    {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                  </span>
                  <User className="text-text-muted h-4 w-4 shrink-0" />
                  <span className="font-medium">{c.full_name}</span>
                  {secondary ? (
                    <span className="text-text-muted truncate text-xs">
                      {secondary}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

interface SubContactNewContactFieldsProps {
  name: string;
  phone: string;
  email: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}

export function SubContactNewContactFields({
  name,
  phone,
  email,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onBack,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: SubContactNewContactFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm font-medium">Customer Name</p>
      <SanitizedInput
        placeholder="Enter Customer Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <SanitizedInput
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
      />
      <SanitizedInput
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button
          aria-label="Back"
          title="Back"
          variant={ButtonVariantEnum.SURFACE}
          onClick={onBack}
        />
        <Button
          aria-label={isSubmitting ? "Saving..." : submitLabel}
          disabled={!name.trim() || isSubmitting}
          loading={isSubmitting}
          title={isSubmitting ? "Saving..." : submitLabel}
          onClick={onSubmit}
        />
      </div>
    </div>
  );
}

export const SUB_CONTACT_DIALOG_MODAL_CLASS = "max-w-lg h-auto max-h-[85vh]";
export const SUB_CONTACT_DIALOG_CONTENT_CLASS = SUB_CONTACT_DIALOG_MODAL_CLASS;
