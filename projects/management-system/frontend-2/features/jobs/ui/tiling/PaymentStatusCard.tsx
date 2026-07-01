"use client";

import { useMemo } from "react";

import { Dropdown } from "@fieldflow360/org-ui";

import { buildPaymentStatusDropdownOptions } from "@/features/jobs";
import type { PaymentStatus } from "@/hooks/usePaymentStatuses";

interface PaymentStatusCardProps {
  disabled?: boolean;
  paymentStatusId: string;
  onChange: (value: string) => void;
  paymentStatuses: PaymentStatus[];
}

export default function PaymentStatusCard({
  disabled = false,
  paymentStatusId,
  onChange,
  paymentStatuses,
}: PaymentStatusCardProps) {
  const options = useMemo(
    () => buildPaymentStatusDropdownOptions(paymentStatuses),
    [paymentStatuses]
  );

  // Rendered as a normal-width field (not a full-width card) so it reads like
  // the other inline inputs on the tab.
  return (
    <div className="w-full max-w-xs">
      <Dropdown
        fullWidth
        disabled={disabled}
        label="Payment Status"
        options={options}
        placeholder="Select payment status…"
        value={paymentStatusId || "none"}
        onChange={onChange}
      />
    </div>
  );
}
