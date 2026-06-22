"use client";

import { useParams } from "next/navigation";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import type { Contact } from "@/api/types";
import {
  useContact,
  useContactMutations,
  useDebounceNavigation,
  useRouteIds,
} from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import { getHttpErrorStatus } from "@/lib/utils";
import { ResourceErrorView } from "@/shared/ui/common";
import { useCmsBreadcrumbLabel } from "@/shared/ui/layout/cmsBreadcrumbOverrides";
import { AccessDeniedView } from "@/shared/ui/permissions";

import { LazyContactDetailView } from "./ContactDetailLazy";

export default function ContactDetailRoutePage() {
  const params = useParams();
  const { navigateTo } = useDebounceNavigation();
  const { orgId } = useRouteIds();
  const contactId = parseInt(params.id as string);
  const { read: canViewPage } = useRoutePermissions() || {};
  const { data: contact, isLoading, error } = useContact(contactId);
  const { remove: deleteContact } = useContactMutations();

  useCmsBreadcrumbLabel(contact?.full_name);

  const handleBack = () => {
    navigateTo(`/organizations/${orgId}/contact`);
  };

  const handleDelete = (contact: Contact) => {
    deleteContact.mutate(contact.id, {
      onSuccess: () => {
        navigateTo(`/organizations/${orgId}/contact`);
      },
      onError: (error) => {
        console.error("Error deleting contact:", error);
      },
    });
  };

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading…"
      />
    );
  }

  if (error || !contact) {
    const status = getHttpErrorStatus(error);
    return (
      <ResourceErrorView
        orgId={orgId}
        resourceLabel="contact"
        status={status}
      />
    );
  }

  if (!canViewPage) {
    return (
      <AccessDeniedView message="You do not have permission to view this contact." />
    );
  }

  return (
    <LazyContactDetailView
      contact={contact}
      onBack={handleBack}
      onDelete={handleDelete}
    />
  );
}
