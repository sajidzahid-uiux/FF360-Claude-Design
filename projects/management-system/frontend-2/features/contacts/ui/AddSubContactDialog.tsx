"use client";
import { useCallback, useMemo, useState } from "react";

import { Modal } from "@fieldflow360/org-ui";

import type { Contact, SubContactCreateAndLinkPayload } from "@/api/types";
import {
  CLIENT_CONTACT_CATEGORY_NAME,
  MAX_SUB_CONTACTS,
  SUB_CONTACT_CREATE_FORM_BODY_CLASS,
  SUB_CONTACT_CREATE_FORM_MODAL_CLASS,
  SUB_CONTACT_DIALOG_MODAL_CLASS,
  SUB_CONTACT_PICKER_LIST_FILTERS,
  SubContactCreateContactForm,
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

  const { link, createAndLink } = useSubContactMutations(parentContactId);

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

  const handleClose = useCallback(() => {
    setSearchTerm("");
    setShowNewForm(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleLink = useCallback(
    async (contact: Contact) => {
      if (atMaxSubContacts) return;
      try {
        await link.mutateAsync({
          contactId: contact.id,
          currentSubContactIds: linkedSubContactIds,
        });
        onLinked();
        handleClose();
      } catch {
        // Toast shown by link mutation onError
      }
    },
    [atMaxSubContacts, link, linkedSubContactIds, onLinked, handleClose]
  );

  const handleCreateAndLink = useCallback(
    async (payload: SubContactCreateAndLinkPayload) => {
      await createAndLink.mutateAsync(payload);
      onLinked();
      handleClose();
    },
    [createAndLink, onLinked, handleClose]
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
            This Farm Management Contact already has the maximum of{" "}
            {MAX_SUB_CONTACTS} sub-contacts.
          </p>
        ) : showNewForm ? (
          <SubContactCreateContactForm
            key={createFormKey}
            clientCategoryId={clientCategoryId}
            isSubmitting={createAndLink.isPending}
            submitLabel="Create & Link"
            onBack={() => setShowNewForm(false)}
            onSubmit={(payload) => void handleCreateAndLink(payload)}
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
            onSelectContact={(c) => void handleLink(c)}
          />
        )}
      </div>
    </Modal>
  );
}
