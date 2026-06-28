"use client";

import { useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  SearchableDropdown,
} from "@fieldflow360/org-ui";
import { PlusCircle } from "lucide-react";

import type { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import { useRouteIds } from "@/hooks";
import { useContactPermissions } from "@/hooks/permissions";
import { useRecordContacts } from "@/hooks/useRecordData";
import { useModalStack } from "@/shared/model/use-modal-stack";

export interface JobContactSelectProps {
  value: string;
  onChange: (value: string) => void;
  recordJobType: JobLeadTypeSegment;
  resourceType: ResourceType;
  error?: string;
  disabled?: boolean;
}

export function JobContactSelect({
  value,
  onChange,
  recordJobType,
  resourceType,
  error,
  disabled = false,
}: JobContactSelectProps) {
  const { orgId } = useRouteIds();
  const { openModal } = useModalStack();
  const { canAdd: canAddContact } = useContactPermissions();
  const { data: contactsData, isLoading } = useRecordContacts({
    resourceType,
    jobType: recordJobType,
  });

  const contacts = useMemo(() => {
    if (!contactsData) return [];
    return Array.isArray(contactsData)
      ? contactsData
      : (contactsData.results ?? []);
  }, [contactsData]);

  const options = useMemo(
    () =>
      contacts.map((contact) => ({
        value: String(contact.id),
        label: contact.full_name?.trim() || `Contact #${contact.id}`,
        description: contact.phone_number || undefined,
      })),
    [contacts]
  );

  const helperText = isLoading
    ? "Loading contacts…"
    : options.length === 0
      ? "No contacts yet. Create one to continue."
      : "Search by name or phone.";

  return (
    <div className="space-y-2">
      <SearchableDropdown
        fullWidth
        disabled={disabled || isLoading}
        emptyStateText={
          isLoading ? "Loading contacts…" : "No contacts match your search"
        }
        error={error}
        helperText={helperText}
        label="Contact *"
        options={options}
        placeholder="Select a contact"
        searchPlaceholder="Search contacts…"
        value={value || undefined}
        onChange={onChange}
      />
      {canAddContact && orgId ? (
        <Button
          aria-label="Create new contact"
          leftIcon={
            <PlusCircle aria-hidden className="h-4 w-4" strokeWidth={2} />
          }
          title="Create new contact"
          variant={ButtonVariantEnum.GHOST}
          onClick={() => openModal("add-contact")}
        />
      ) : null}
    </div>
  );
}
