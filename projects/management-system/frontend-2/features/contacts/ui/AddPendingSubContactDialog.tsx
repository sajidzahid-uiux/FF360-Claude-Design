"use client";
import { useCallback, useMemo, useState } from "react";

import { Modal } from "@fieldflow360/org-ui";

import type { Contact, SubContactCreateAndLinkPayload } from "@/api/types";
import {
  CLIENT_CONTACT_CATEGORY_NAME,
  FARM_MANAGEMENT_CONTACT_LABEL,
  MAX_SUB_CONTACTS,
  SUB_CONTACT_PICKER_LIST_FILTERS,
} from "@/features/contacts/model";
import { useContactCategories, useContacts } from "@/hooks";

import {
  SUB_CONTACT_CREATE_FORM_BODY_CLASS,
  SUB_CONTACT_CREATE_FORM_MODAL_CLASS,
  SubContactCreateContactForm,
} from "./SubContactCreateContactForm";
import {
  SUB_CONTACT_DIALOG_MODAL_CLASS,
  SubContactSearchPicker,
} from "./SubContactPickerFields";

interface AddPendingSubContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludedContactIds: number[];
  pendingCount: number;
  onLinkExisting: (contact: Contact) => void;
  onCreateNew: (
    payload: SubContactCreateAndLinkPayload,
    displayName: string
  ) => void;
}

export default function AddPendingSubContactDialog({
  open,
  onOpenChange,
  excludedContactIds,
  pendingCount,
  onLinkExisting,
  onCreateNew,
}: AddPendingSubContactDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);

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

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setShowNewForm(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleLink = useCallback(
    (contact: Contact) => {
      if (atMaxSubContacts) return;
      onLinkExisting(contact);
      handleClose();
    },
    [atMaxSubContacts, onLinkExisting, handleClose]
  );

  const handleCreateNew = useCallback(
    (payload: SubContactCreateAndLinkPayload) => {
      if (atMaxSubContacts) return;
      onCreateNew(payload, payload.full_name);
      handleClose();
    },
    [atMaxSubContacts, onCreateNew, handleClose]
  );

  const modalClass = showNewForm
    ? SUB_CONTACT_CREATE_FORM_MODAL_CLASS
    : SUB_CONTACT_DIALOG_MODAL_CLASS;
  const modalTitle = showNewForm ? "Create & Link Contact" : "Add Sub Contacts";

  if (!open) {
    return null;
  }

  return (
    <Modal
      className={modalClass}
      isOpen={open}
      title={modalTitle}
      onClose={handleClose}
    >
      <div
        className={
          showNewForm
            ? SUB_CONTACT_CREATE_FORM_BODY_CLASS
            : "flex min-h-[24rem] flex-col sm:min-h-[26rem]"
        }
      >
        {atMaxSubContacts ? (
          <p className="text-text-muted text-sm">
            You can link up to {MAX_SUB_CONTACTS} sub-contacts per{" "}
            {FARM_MANAGEMENT_CONTACT_LABEL}.
          </p>
        ) : showNewForm ? (
          <SubContactCreateContactForm
            key={createFormKey}
            clientCategoryId={clientCategoryId}
            submitLabel="Add to list"
            onBack={() => setShowNewForm(false)}
            onSubmit={handleCreateNew}
          />
        ) : (
          <SubContactSearchPicker
            availableContacts={availableContacts}
            isLoading={isLoading}
            searchTerm={searchTerm}
            onNewContact={() => {
              setCreateFormKey((k) => k + 1);
              setShowNewForm(true);
            }}
            onSearchTermChange={setSearchTerm}
            onSelectContact={handleLink}
          />
        )}
      </div>
    </Modal>
  );
}
