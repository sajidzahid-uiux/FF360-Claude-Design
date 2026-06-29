"use client";

import {
  Button,
  ButtonVariantEnum,
  Dropdown,
  type DropdownOption,
} from "@fieldflow360/org-ui";
import { ChevronDown, RotateCcw, Save, User, Users } from "lucide-react";
import { toast } from "sonner";

import type {
  LeadColumnActiveScope,
  LeadColumnSaveScope,
} from "@/features/leads/lib/useLeadColumnPreferences";

type ScopeMenuValue = LeadColumnSaveScope | "reset";

export interface LeadColumnScopeMenuProps {
  isAdmin: boolean;
  isDirty: boolean;
  activeScope: LeadColumnActiveScope;
  hasUserPreference: boolean;
  onSave: (scope: LeadColumnSaveScope) => void;
  onReset: () => void;
}

const ACTIVE_SCOPE_LABEL: Record<LeadColumnActiveScope, string> = {
  user: "My columns",
  org: "Organization columns",
  default: "Default columns",
};

export function LeadColumnScopeMenu({
  isAdmin,
  isDirty,
  activeScope,
  hasUserPreference,
  onSave,
  onReset,
}: LeadColumnScopeMenuProps) {
  const options: DropdownOption<ScopeMenuValue>[] = [
    {
      value: "user",
      label: "Save for me",
      description: "Remember this column layout on your account",
      icon: <User aria-hidden className="h-4 w-4" />,
    },
    {
      value: "org",
      label: "Save for the whole organization",
      description: isAdmin
        ? "Set the default layout everyone sees"
        : "Only admins can change the organization default",
      icon: <Users aria-hidden className="h-4 w-4" />,
      disabled: !isAdmin,
    },
    {
      value: "reset",
      label: "Reset to default",
      description: "Discard your saved layout",
      icon: <RotateCcw aria-hidden className="h-4 w-4" />,
      variant: "danger",
      disabled: !hasUserPreference && !isDirty,
    },
  ];

  const handleChange = (value: ScopeMenuValue) => {
    if (value === "reset") {
      onReset();
      toast.success("Column layout reset to default");
      return;
    }
    onSave(value);
    toast.success(
      value === "org"
        ? "Saved as the organization default"
        : "Saved your column layout"
    );
  };

  const triggerLabel = isDirty
    ? "Save columns"
    : `Columns: ${ACTIVE_SCOPE_LABEL[activeScope]}`;

  return (
    <Dropdown<ScopeMenuValue>
      menuMinWidth={280}
      options={options}
      trigger={
        <Button
          leftIcon={<Save aria-hidden className="h-4 w-4" />}
          rightIcon={<ChevronDown aria-hidden className="h-4 w-4" />}
          title={triggerLabel}
          variant={ButtonVariantEnum.SURFACE}
        />
      }
      onChange={handleChange}
    />
  );
}
