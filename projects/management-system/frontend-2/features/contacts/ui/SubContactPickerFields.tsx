"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { Plus, User } from "lucide-react";

import type { Contact } from "@/api/types";
import { formatSecondaryContactNames } from "@/features/contacts/lib";
import { SanitizedInput } from "@/shared/ui/primitives";

interface SubContactSearchPickerProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  availableContacts: Contact[];
  isLoading: boolean;
  onSelectContact: (contact: Contact) => void;
  onNewContact: () => void;
}

export function SubContactSearchPicker({
  searchTerm,
  onSearchTermChange,
  availableContacts,
  isLoading,
  onSelectContact,
  onNewContact,
}: SubContactSearchPickerProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0">
        <p className="mb-2 text-sm font-medium">Customer Name</p>
        <SanitizedInput
          placeholder="Enter Customer Name"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>

      <div className="border-border-subtle bg-bg-app flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border shadow-sm">
        <button
          className="hover:bg-bg-surface flex w-full shrink-0 items-center gap-2 border-b px-3 py-2.5 text-left text-sm"
          type="button"
          onClick={onNewContact}
        >
          <Plus className="h-4 w-4" />
          New Contact
        </button>
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
              return (
                <button
                  key={c.id}
                  className="hover:bg-bg-surface flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm"
                  type="button"
                  onClick={() => onSelectContact(c)}
                >
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

export const SUB_CONTACT_DIALOG_MODAL_CLASS = "max-w-lg";
export const SUB_CONTACT_DIALOG_CONTENT_CLASS = SUB_CONTACT_DIALOG_MODAL_CLASS;
