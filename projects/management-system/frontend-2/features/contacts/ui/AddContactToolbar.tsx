"use client";

import { Button } from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import { Dropdown } from "@/shared/ui/common";

export interface AddContactToolbarProps {
  onAddStandardContact: () => void;
  onAddFarmContact: () => void;
}

export function AddContactToolbar({
  onAddStandardContact,
  onAddFarmContact,
}: AddContactToolbarProps) {
  return (
    <Dropdown
      align="start"
      items={[
        {
          id: "single-contact",
          label: "Single Contact",
          onSelect: onAddStandardContact,
        },
        {
          id: "farm-contact",
          label: "Farm Contact",
          onSelect: onAddFarmContact,
        },
      ]}
      trigger={
        <Button
          leftIcon={<Plus aria-hidden className="h-4 w-4" strokeWidth={2} />}
          title="Add Contact"
        />
      }
      width={180}
    />
  );
}
