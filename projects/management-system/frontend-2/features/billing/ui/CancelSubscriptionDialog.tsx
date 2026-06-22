"use client";

import type { FormEvent } from "react";

import { AppFormModal } from "@fieldflow360/org-ui";

import { TouchSlideText } from "@/shared/ui/common";

const TruncatedPlanTitle = ({ title }: { title: string }) => {
  const isLongTitle = title.length > 30;

  if (!isLongTitle) {
    return <span className="font-medium">{title}</span>;
  }

  return (
    <div className="max-w-[200px] overflow-hidden whitespace-nowrap">
      <TouchSlideText
        className="font-medium"
        maxWidth="max-w-[200px]"
        text={title}
      />
    </div>
  );
};

export interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  planName: string;
  renewalDate: string;
  isLoading?: boolean;
}

export function CancelSubscriptionDialog({
  open,
  onOpenChange,
  onConfirm,
  planName,
  renewalDate,
  isLoading = false,
}: CancelSubscriptionDialogProps) {
  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AppFormModal
      showCancel
      cancelDisabled={isLoading}
      cancelLabel="Keep Subscription"
      isOpen={open}
      isSubmitting={isLoading}
      submitLabel={isLoading ? "Cancelling..." : "Cancel Subscription"}
      title="Cancel Subscription"
      width={520}
      onClose={() => onOpenChange(false)}
      onSubmit={handleSubmit}
    >
      <div className="space-y-3">
        <p className="text-text-primary text-sm">
          Are you sure you want to cancel your{" "}
          <span className="inline-flex items-center">
            <span className="text-text-muted">&quot;</span>
            <TruncatedPlanTitle title={planName} />
            <span className="text-text-muted">&quot;</span>
          </span>{" "}
          subscription?
        </p>
        <p className="text-text-muted text-sm">
          Your subscription will remain active until{" "}
          <span className="font-medium">
            {new Date(renewalDate).toLocaleDateString()}
          </span>
          . You can reactivate your subscription at any time before this date.
        </p>
      </div>
    </AppFormModal>
  );
}
