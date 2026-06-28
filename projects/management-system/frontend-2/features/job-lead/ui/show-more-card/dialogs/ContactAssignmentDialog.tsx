"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, ButtonVariantEnum, cn } from "@fieldflow360/org-ui";
import { Plus, Trash2, User } from "lucide-react";

import type { StakeholderContact } from "@/api/types";
import { JobLeadTypeSegment } from "@/constants";
import { ResourceType } from "@/constants/enums";
import { useRecordContacts } from "@/hooks/useRecordData";
import { StakeholderPrimaryButton } from "@/shared/ui/common/StakeholderPrimaryButton";
import { DialogTemplate } from "@/shared/ui/common/dialogs";
import { SanitizedInput } from "@/shared/ui/primitives";

export interface ContactAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "job" | "lead";
  recordJobType: JobLeadTypeSegment;
  contacts?: StakeholderContact[];
  primaryContactId?: number;
  fallbackContactName?: string;
  readOnly?: boolean;
  onSave: (
    contactIds: number[],
    primaryContactId: number | null
  ) => Promise<void>;
  isSaving?: boolean;
}

export function ContactAssignmentDialog({
  open,
  onOpenChange,
  entityType,
  recordJobType,
  contacts = [],
  primaryContactId,
  readOnly = false,
  onSave,
  isSaving = false,
}: ContactAssignmentDialogProps) {
  const resourceType =
    entityType === "job" ? ResourceType.JOB : ResourceType.LEAD;

  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [selectedPrimaryContactId, setSelectedPrimaryContactId] = useState<
    number | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: contactsData, isLoading: contactsLoading } = useRecordContacts({
    resourceType,
    jobType: recordJobType,
    search: searchTerm,
  });

  const availableContacts = useMemo(() => {
    if (!contactsData) return [];
    const rawList = Array.isArray(contactsData)
      ? contactsData
      : contactsData.results || [];
    return rawList.filter((c) => !selectedContactIds.includes(c.id));
  }, [contactsData, selectedContactIds]);

  useEffect(() => {
    if (open) {
      setSelectedContactIds(contacts.map((c) => c.id));
      const initialPrimary =
        primaryContactId ?? contacts.find((c) => c.is_primary)?.id ?? null;
      setSelectedPrimaryContactId(initialPrimary);
      setSearchTerm("");
    }
  }, [open, contacts, primaryContactId]);

  const contactMap = useMemo(() => {
    const map = new Map<
      number,
      { full_name: string; phone_number?: string | null }
    >();
    contacts.forEach((c) => {
      map.set(c.id, { full_name: c.full_name, phone_number: c.phone_number });
    });
    if (contactsData) {
      const rawList = Array.isArray(contactsData)
        ? contactsData
        : contactsData.results || [];
      rawList.forEach((c) => {
        map.set(c.id, { full_name: c.full_name, phone_number: c.phone_number });
      });
    }
    return map;
  }, [contacts, contactsData]);

  const isUnchanged = useMemo(() => {
    const initialIds = contacts.map((c) => c.id);
    const hasIdsChanged =
      initialIds.length !== selectedContactIds.length ||
      selectedContactIds.some((id, idx) => initialIds[idx] !== id);
    const initialPrimary =
      primaryContactId ?? contacts.find((c) => c.is_primary)?.id ?? null;
    const hasPrimaryChanged = selectedPrimaryContactId !== initialPrimary;

    return !hasIdsChanged && !hasPrimaryChanged;
  }, [
    contacts,
    selectedContactIds,
    primaryContactId,
    selectedPrimaryContactId,
  ]);

  const handleSave = async () => {
    if (readOnly) return;
    await onSave(selectedContactIds, selectedPrimaryContactId);
  };

  const handleAddContact = (id: number) => {
    setSelectedContactIds((prev) => {
      const updated = [...prev, id];
      if (!selectedPrimaryContactId || prev.length === 0) {
        setSelectedPrimaryContactId(id);
      }
      return updated;
    });
  };

  const handleRemoveContact = (id: number) => {
    if (selectedContactIds.length <= 1) return;
    setSelectedContactIds((prev) => {
      const updated = prev.filter((cid) => cid !== id);
      if (selectedPrimaryContactId === id) {
        setSelectedPrimaryContactId(updated.length > 0 ? updated[0] : null);
      }
      return updated;
    });
  };

  const handleSetPrimary = (id: number) => {
    setSelectedPrimaryContactId(id);
  };

  const entityLabel = entityType === "job" ? "job" : "lead";

  return (
    <DialogTemplate
      description={
        readOnly
          ? `Assigned contacts for this ${entityLabel}.`
          : `Assign multiple contacts to this ${entityLabel} and select one as primary.`
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2 border-t pt-4">
          <Button
            aria-label={readOnly ? "Close" : "Cancel"}
            title={readOnly ? "Close" : "Cancel"}
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => onOpenChange(false)}
          />
          {!readOnly ? (
            <Button
              aria-label={isSaving ? "Saving..." : "Save changes"}
              disabled={
                isSaving || isUnchanged || selectedContactIds.length === 0
              }
              loading={isSaving}
              title={isSaving ? "Saving..." : "Save changes"}
              onClick={handleSave}
            />
          ) : null}
        </div>
      }
      maxWidth="512px"
      open={open}
      title={readOnly ? "View Contacts" : "Manage Contacts"}
      onOpenChange={onOpenChange}
    >
      <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
        {/* Section 1: Assigned Contacts */}
        <div>
          <h3 className="text-text-primary mb-3 text-sm font-semibold">
            Assigned Contacts
          </h3>
          {selectedContactIds.length === 0 ? (
            <p className="text-text-muted text-xs italic">
              No contacts assigned
            </p>
          ) : (
            <div className="space-y-2">
              {selectedContactIds.map((id) => {
                const contact = contactMap.get(id);
                const isPrimary = selectedPrimaryContactId === id;
                const displayName = contact?.full_name ?? `Contact #${id}`;
                const phoneText = contact?.phone_number ?? "";
                const canDelete = selectedContactIds.length > 1 && !readOnly;

                return (
                  <div
                    key={id}
                    className={cn(
                      "bg-bg-surface-elevated flex items-center justify-between rounded-lg border p-3 transition-colors",
                      isPrimary
                        ? "border-accent bg-accent-light"
                        : "border-border-subtle"
                    )}
                  >
                    <div className="mr-4 flex min-w-0 items-center gap-2.5">
                      <User
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isPrimary ? "text-accent" : "text-text-muted"
                        )}
                      />
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-sm",
                            isPrimary ? "font-semibold" : "font-medium"
                          )}
                        >
                          {displayName}
                        </p>
                        {phoneText ? (
                          <p className="text-text-muted truncate text-xs">
                            {phoneText}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {/* Primary Toggle */}
                      <StakeholderPrimaryButton
                        disabled={readOnly}
                        isPrimary={isPrimary}
                        onClick={() => handleSetPrimary(id)}
                      />

                      {/* Remove Button */}
                      {canDelete ? (
                        <button
                          className="hover:bg-feedback-error/15 text-feedback-error rounded-md p-1.5 transition-colors"
                          type="button"
                          onClick={() => handleRemoveContact(id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Available Contacts */}
        {!readOnly ? (
          <div className="border-border-subtle space-y-3 border-t pt-4">
            <h3 className="text-text-primary text-sm font-semibold">
              Available Contacts
            </h3>
            <SanitizedInput
              placeholder="Search contacts by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {contactsLoading ? (
              <div className="text-text-muted py-4 text-center text-xs">
                Loading contacts...
              </div>
            ) : availableContacts.length === 0 ? (
              <p className="text-text-muted py-4 text-center text-xs italic">
                {searchTerm
                  ? "No contacts match search query"
                  : "Search contacts to assign"}
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                {availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border-border-subtle bg-bg-surface-elevated flex items-center justify-between rounded-lg border p-2.5"
                  >
                    <div className="mr-4 flex min-w-0 items-center gap-2.5">
                      <User className="text-text-muted h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {contact.full_name}
                        </p>
                        {contact.phone_number ? (
                          <p className="text-text-muted truncate text-xs">
                            {contact.phone_number}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <button
                      className="hover:bg-accent/15 text-accent shrink-0 rounded-md p-1.5 transition-colors"
                      type="button"
                      onClick={() => handleAddContact(contact.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </DialogTemplate>
  );
}
