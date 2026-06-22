"use client";

import type { ColumnDef } from "@tanstack/react-table";

import type { ContactInfo } from "@/api/types";
import { ClientsAndFarmsCell } from "@/features/contacts";
import { ON_SITE_OPERATIONS_LABEL } from "@/features/contacts/model/constants";

export function clientsAndFarmsColumn<
  T extends {
    contact_info?: ContactInfo;
    farm_name?: string | null;
    contacts_count?: number;
    farms_count?: number;
  },
>(): ColumnDef<T, unknown> {
  return {
    id: "clients_and_farms",
    header: `Clients and ${ON_SITE_OPERATIONS_LABEL}`,
    cell: ({ row }) => (
      <ClientsAndFarmsCell
        contactInfo={row.original.contact_info}
        contactsCount={row.original.contacts_count}
        farmName={row.original.farm_name}
        farmsCount={row.original.farms_count}
      />
    ),
    size: 220,
  };
}
