"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Modal,
  cn,
} from "@fieldflow360/org-ui";
import { ChevronDown, ChevronUp, Network, Star, User } from "lucide-react";

import type { Contact, ContactDetail } from "@/api/types";
import {
  isFarmManagementContact,
  mapApiContactDetailsToForm,
  parseFarmManagementContactRefs,
} from "@/features/contacts/lib";
import { useContact, useRouteIds } from "@/hooks";
import { useContactPermissions } from "@/hooks/permissions";

const CONTACT_DETAIL_DIALOG_INSET = "px-2 sm:px-4";

const DETAILS_TABLE_GRID =
  "grid grid-cols-[minmax(140px,1fr)_minmax(180px,1.2fr)_auto] items-center gap-x-8";

interface ContactDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: number | null;
}

function formatDetailPhone(detail: ContactDetail): string {
  return detail.phone_number?.trim() || "—";
}

function ContactDetailsReadOnlyTable({
  details,
}: {
  details: ContactDetail[];
}) {
  const rows = details.length > 0 ? details : [];

  if (rows.length === 0) {
    return (
      <p className="text-text-muted text-base">No contact details available.</p>
    );
  }

  return (
    <div className={cn(DETAILS_TABLE_GRID, "w-full min-w-0")}>
      <span className="text-text-muted pb-3 text-base font-medium">Name</span>
      <span className="text-text-muted pb-3 text-base font-medium">
        Phone Number
      </span>
      <span aria-hidden className="pb-3" />

      {rows.map((detail, index) => (
        <div key={detail.id ?? `detail-${index}`} className="contents">
          <p className="text-text-primary py-3 text-base font-medium break-words">
            {detail.name || "—"}
          </p>
          <p className="text-text-primary py-3 text-base break-words">
            {formatDetailPhone(detail)}
          </p>
          <div className="flex justify-end py-3">
            <Button
              disabled
              aria-label="Primary"
              leftIcon={
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    detail.is_primary && "fill-current"
                  )}
                />
              }
              size={ComponentSizeEnum.SM}
              title="Primary"
              variant={
                detail.is_primary
                  ? ButtonVariantEnum.DEFAULT
                  : ButtonVariantEnum.SURFACE
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

interface FarmContactTreeNodeProps {
  label: string;
  selected: boolean;
  expanded?: boolean;
  hasChildren?: boolean;
  isChild?: boolean;
  onSelect: () => void;
  onToggle?: () => void;
}

function FarmContactTreeNode({
  label,
  selected,
  expanded,
  hasChildren,
  isChild,
  onSelect,
  onToggle,
}: FarmContactTreeNodeProps) {
  const Icon = isChild ? User : Network;

  return (
    <div
      className={cn(
        "relative flex min-w-0 items-center gap-2 py-2.5",
        isChild && "pl-6",
        selected && "bg-bg-hover/60 border-r-text-primary border-r-4"
      )}
    >
      {hasChildren ? (
        <button
          aria-expanded={expanded}
          className="text-text-muted hover:text-text-primary shrink-0 p-0.5"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      ) : (
        <span aria-hidden className="w-5 shrink-0" />
      )}
      <button
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        type="button"
        onClick={onSelect}
      >
        <Icon aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
        <span
          className={cn(
            "truncate text-base",
            selected ? "font-semibold" : "font-normal"
          )}
        >
          {label}
        </span>
      </button>
    </div>
  );
}

export function ContactDetailDialog({
  open,
  onOpenChange,
  contactId,
}: ContactDetailDialogProps) {
  const { orgId } = useRouteIds();
  const { canRead: canAccessContact } = useContactPermissions();
  const { data: rootContact, isLoading } = useContact(open ? contactId : null);

  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [farmTreeExpanded, setFarmTreeExpanded] = useState(true);

  const isFarmMode = rootContact ? isFarmManagementContact(rootContact) : false;

  const effectiveSelectedId = selectedNodeId ?? contactId;

  const { data: selectedContact } = useContact(
    open &&
      isFarmMode &&
      effectiveSelectedId !== null &&
      effectiveSelectedId !== contactId
      ? effectiveSelectedId
      : null
  );

  const displayContact: Contact | undefined = useMemo(() => {
    if (!rootContact) return undefined;
    if (!isFarmMode) return rootContact;
    if (effectiveSelectedId === rootContact.id) return rootContact;
    return selectedContact ?? rootContact;
  }, [rootContact, isFarmMode, effectiveSelectedId, selectedContact]);

  const detailsForTable = useMemo(() => {
    if (!displayContact) return [];
    const mapped = mapApiContactDetailsToForm(displayContact.contact_details);
    if (mapped.some((r) => r.name.trim())) {
      return mapped.map((r) => ({
        id: r.id,
        name: r.name,
        phone_number: r.phone_number,
        label: r.label,
        is_primary: r.is_primary,
      }));
    }
    return [
      {
        name: displayContact.full_name,
        phone_number:
          displayContact.phone_number || displayContact.home_phone_number || "",
        label: "",
        is_primary: true,
      },
    ];
  }, [displayContact]);

  const farmParents = useMemo(
    () =>
      rootContact && !isFarmMode
        ? parseFarmManagementContactRefs(
            rootContact.farm_management_contact_names
          )
        : [],
    [rootContact, isFarmMode]
  );

  const handleClose = useCallback(() => {
    setSelectedNodeId(null);
    setFarmTreeExpanded(true);
    onOpenChange(false);
  }, [onOpenChange]);

  const subContacts = rootContact?.sub_contacts ?? [];
  const displayTitle =
    displayContact?.full_name ?? rootContact?.full_name ?? "";
  const modalTitle = isFarmMode
    ? "Farm Management Contact Detail"
    : "Contact Detail";

  if (!open) {
    return null;
  }

  return (
    <Modal
      className="max-h-[min(85vh,520px)] max-w-[min(96vw,882px)]"
      isOpen={open}
      title={modalTitle}
      onClose={handleClose}
    >
      <div className={cn("flex min-h-0 flex-col", CONTACT_DETAIL_DIALOG_INSET)}>
        {isLoading ? (
          <p className="text-text-muted pt-2 pb-6 text-base">Loading...</p>
        ) : !rootContact ? (
          <p className="text-text-muted pt-2 pb-6 text-base">
            Contact not found.
          </p>
        ) : (
          <div
            className={cn(
              "flex min-h-[200px] min-w-0 flex-1 flex-col sm:min-h-[240px] sm:flex-row",
              "pt-2 pb-2",
              isFarmMode && "sm:gap-10"
            )}
          >
            {isFarmMode ? (
              <nav
                aria-label="Farm Management Contact hierarchy"
                className="flex w-full shrink-0 flex-col sm:w-[240px]"
              >
                <div className="divide-border flex flex-col divide-y px-2 py-1">
                  <FarmContactTreeNode
                    expanded={farmTreeExpanded}
                    hasChildren={subContacts.length > 0}
                    label={rootContact.full_name}
                    selected={effectiveSelectedId === rootContact.id}
                    onSelect={() => setSelectedNodeId(rootContact.id)}
                    onToggle={() => setFarmTreeExpanded((v) => !v)}
                  />
                  {farmTreeExpanded
                    ? subContacts.map((sub) => (
                        <FarmContactTreeNode
                          key={sub.id}
                          isChild
                          label={sub.full_name}
                          selected={effectiveSelectedId === sub.id}
                          onSelect={() => setSelectedNodeId(sub.id)}
                        />
                      ))
                    : null}
                </div>
              </nav>
            ) : null}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto pt-2 pb-4">
              <h3 className="text-text-primary mb-4 text-2xl font-bold">
                {displayTitle}
              </h3>

              {!isFarmMode && farmParents.length > 0 ? (
                <p className="text-text-muted mb-4 text-base">
                  {rootContact.full_name}
                  <span aria-hidden> → </span>
                  {farmParents.map((parent, index) =>
                    canAccessContact ? (
                      <span key={parent.id}>
                        {index > 0 ? ", " : null}
                        <Link
                          className="text-accent font-medium hover:underline"
                          href={`/${orgId}/contact/${parent.id}`}
                        >
                          {parent.full_name}
                        </Link>
                      </span>
                    ) : (
                      <span key={parent.id}>
                        {index > 0 ? ", " : null}
                        {parent.full_name}
                      </span>
                    )
                  )}
                </p>
              ) : null}

              <ContactDetailsReadOnlyTable details={detailsForTable} />
            </div>
          </div>
        )}

        <div className="flex shrink-0 justify-end py-4">
          <Button aria-label="Close" title="Close" onClick={handleClose} />
        </div>
      </div>
    </Modal>
  );
}
