import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  SearchInput,
} from "@fieldflow360/org-ui";
import { PlusCircle } from "lucide-react";

import { useRoutePermissions } from "@/hooks/permissions";

interface TeamManagementActionsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onInviteClick: () => void;
  onShowInvitedClick: () => void;
  canInviteMore?: boolean;
}

export const TeamManagementActions = ({
  searchValue,
  onSearchChange,
  onInviteClick,
  onShowInvitedClick,
  canInviteMore = true,
}: TeamManagementActionsProps) => {
  const { read: canViewTeamMembers, write: canEditTeam } =
    useRoutePermissions() || {};

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <SearchInput
        className="w-full min-w-0 lg:max-w-sm"
        placeholder="Search team members..."
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange("")}
      />

      <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
        {canViewTeamMembers ? (
          <Button
            disabled={!canInviteMore}
            leftIcon={<PlusCircle className="h-4 w-4" />}
            size={ComponentSizeEnum.SM}
            title="Invite member"
            onClick={onInviteClick}
          />
        ) : null}
        {canEditTeam ? (
          <Button
            size={ComponentSizeEnum.SM}
            title="Invited members"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onShowInvitedClick}
          />
        ) : null}
      </div>
    </div>
  );
};
