"use client";

import { useMemo } from "react";

import { Dropdown } from "@fieldflow360/org-ui";

import { buildPaymentStatusDropdownOptions } from "@/features/jobs";
import type { PaymentStatus } from "@/hooks/usePaymentStatuses";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Payment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Dropdown
          fullWidth
          disabled={disabled}
          label="Payment status"
          options={options}
          placeholder="Select payment status…"
          value={paymentStatusId || "none"}
          onChange={onChange}
        />
      </CardContent>
    </Card>
  );
}
