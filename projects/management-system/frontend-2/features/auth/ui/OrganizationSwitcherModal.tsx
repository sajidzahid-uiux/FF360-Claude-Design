"use client";

import { useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import {
  type CreateOrganizationModalValues,
  FieldFlowOrganizationSourceEnum,
  OrganizationSwitcherModal as OrgUIOrganizationSwitcherModal,
  type OrganizationCreateFieldErrors,
  toOrganizationCreateFormData,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import type { OrganizationListRow } from "@/api/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getPlanName } from "@/features/billing/lib/plan";
import { useOrganizationData } from "@/hooks";
import { orgDashboardPath, orgSubscribePath } from "@/lib/auth-routes";
import { mapOrganizationCreateApiErrors } from "@/lib/organization-create";

type OrganizationSwitcherModalProps = {
  open: boolean;
  onClose?: () => void;
};

export function OrganizationSwitcherModal({
  open,
  onClose,
}: OrganizationSwitcherModalProps) {
  const { isLoading: isAuth0Loading } = useAuth0();
  const { selectedOrganization, setSelectedOrganization } = useAuth();
  const {
    data: organizations = [],
    isLoading,
    addOrganization,
  } = useOrganizationData();
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [createFieldErrors, setCreateFieldErrors] =
    useState<OrganizationCreateFieldErrors>({});

  useEffect(() => {
    if (!open) {
      setIsCreating(false);
    }
  }, [open]);

  const handleClose = () => {
    setIsCreating(false);
    setCreateFieldErrors({});
    onClose?.();
  };

  const navigateToOrg = (org: OrganizationListRow) => {
    const orgId = String(org.id);
    setSelectedOrganization(orgId);
    const hasActiveSubscription =
      !!org.current_plan && getPlanName(org.current_plan) !== "";
    window.location.href = hasActiveSubscription
      ? orgDashboardPath(orgId)
      : orgSubscribePath(orgId);
  };

  const handleSelectOrganization = (organizationId: string | number) => {
    const org = organizations.find(
      (item) => item.id === Number(organizationId)
    );
    if (org) {
      toast.success("Organization selected.", {
        description: `You are now working with ${org.name}`,
      });
      navigateToOrg(org);
    }
    handleClose();
  };

  const handleCreateOrganization = async (
    values: CreateOrganizationModalValues
  ) => {
    setIsSubmittingCreate(true);
    setCreateFieldErrors({});
    try {
      const newOrg = await addOrganization.mutateAsync(
        toOrganizationCreateFormData(values)
      );
      toast.success("Organization created", {
        description: `${newOrg.name} has been created successfully.`,
      });
      navigateToOrg(newOrg as OrganizationListRow);
      handleClose();
    } catch (error: unknown) {
      const responseData =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: unknown } }).response?.data !==
          "undefined"
          ? (error as { response: { data: unknown } }).response.data
          : undefined;

      const mapped = mapOrganizationCreateApiErrors(responseData);
      setCreateFieldErrors(mapped);
      const general = mapped.general?.[0];
      toast.error(
        general ?? "Failed to create organization. Please try again."
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  if (!open) return null;

  const isInitializing = isAuth0Loading;

  return (
    <OrgUIOrganizationSwitcherModal
      createForm={{
        isOpen: open || isCreating,
        isSubmitting: isSubmittingCreate,
        fieldErrors: createFieldErrors,
        onClose: () => {
          setIsCreating(false);
          setCreateFieldErrors({});
        },
        onSubmit: handleCreateOrganization,
      }}
      isLoading={isLoading || isInitializing}
      isOpen={open || isCreating}
      organizations={organizations}
      organizationSource={FieldFlowOrganizationSourceEnum.CMS}
      selectedOrganizationId={
        selectedOrganization != null && selectedOrganization !== ""
          ? selectedOrganization
          : undefined
      }
      onClose={handleClose}
      onSelectOrganization={handleSelectOrganization}
    />
  );
}
