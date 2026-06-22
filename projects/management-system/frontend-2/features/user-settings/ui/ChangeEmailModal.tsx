"use client";

import { type FormEvent, useEffect, useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import { getErrorMessage } from "@/utils/apiError";

export interface ChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateEmail: (email: string) => Promise<void>;
}

export function ChangeEmailModal({
  open,
  onOpenChange,
  onUpdateEmail,
}: ChangeEmailModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (!open) {
      setNewEmail("");
      setConfirmEmail("");
      setEmailError("");
      setIsUpdatingEmail(false);
    }
  }, [open]);

  const handleClose = () => {
    if (!isUpdatingEmail) {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!newEmail) {
      setEmailError("Please enter a new email address");
      return;
    }

    if (newEmail !== confirmEmail) {
      setEmailError("Email addresses do not match");
      return;
    }

    try {
      setIsUpdatingEmail(true);
      setEmailError("");
      await onUpdateEmail(newEmail);
      onOpenChange(false);
    } catch (error: unknown) {
      setEmailError(getErrorMessage(error, "Failed to update email"));
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      cancelLabel="Cancel"
      isOpen={open}
      isSubmitting={isUpdatingEmail}
      submitDisabled={!newEmail || !confirmEmail}
      submitLabel="Update Email"
      title="Change Email Address"
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <p className="text-text-muted text-sm">
        Enter your new email address below. You will need to verify your new
        email address.
      </p>
      <div className="space-y-4">
        <Input
          autoComplete="email"
          disabled={isUpdatingEmail}
          label="New Email Address"
          placeholder="Enter new email address"
          type="email"
          value={newEmail}
          onChange={(event) => {
            setNewEmail(event.target.value);
            if (emailError) setEmailError("");
          }}
        />
        <Input
          autoComplete="email"
          disabled={isUpdatingEmail}
          error={emailError}
          label="Confirm Email Address"
          placeholder="Confirm new email address"
          type="email"
          value={confirmEmail}
          onChange={(event) => {
            setConfirmEmail(event.target.value);
            if (emailError) setEmailError("");
          }}
        />
      </div>
    </AppFormModal>
  );
}
