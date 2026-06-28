"use client";

import { useCallback, useMemo, useState } from "react";

import {
  CrewDirectoryView,
  type CrewGroupFormEditContext,
  CrewGroupFormModal,
  CrewGroupsView,
  CrewManagementBreadcrumbToolbar,
  type CrewManagementTab,
} from "@/features/crew-management";
import { useRoutePermissions } from "@/hooks/permissions";
import { useAllCrewGroups } from "@/hooks/queries";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

export default function CrewManagementPage() {
  const [activeTab, setActiveTab] = useState<CrewManagementTab>("groups");
  const { stack, openModal, closeModalKey } = useModalStack();
  const { data: crewGroups } = useAllCrewGroups();

  const createModalOpen = stack.some((f) => f.key === "create-crew-group");
  const editFrame = stack.find((f) => f.key === "edit-crew-group");
  const editGroupId = editFrame ? Number(editFrame.params.id) : null;
  const editContext = useMemo<CrewGroupFormEditContext | undefined>(
    () =>
      editGroupId !== null
        ? crewGroups?.find((g) => g.id === editGroupId)
        : undefined,
    [crewGroups, editGroupId]
  );

  const { read: canViewCrewManagement, write: canEditCrewManagement } =
    useRoutePermissions() || {};

  const handleEditGroup = useCallback(
    (context: CrewGroupFormEditContext) => {
      openModal("edit-crew-group", { id: String(context.id) });
    },
    [openModal]
  );

  const closeEditModal = useCallback(
    (open: boolean) => {
      if (!open) {
        closeModalKey("edit-crew-group");
      }
    },
    [closeModalKey]
  );

  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={[]}
      description="Organize crews into groups and manage member assignments."
      emptyState={{
        title: "No crew data",
        description: "Crew management data will appear here.",
      }}
      error={null}
      isLoading={false}
      title="Crew Management"
    >
      {() => {
        if (!canViewCrewManagement) {
          return (
            <AccessDeniedView message="You don't have access to view this page" />
          );
        }

        return (
          <div className="flex min-h-0 flex-1 flex-col gap-6">
            <CrewManagementBreadcrumbToolbar
              activeTab={activeTab}
              canEdit={!!canEditCrewManagement}
              onAddGroup={() => openModal("create-crew-group")}
              onTabChange={setActiveTab}
            />

            {activeTab === "groups" ? (
              <CrewGroupsView onEditGroup={handleEditGroup} />
            ) : (
              <CrewDirectoryView />
            )}

            <CrewGroupFormModal
              mode="create"
              open={createModalOpen}
              onOpenChange={(o) => {
                if (!o) closeModalKey("create-crew-group");
              }}
            />

            <CrewGroupFormModal
              editContext={editContext}
              mode="edit"
              open={editFrame !== undefined}
              onOpenChange={closeEditModal}
            />
          </div>
        );
      }}
    </PageRenderer>
  );
}
