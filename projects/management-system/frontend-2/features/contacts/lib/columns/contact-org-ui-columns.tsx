"use client";

import {
  type Column,
  Eye,
  type TableAction,
  TableActions,
  TableHeaderLabel,
  Trash2,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown, ChevronRight, History, Tags, User } from "lucide-react";

import {
  CONTACT_SUBTYPE,
  CONTACT_TYPE_LABELS,
} from "@/features/contacts/model";
import { orgUiLocaleDateColumn } from "@/shared/lib/table/org-ui";
import { TouchSlideText } from "@/shared/ui/common";

import type { ContactTableRow } from "../contactTableRows";
import {
  type ContactOrgUiColumnHandlers,
  buildContactRowActions as buildContactRowActionHandlers,
} from "./contact-org-ui-row-actions";

export type { ContactOrgUiColumnHandlers };

export interface ContactOrgUiColumnsOptions extends ContactOrgUiColumnHandlers {
  expandedParentIds?: Set<number>;
  onToggleExpand?: (parentId: number) => void;
}

function ContactTypeBadge({
  subtype,
}: {
  subtype?: ContactTableRow["contact_subtype"];
}) {
  const key = subtype ?? CONTACT_SUBTYPE.STANDARD;
  const label = CONTACT_TYPE_LABELS[key];

  return (
    <span className="bg-foreground text-background rounded-full px-3 py-1 text-xs font-medium">
      {label}
    </span>
  );
}

function buildContactRowActions(
  contact: ContactTableRow,
  handlers: ContactOrgUiColumnHandlers
): TableAction<ContactTableRow>[] {
  const iconByKey = {
    view: <Eye aria-hidden className="h-4 w-4" strokeWidth={2} />,
    logs: <History aria-hidden className="h-4 w-4" strokeWidth={2} />,
    delete: <Trash2 aria-hidden className="h-4 w-4" strokeWidth={2} />,
  } as const;

  return buildContactRowActionHandlers(contact, handlers).map((action) => ({
    label: action.label,
    icon: iconByKey[action.key],
    variant: action.variant,
    onClick: action.onClick,
  }));
}

export function getContactOrgUiColumns(
  options: ContactOrgUiColumnsOptions
): Column<ContactTableRow>[] {
  const {
    expandedParentIds,
    onToggleExpand,
    onDeleteContact,
    onViewContact,
    onContactLogs,
    onNavigateToContact,
    canDeleteContacts,
    canReadContacts,
  } = options;

  const handlers: ContactOrgUiColumnHandlers = {
    onDeleteContact,
    onViewContact,
    onContactLogs,
    onNavigateToContact,
    canDeleteContacts,
    canReadContacts,
  };

  return [
    {
      key: "full_name",
      sortable: true,
      header: <TableHeaderLabel truncate icon={User} label="Contact Name" />,
      width: "280px",
      render: (contact) => {
        const isSub = contact.rowKind === "sub";
        const isExpandable = contact.isExpandable;
        const isLongName = contact.full_name.length >= 20;

        return (
          <div
            className={cn(
              "flex items-center gap-2",
              isSub && "text-text-muted"
            )}
            onDoubleClick={() => handlers.onNavigateToContact?.(contact)}
          >
            {isExpandable && onToggleExpand ? (
              <button
                aria-label="Toggle sub-contacts"
                className="shrink-0"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleExpand(contact.id);
                }}
              >
                {expandedParentIds?.has(contact.id) ? (
                  <ChevronDown aria-hidden className="h-4 w-4" />
                ) : (
                  <ChevronRight aria-hidden className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}
            {isLongName ? (
              <TouchSlideText
                className={cn("font-medium", isSub && "font-normal")}
                maxWidth="w-[200px]"
                text={contact.full_name}
              />
            ) : (
              <span className={cn("font-medium", isSub && "font-normal")}>
                {contact.full_name}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "contact_subtype",
      header: <TableHeaderLabel truncate icon={Tags} label="Contact Type" />,
      width: "160px",
      render: (contact) => (
        <ContactTypeBadge subtype={contact.contact_subtype} />
      ),
    },
    {
      key: "categories",
      header: (
        <TableHeaderLabel truncate icon={Tags} label="Contact Category" />
      ),
      width: "200px",
      render: (contact) => (
        <div className="flex flex-wrap items-start justify-start gap-1">
          {contact.categories?.map((category) => (
            <span
              key={category.id}
              className="rounded-full px-3 py-1 text-sm font-medium text-white"
              style={{ backgroundColor: category.color || "#3b82f6" }}
            >
              {category.name}
            </span>
          ))}
        </div>
      ),
    },
    orgUiLocaleDateColumn<ContactTableRow>({
      key: "created_at",
      label: "Created At",
      width: "120px",
      truncateHeader: true,
      getValue: (contact) => contact.created_at,
    }),
    {
      key: "actions",
      header: "",
      hideable: false,
      width: "80px",
      align: "right",
      render: (contact) => (
        <TableActions
          actions={buildContactRowActions(contact, handlers)}
          item={contact}
          maxVisibleActions={0}
        />
      ),
    },
  ];
}
