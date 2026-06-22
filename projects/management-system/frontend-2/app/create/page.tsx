"use client";

import { useState } from "react";

import {
  CreateOrganizationModal,
  type CreateOrganizationModalValues,
  type OrganizationCreateFieldErrors,
  OrganizationWelcomeLayout,
  toOrganizationCreateFormData,
} from "@fieldflow360/org-ui";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDebounceNavigation, useOrganizationData } from "@/hooks";
import { AUTH_ROUTES, orgDashboardPath } from "@/lib/auth-routes";
import { mapOrganizationCreateApiErrors } from "@/lib/organization-create";

const CMS_HERO = {
  heroImageSrc: "/images/log-in-2.webp",
  heroImageAlt: "Organization creation",
} as const;

export default function CreateOrganizationPage() {
  const { navigateTo } = useDebounceNavigation();
  const { addOrganization } = useOrganizationData();
  const { setSelectedOrganization } = useAuth();
  const [fieldErrors, setFieldErrors] = useState<OrganizationCreateFieldErrors>(
    {}
  );

  const handleBack = () => {
    navigateTo(AUTH_ROUTES.organizations);
  };

  const handleSubmit = async (values: CreateOrganizationModalValues) => {
    setFieldErrors({});

    try {
      const newOrg = await addOrganization.mutateAsync(
        toOrganizationCreateFormData(values)
      );
      setSelectedOrganization(String(newOrg.id));
      navigateTo(orgDashboardPath(newOrg.id));
    } catch (error: unknown) {
      const responseData =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: unknown } }).response?.data !==
          "undefined"
          ? (error as { response: { data: unknown } }).response.data
          : undefined;

      setFieldErrors(mapOrganizationCreateApiErrors(responseData));
    }
  };

  return (
    <OrganizationWelcomeLayout {...CMS_HERO}>
      <CreateOrganizationModal
        isOpen
        fieldErrors={fieldErrors}
        isSubmitting={addOrganization.isPending}
        layout="inline"
        onClose={handleBack}
        onSubmit={handleSubmit}
      />
    </OrganizationWelcomeLayout>
  );
}
