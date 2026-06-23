"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";
import { Plus, UserPlus2 } from "lucide-react";

import { PERMISSION_RESOURCES, usePermissionsFromStorage } from "@/hooks/permissions";
import { useDebounceNavigation } from "@/hooks/useDebounceNavigation";
import { useRouteIds } from "@/hooks/useRouteIds";
import { APP_ROUTES, orgUrl } from "@/shared/config/routes";
import { QUICK_CREATE_ACTIONS } from "@/shared/ui/quick-actions/quick-create-actions";

/**
 * Omnipresent global "+" creator. Lives in the CMS top bar so asset creation is
 * one click away from any screen, mirroring the Tile Design product's add UX.
 * Also hosts the "Invite team member" shortcut (relocated from the sidebar).
 */
export function CmsGlobalAddButton() {
  const { orgId } = useRouteIds();
  const { navigateTo } = useDebounceNavigation();
  const teamOrgPermissionActions = usePermissionsFromStorage(
    PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO
  ).permissionCodes;

  if (!orgId) return null;

  const canInviteTeamMember = teamOrgPermissionActions.includes("write");

  const actions = [
    ...QUICK_CREATE_ACTIONS.map((action) => ({
      id: action.id,
      label: action.label,
      description: action.description,
      icon: action.icon,
      href: action.href(orgId),
    })),
    ...(canInviteTeamMember
      ? [
          {
            id: "invite-team-member",
            label: "Invite Team Member",
            description: "Send a team invitation",
            icon: UserPlus2,
            href: `${orgUrl(orgId, APP_ROUTES.team, "invite=true")}`,
          },
        ]
      : []),
  ];

  const options: DropdownOption<string>[] = actions.map((action) => {
    const Icon = action.icon;
    return {
      value: action.id,
      label: action.label,
      description: action.description,
      icon: <Icon className="h-4 w-4" />,
    };
  });

  const handleChange = (value: string) => {
    const action = actions.find((item) => item.id === value);
    if (action) navigateTo(action.href);
  };

  return (
    <Dropdown
      menuMinWidth={240}
      options={options}
      trigger={
        <Button
          aria-label="Create new"
          leftIcon={<Plus className="h-5 w-5" />}
          size={ComponentSizeEnum.MD}
          title="New"
          variant={ButtonVariantEnum.PRIMARY}
        />
      }
      onChange={handleChange}
    />
  );
}
