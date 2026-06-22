"use client";

import { useCallback, useState } from "react";

import {
  CrewDirectoryView,
  type CrewGroupFormEditContext,
  CrewGroupFormModal,
  CrewGroupsView,
  CrewManagementBreadcrumbToolbar,
  type CrewManagementTab,
} from "@/features/crew-management";
import { useRoutePermissions } from "@/hooks/permissions";
import { PageRenderer } from "@/shared/ui/common";
import { AccessDeniedView } from "@/shared/ui/permissions";

export default function CrewManagementPage() {
  const [activeTab, setActiveTab] = useState<CrewManagementTab>("groups");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editContext, setEditContext] = useState<
    CrewGroupFormEditContext | undefined
  >();

  const { read: canViewCrewManagement, write: canEditCrewManagement } =
    useRoutePermissions() || {};

  const handleEditGroup = useCallback((context: CrewGroupFormEditContext) => {
    setEditContext(context);
  }, []);

  const closeEditModal = useCallback((open: boolean) => {
    if (!open) {
      setEditContext(undefined);
    }
  }, []);

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
              onAddGroup={() => setCreateModalOpen(true)}
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
              onOpenChange={setCreateModalOpen}
            />

            <CrewGroupFormModal
              editContext={editContext}
              mode="edit"
              open={editContext !== undefined}
              onOpenChange={closeEditModal}
            />
          </div>
        );
      }}
    </PageRenderer>
  );
}
