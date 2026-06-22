"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  FARM_MANAGEMENT_CONTACT_LABEL,
  FarmManagementContactCell,
} from "@/features/contacts";
import type { ContactInfoWithFarmManagement } from "@/features/contacts/lib";

export function farmManagementContactColumn<
  T extends {
    contact_info?: ContactInfoWithFarmManagement | null;
  },
>(): ColumnDef<T, unknown> {
  return {
    id: "farm_management_contact",
    header: FARM_MANAGEMENT_CONTACT_LABEL,
    cell: ({ row }) => (
      <FarmManagementContactCell contactInfo={row.original.contact_info} />
    ),
    size: 180,
  };
}
