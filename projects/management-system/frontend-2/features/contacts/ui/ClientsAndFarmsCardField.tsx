"use client";

import type { ContactInfo } from "@/api/types";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";
import type { GenericCardField } from "@/shared/ui/common/GenericCard";

import { ClientsAndFarmsCell } from "./ClientsAndFarmsCell";

export function ClientsAndFarmsCardField(
  contactInfo?: ContactInfo | null,
  farmName?: string | null,
  contactsCount?: number,
  farmsCount?: number
): GenericCardField {
  return {
    label: `Clients and ${ON_SITE_OPERATIONS_LABEL}`,
    hideLabel: true,
    value: (
      <ClientsAndFarmsCell
        contactInfo={contactInfo}
        contactsCount={contactsCount}
        farmName={farmName}
        farmsCount={farmsCount}
        variant="card"
      />
    ),
  };
}
