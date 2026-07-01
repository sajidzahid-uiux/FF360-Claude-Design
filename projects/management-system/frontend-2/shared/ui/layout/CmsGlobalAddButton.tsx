"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";
import { Plus, UserPlus2 } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  isJobLeadTypeRouteSegment,
  normalizeJobLeadTypeSegment,
} from "@/constants";
import { PERMISSION_RESOURCES, usePermissionsFromStorage } from "@/hooks/permissions";
import { useDebounceNavigation } from "@/hooks/useDebounceNavigation";
import { useRouteIds } from "@/hooks/useRouteIds";
import { useModalStack } from "@/shared/model/use-modal-stack";
import { APP_ROUTES, orgUrl } from "@/shared/config/routes";
import { QUICK_CREATE_ACTIONS } from "@/shared/ui/quick-actions/quick-create-actions";

/**
 * When the contractor is inside a type-specific jobs/leads context
 * (`/jobs/excavation`, `/leads/drainage-tiling/123`, …), derive the canonical
 * type segment from the URL so "New Job"/"New Lead" can preselect it.
 */
function useCurrentJobLeadTypeParam(): string | undefined {
  const pathname = usePathname();
  if (!pathname) return undefined;
  const segments = pathname.split("/").filter(Boolean);
  const anchor = segments.findIndex((s) => s === "jobs" || s === "leads");
  if (anchor === -1) return undefined;
  const routeSegment = segments[anchor + 1];
  if (!isJobLeadTypeRouteSegment(routeSegment)) return undefined;
  return normalizeJobLeadTypeSegment(routeSegment);
}

/**
 * Omnipresent global "+" creator. Lives in the CMS top bar so asset creation is
 * one click away from any screen, mirroring the Tile Design product's add UX.
 * Also hosts the "Invite team member" shortcut (relocated from the sidebar).
 */
export function CmsGlobalAddButton() {
  const { orgId } = useRouteIds();
  const { navigateTo } = useDebounceNavigation();
  const { openModal } = useModalStack();
  const currentJobLeadType = useCurrentJobLeadTypeParam();
  const teamOrgPermissionActions = usePermissionsFromStorage(
    PERMISSION_RESOURCES.TEAM_ORGANIZATION_INFO
  ).permissionCodes;

  if (!orgId) return null;

  const canInviteTeamMember = teamOrgPermissionActions.includes("write");

  const actions = [
    ...QUICK_CREATE_ACTIONS.map((action) => {
      // Inside a type-specific jobs/leads page, preselect that type so the
      // contractor isn't asked to re-pick the category they're already on.
      const modal =
        currentJobLeadType &&
        (action.id === "add-job" || action.id === "add-lead") &&
        action.modal
          ? {
              ...action.modal,
              params: { ...action.modal.params, type: currentJobLeadType },
            }
          : action.modal;
      return {
        id: action.id,
        label: action.label,
        description: action.description,
        icon: action.icon,
        modal,
        href: action.href ? action.href(orgId) : undefined,
      };
    }),
    ...(canInviteTeamMember
      ? [
          {
            id: "invite-team-member",
            label: "Invite Team Member",
            description: "Send a team invitation",
            icon: UserPlus2,
            modal: undefined,
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
    if (!action) return;
    // Prefer opening the modal in place — layered on the current path so the
    // module the user is on does NOT change.
    if (action.modal) {
      openModal(action.modal.key, action.modal.params);
      return;
    }
    if (action.href) navigateTo(action.href);
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
