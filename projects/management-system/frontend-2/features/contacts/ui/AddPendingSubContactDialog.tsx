"use client";
import { type FormEvent, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { AppFormModal } from "@fieldflow360/org-ui";

import type { Contact } from "@/api/types";
import {
  CLIENT_CONTACT_CATEGORY_NAME,
  FARM_MANAGEMENT_CONTACT_LABEL,
  MAX_SUB_CONTACTS,
  SUB_CONTACT_PICKER_LIST_FILTERS,
} from "@/features/contacts/model";
import { useContactCategories, useContacts } from "@/hooks";

import { SubContactSearchPicker } from "./SubContactPickerFields";

interface AddPendingSubContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedContactIds: number[];
  pendingCount: number;
  onLinkExisting: (contacts: Contact[]) => void;
}

export default function AddPendingSubContactDialog({
  open,
  onOpenChange,
  excludedContactIds,
  pendingCount,
  onLinkExisting,
}: AddPendingSubContactDialogProps) {
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

  const excludedSet = useMemo(
    () => new Set(excludedContactIds),
    [excludedContactIds]
  );

  const availableContacts = useMemo(() => {
    return (contacts ?? []).filter((c: Contact) => !excludedSet.has(c.id));
  }, [contacts, excludedSet]);

  const atMaxSubContacts = pendingCount >= MAX_SUB_CONTACTS;
  const remainingSlots = MAX_SUB_CONTACTS - pendingCount;
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
    (event: FormEvent) => {
      event.preventDefault();
      if (selected.length === 0) return;
      onLinkExisting(selected);
      handleClose();
    },
    [selected, onLinkExisting, handleClose]
  );

  if (!open || typeof document === "undefined") {
    return null;
  }

  // Portal to <body>: this dialog is rendered inside the Farm Contact modal's
  // <form>, and AppFormModal is itself a <form>. Nested forms would make this
  // dialog's submit bubble up and submit the parent farm form, so we lift it
  // out of that DOM subtree.
  return createPortal(
    <AppFormModal
      showCancel
      isOpen={open}
      maxHeight="85vh"
      submitDisabled={selected.length === 0}
      submitLabel={selected.length > 0 ? `Add ${selected.length}` : "Add"}
      title="Add Sub Contacts"
      width={560}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      {atMaxSubContacts ? (
        <p className="text-text-muted text-sm">
          You can link up to {MAX_SUB_CONTACTS} sub-contacts per{" "}
          {FARM_MANAGEMENT_CONTACT_LABEL}.
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
    </AppFormModal>,
    document.body
  );
}
