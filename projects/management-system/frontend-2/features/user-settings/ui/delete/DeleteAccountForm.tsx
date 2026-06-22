"use client";

import { FormEvent, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  Checkbox,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { toast } from "sonner";

import { useUserData } from "@/hooks";
import { SanitizedInput } from "@/shared/ui/primitives";
import { getErrorMessage } from "@/utils/apiError";

const DeleteAccountForm = () => {
  const [checked, setChecked] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { removeUser } = useUserData();

  const isEnabled = checked && confirmText === "DELETE";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEnabled) return;

    try {
      await removeUser.mutateAsync();
      toast.success("Account deleted successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete account"));
    }
  };

  return (
    <form
      className="border-border-subtle space-y-5 border-t pt-5"
      onSubmit={handleSubmit}
    >
      <label
        className="text-text-primary flex cursor-pointer items-start gap-3 text-sm leading-relaxed"
        htmlFor="delete-permanent"
      >
        <Checkbox
          checked={checked}
          className="mt-0.5 shrink-0"
          id="delete-permanent"
          onChange={(event) => setChecked(event.target.checked)}
        />
        I understand that this action is permanent and cannot be undone.
      </label>

      <SanitizedInput
        fullWidth
        className="max-w-sm"
        id="delete-confirm"
        label='Type "DELETE" to confirm'
        placeholder="DELETE"
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          disabled={!isEnabled}
          loading={removeUser.isPending}
          size={ComponentSizeEnum.SM}
          title={removeUser.isPending ? "Deleting..." : "Delete account"}
          type="submit"
          variant={ButtonVariantEnum.DANGER}
        />
        <p className="text-text-muted text-xs leading-relaxed">
          You will be signed out immediately after deletion completes.
        </p>
      </div>
    </form>
  );
};

export default DeleteAccountForm;
