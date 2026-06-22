"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import { CmsTabsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/CmsTabsBreadcrumbToolbar";

const CREW_TABS = [
  { value: "groups" as const, label: "Crew groups" },
  { value: "directory" as const, label: "Crew directory" },
] as const;

export type CrewManagementTab = (typeof CREW_TABS)[number]["value"];

export interface CrewManagementBreadcrumbToolbarProps {
  activeTab: CrewManagementTab;
  onTabChange: (tab: CrewManagementTab) => void;
  canEdit: boolean;
  onAddGroup: () => void;
}

export function CrewManagementBreadcrumbToolbar({
  activeTab,
  onTabChange,
  canEdit,
  onAddGroup,
}: CrewManagementBreadcrumbToolbarProps) {
  return (
    <CmsTabsBreadcrumbToolbar
      actions={
        activeTab === "groups" && canEdit ? (
          <Button
            aria-label="Add group"
            leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
            size={ComponentSizeEnum.SM}
            title="Add group"
            variant={ButtonVariantEnum.DEFAULT}
            onClick={onAddGroup}
          />
        ) : undefined
      }
      primaryTabs={CREW_TABS}
      primaryValue={activeTab}
      onPrimaryChange={onTabChange}
    />
  );
}
