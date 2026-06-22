import type { Contact } from "@/api/types";

export interface ContactOrgUiColumnHandlers {
  onViewContact: (contact: Contact) => void;
  onContactLogs: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
  canDeleteContacts?: boolean;
  canReadContacts: boolean;
  onNavigateToContact?: (contact: Contact) => void;
}

export type ContactRowActionKey = "view" | "logs" | "delete";

export interface ContactRowActionDescriptor {
  key: ContactRowActionKey;
  label: string;
  variant?: "danger";
}

export function getContactRowActionDescriptors(
  handlers: Pick<
    ContactOrgUiColumnHandlers,
    "canReadContacts" | "canDeleteContacts"
  >
): ContactRowActionDescriptor[] {
  const actions: ContactRowActionDescriptor[] = [];

  if (handlers.canReadContacts) {
    actions.push({ key: "view", label: "View details" });
    actions.push({ key: "logs", label: "Logs" });
  }

  if (handlers.canDeleteContacts) {
    actions.push({
      key: "delete",
      label: "Delete",
      variant: "danger",
    });
  }

  return actions;
}

export function buildContactRowActions(
  contact: Contact,
  handlers: ContactOrgUiColumnHandlers
): Array<ContactRowActionDescriptor & { onClick: () => void }> {
  return getContactRowActionDescriptors(handlers).map((descriptor) => {
    const onClick =
      descriptor.key === "view"
        ? () => handlers.onViewContact(contact)
        : descriptor.key === "logs"
          ? () => handlers.onContactLogs(contact)
          : () => handlers.onDeleteContact(contact);

    return {
      ...descriptor,
      onClick,
    };
  });
}
