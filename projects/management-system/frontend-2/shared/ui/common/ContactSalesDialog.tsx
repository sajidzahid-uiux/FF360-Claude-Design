"use client";

import { Input, Modal } from "@fieldflow360/org-ui";

export interface ContactSalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
}

export default function ContactSalesDialog({
  open,
  onOpenChange,
  email = "sales@fieldflow360.com",
}: ContactSalesDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <Modal
      isOpen={open}
      size="md"
      title="Talk to Our Sales Team"
      onClose={() => onOpenChange(false)}
    >
      <p className="text-text-muted text-sm">
        Our sales team is here to assist you with any questions about pricing
        and billing details. Schedule a quick call to get the support you need.
      </p>
      <div className="mt-4">
        <Input readOnly label="Email" value={email} />
      </div>
    </Modal>
  );
}
