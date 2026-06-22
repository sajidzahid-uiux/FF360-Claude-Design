import { useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { Trash2 } from "lucide-react";

import type { TeamMember } from "@/api/types";
import {
  useInvitedMembersWithPermission,
  useMapping,
  useTeamData,
} from "@/hooks";
import { StorageKey, useDataFromStorageByKey } from "@/hooks/storage-data";
import { DialogTemplate, TouchSlideText } from "@/shared/ui/common";
import { getRoleLabel } from "@/utils/roleUtils";

interface InvitedMember {
  id: number;
  email: string;
  accepted?: boolean;
  role_name?: string;
  role_id?: number;
  role?: string | number;
  invited_by?: number | string;
  invited_by_name?: string;
}

interface InvitedMembersDialogProps {
  handleClose: () => void;
  showInvitedDialog: boolean;
  setShowInvitedDialog: (open: boolean) => void;
}

export const InvitedMembersDialog = ({
  handleClose,
  showInvitedDialog,
  setShowInvitedDialog,
}: InvitedMembersDialogProps) => {
  const { data: team, removeInvitedMember } = useTeamData();

  const canManageMembers =
    useDataFromStorageByKey(StorageKey.USER_ROLE)?.is_admin === true;
  const { data: invitedMembers } =
    useInvitedMembersWithPermission(canManageMembers);
  const { data: roleMappings } = useMapping("member_roles");

  const roleMap = useMemo(() => {
    if (!roleMappings) return {};
    return Array.isArray(roleMappings)
      ? Object.fromEntries(roleMappings)
      : roleMappings;
  }, [roleMappings]);

  return (
    <DialogTemplate
      footer={
        <div className="flex shrink-0 justify-end">
          <Button
            aria-label="Cancel"
            title="Cancel"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => handleClose()}
          />
        </div>
      }
      maxWidth="28rem"
      open={showInvitedDialog}
      title="Invited Members"
      onOpenChange={setShowInvitedDialog}
    >
      <div className="max-h-[60vh] space-y-4 overflow-y-auto">
        {invitedMembers && invitedMembers.length > 0 ? (
          invitedMembers
            .filter((member: InvitedMember) => member.accepted !== true)
            .map((member: InvitedMember) => (
              <div
                key={member.id}
                className="bg-bg-surface relative flex flex-col gap-1 rounded border p-3"
              >
                <div className="mb-2 flex items-center justify-between border-b pb-2">
                  <TruncatedEmail email={member.email} />

                  <Button
                    iconOnly
                    aria-label="Remove invited member"
                    leftIcon={
                      <Trash2 className="text-feedback-error h-4 w-4" />
                    }
                    size={ComponentSizeEnum.SM}
                    variant={ButtonVariantEnum.GHOST}
                    onClick={() =>
                      removeInvitedMember.mutate(String(member.id))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-text-muted text-xs">Role</div>
                  <div className="mb-1 text-sm">
                    {member.role_name ||
                      getRoleLabel(
                        member.role_id != null
                          ? String(member.role_id)
                          : member.role != null
                            ? String(member.role)
                            : undefined,
                        roleMap
                      )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-text-muted text-xs">Invited by</div>
                  <div className="text-sm">
                    {member.invited_by_name ||
                      team?.find(
                        (user: TeamMember) =>
                          user.id === Number(member.invited_by)
                      )?.user?.username}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-text-muted text-center">No invited members.</div>
        )}
      </div>
    </DialogTemplate>
  );
};

const TruncatedEmail = ({ email }: { email: string }) => {
  const isLongEmail = email.length > 40;
  if (!isLongEmail) {
    return <span className="font-medium">{email}</span>;
  }
  return (
    <div className="max-w-[250px] overflow-hidden whitespace-nowrap">
      <TouchSlideText
        className="font-medium"
        maxWidth="max-w-[250px]"
        text={email}
      />
    </div>
  );
};
