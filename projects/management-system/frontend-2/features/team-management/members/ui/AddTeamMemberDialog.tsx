import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  AppFormModal,
  Dropdown,
  type DropdownOption,
  Input,
} from "@fieldflow360/org-ui";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { useTeamData } from "@/hooks";

const EMAIL_MAX_LENGTH = 254;

function normalizeRoleLabel(name: string): string {
  if (name === "Administator" || name === "Adminstrartor") {
    return "Administrator";
  }
  return name;
}

function getInviteErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: number } }).response?.status ===
      "number" &&
    (error as { response: { status: number } }).response.status === 403
  ) {
    return "You do not have permission to invite members.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to send invitation.";
}

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleOptions: [string, string][];
  canInviteMembers?: boolean;
}

export default function AddTeamMemberDialog({
  open,
  onOpenChange,
  roleOptions,
  canInviteMembers,
}: AddTeamMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const { inviteMember } = useTeamData();

  const roleDropdownOptions = useMemo((): DropdownOption<string>[] => {
    return roleOptions.map(([code, name]) => ({
      value: code,
      label: normalizeRoleLabel(name),
    }));
  }, [roleOptions]);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setRole("");
      setEmailError(undefined);
    }
  }, [open]);

  const validateEmail = (value: string): boolean => {
    if (value.length > EMAIL_MAX_LENGTH) {
      setEmailError(`Maximum ${EMAIL_MAX_LENGTH} characters allowed`);
      return false;
    }
    setEmailError(undefined);
    return true;
  };

  const handleClose = () => {
    if (!inviteMember.isPending) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!canInviteMembers) {
      toast.error("You do not have permission to invite members.");
      handleClose();
      return;
    }

    if (!email.trim() || !role) {
      toast.error("Email and role are required.");
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    const roleId = parseInt(role, 10);
    if (Number.isNaN(roleId)) {
      toast.error("Invalid role selected. Please select a valid role.");
      return;
    }

    try {
      await inviteMember.mutateAsync({ email: email.trim(), role_id: roleId });
      setEmail("");
      setRole("");
      onOpenChange(false);
      toast.success("Invitation sent successfully!");
    } catch (error: unknown) {
      toast.error(getInviteErrorMessage(error));
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      isSubmitting={inviteMember.isPending}
      submitDisabled={!email.trim() || !role.trim()}
      submitLabel="Send Invitation"
      title="Invite Team Member"
      width={640}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <Input
          error={emailError}
          label="Email Address"
          leftIcon={<Mail className="h-5 w-5" />}
          maxLength={EMAIL_MAX_LENGTH}
          placeholder="colleague@example.com"
          type="email"
          value={email}
          onBlur={(event) => validateEmail(event.target.value)}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) {
              validateEmail(event.target.value);
            }
          }}
        />
        <Dropdown
          fullWidth
          label="Role"
          options={roleDropdownOptions}
          placeholder="Select Role"
          value={role || undefined}
          onChange={setRole}
        />
      </div>
    </AppFormModal>
  );
}
