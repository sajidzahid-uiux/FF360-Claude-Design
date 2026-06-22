"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  CreateOrganizationModal,
  type CreateOrganizationModalValues,
  DeleteOrganization,
  FieldFlowOrganizationSourceEnum,
  Loader,
  OrganizationInfo,
  mapOrganizationToFieldFlow,
  toOrganizationCreateFormData,
} from "@fieldflow360/org-ui";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  useOrganizationById,
  useOrganizationData,
} from "@/hooks/useOrganizationData";
import { useRouteIds } from "@/hooks/useRouteIds";
import { useDeleteDialogOpen } from "@/shared/model";
import { AccessDeniedView } from "@/shared/ui/permissions";

import { useOrganizationSettingsPermissions } from "./use-organization-settings-permissions";

export function OrganizationSettingsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openDialog } = useDeleteDialogOpen();
  const { orgId } = useRouteIds();
  const {
    data: organization,
    isLoading,
    error,
    refetch,
  } = useOrganizationById(orgId);
  const { patchOrganization, deleteOrganization } = useOrganizationData();
  const {
    canView,
    canEdit,
    canDelete,
    isLoading: permissionsLoading,
  } = useOrganizationSettingsPermissions();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fieldFlowOrganization = organization
    ? mapOrganizationToFieldFlow(
        organization,
        FieldFlowOrganizationSourceEnum.CMS
      )
    : null;

  const handleDeleteOrganization = useCallback(() => {
    if (!orgId || !organization) return;

    openDialog({
      title: "Delete organization",
      description: `Are you sure you want to delete "${organization.name}"? This action cannot be undone. You will be returned to your organizations.`,
      confirmLabel: "Delete organization",
      variant: "danger",
      onConfirm: async () => {
        await deleteOrganization.mutateAsync();
        await queryClient.invalidateQueries({ queryKey: ["organizations"] });
        toast.success(
          "Organization deleted. You have been returned to your organizations."
        );
        router.push("/organizations");
      },
    });
  }, [
    deleteOrganization,
    openDialog,
    orgId,
    organization,
    queryClient,
    router,
  ]);

  const handleEditOpen = useCallback(() => {
    if (!canEdit) return;
    setIsEditOpen(true);
  }, [canEdit]);

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader text="Loading organization" />
      </div>
    );
  }

  if (!canView) {
    return <AccessDeniedView />;
  }

  if (error || !fieldFlowOrganization || !organization) {
    return (
      <div className="border-border-subtle rounded-lg border bg-[var(--color-feedback-error-soft)] p-4 text-sm text-[var(--color-feedback-error-strong)]">
        {error instanceof Error
          ? error.message
          : "Failed to load organization."}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <OrganizationInfo
          canEdit={canEdit}
          organization={fieldFlowOrganization}
          organizationSource={FieldFlowOrganizationSourceEnum.CMS}
          onEdit={canEdit ? handleEditOpen : undefined}
        />

        <DeleteOrganization
          canDelete={canDelete}
          loading={deleteOrganization.isPending}
          onDelete={canDelete ? handleDeleteOrganization : undefined}
        />
      </div>

      <CreateOrganizationModal
        disableWhenPristine
        showLogo
        initialValues={{
          name: organization.name ?? "",
          email: organization.email ?? "",
          phoneNumber: organization.phone_number ?? "",
          address: organization.address ?? "",
          latitude: organization.latitude ?? null,
          longitude: organization.longitude ?? null,
          existingLogoUrl: organization.logo ?? null,
        }}
        isOpen={isEditOpen}
        primaryLabel="Save Changes"
        title="Edit Organization"
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (values: CreateOrganizationModalValues) => {
          if (!orgId || !canEdit) return;
          const formData = toOrganizationCreateFormData(values);
          await patchOrganization.mutateAsync(formData);
          await refetch();
          await queryClient.invalidateQueries({ queryKey: ["organizations"] });
          toast.success("Organization details updated");
          setIsEditOpen(false);
        }}
      />
    </>
  );
}
