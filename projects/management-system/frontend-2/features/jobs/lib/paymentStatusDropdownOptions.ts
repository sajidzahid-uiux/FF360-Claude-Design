import type { DropdownOption } from "@fieldflow360/org-ui";

import type { PaymentStatus } from "@/hooks/usePaymentStatuses";
import { coloredDropdownOptionIcon } from "@/shared/ui/common/Dropdown";

export function buildPaymentStatusDropdownOptions(
  paymentStatuses: PaymentStatus[]
): DropdownOption<string>[] {
  return [
    { value: "none", label: "None" },
    ...paymentStatuses.map((status) => ({
      value: status.id.toString(),
      label: status.title,
      icon: coloredDropdownOptionIcon(status.color),
    })),
  ];
}
