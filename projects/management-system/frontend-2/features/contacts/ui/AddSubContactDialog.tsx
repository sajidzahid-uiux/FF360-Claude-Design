"use client";
import { type FormEvent, useCallback, useMemo, useState } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

import type { Contact } from "@/api/types";
import {
  CLIENT_CONTACT_CATEGORY_NAME,
  MAX_SUB_CONTACTS,
  SUB_CONTACT_PICKER_LIST_FILTERS,
  SubContactSearchPicker,
} from "@/features/contacts";
import {
  useContactCategories,
  useContacts,
  useSubContactMutations,
} from "@/hooks";

interface AddSubContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentContactId: number;
  linkedSubContactIds: number[];
  onLinked: () => void;
}

export default function AddSubContactDialog({
  open,
  onOpenChange,
  parentContactId,
  linkedSubContactIds,
  onLinked,
}: AddSubContactDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Contact[]>([]);

  const { categories } = useContactCategories();
  const clientCategoryId = useMemo(
    () =>
      categories?.find(
        (c) =>
          c.name.toLowerCase() === CLIENT_CONTACT_CATEGORY_NAME.toLowerCase()
      )?.id,
    [categories]
  );

  const { contacts, isLoading } = useContacts(
    {
      categories: clientCategoryId ? [clientCategoryId] : undefined,
      ...SUB_CONTACT_PICKER_LIST_FILTERS,
      search: searchTerm,
      page_size: 100,
    },
    !!clientCategoryId && open
  );

  const { updateSubContacts } = useSubContactMutations(parentContactId);

  const linkedSet = useMemo(
    () => new Set(linkedSubContactIds),
    [linkedSubContactIds]
  );

  const availableContacts = useMemo(() => {
    return (contacts ?? []).filter(
      (c: Contact) => c.id !== parentContactId && !linkedSet.has(c.id)
    );
  }, [contacts, parentContactId, linkedSet]);

  const atMaxSubContacts = linkedSubContactIds.length >= MAX_SUB_CONTACTS;
  const remainingSlots = MAX_SUB_CONTACTS - linkedSubContactIds.length;
  const selectedIds = useMemo(() => selected.map((c) => c.id), [selected]);

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setSelected([]);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleToggle = useCallback(
    (contact: Contact) => {
      setSelected((prev) => {
        if (prev.some((c) => c.id === contact.id)) {
          return prev.filter((c) => c.id !== contact.id);
        }
        if (prev.length >= remainingSlots) return prev;
        return [...prev, contact];
      });
    },
    [remainingSlots]
  );

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (selected.length === 0) return;
      try {
        await updateSubContacts.mutateAsync([
          ...linkedSubContactIds,
          ...selectedIds,
        ]);
        onLinked();
        handleClose();
      } catch {
        // Toast shown by the mutation's onError
      }
    },
    [
      selected.length,
      updateSubContacts,
      linkedSubContactIds,
      selectedIds,
      onLinked,
      handleClose,
    ]
  );

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={updateSubContacts.isPending}
      maxHeight="85vh"
      submitDisabled={selected.length === 0}
      submitLabel={selected.length > 0 ? `Add ${selected.length}` : "Add"}
      title="Add Sub Contacts"
      width={560}
      onClose={handleClose}
      onSubmit={(e) => void handleSubmit(e)}
    >
      {atMaxSubContacts ? (
        <p className="text-text-muted text-sm">
          This Farm Management Contact already has the maximum of{" "}
          {MAX_SUB_CONTACTS} sub-contacts.
        </p>
      ) : (
        <SubContactSearchPicker
          availableContacts={availableContacts}
          disableUnselected={selected.length >= remainingSlots}
          isLoading={isLoading}
          searchTerm={searchTerm}
          selectedIds={selectedIds}
          onSearchTermChange={setSearchTerm}
          onToggleContact={handleToggle}
        />
      )}
    </AppFormModal>
  );
}
