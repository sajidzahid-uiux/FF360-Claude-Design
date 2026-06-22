"use client";

import { useMemo, useState } from "react";

import { Dropdown, type DropdownOption, cn } from "@fieldflow360/org-ui";
import { Briefcase, Check, User, UserPlus } from "lucide-react";

import { ResourceType } from "@/constants";

export type QuickActionConvertTarget = ResourceType | "contact";

export interface QuickActionConvertDropdownProps {
  contactConverted: boolean;
  leadConverted: boolean;
  jobConverted: boolean;
  onConvertContact: () => void;
  onConvertLead: () => void;
  onConvertJob: () => void;
}

export function QuickActionConvertDropdown({
  contactConverted,
  leadConverted,
  jobConverted,
  onConvertContact,
  onConvertLead,
  onConvertJob,
}: QuickActionConvertDropdownProps) {
  const [menuValue, setMenuValue] = useState<
    QuickActionConvertTarget | undefined
  >(undefined);

  const options = useMemo((): DropdownOption<QuickActionConvertTarget>[] => {
    return [
      {
        value: "contact",
        label: "Contact",
        disabled: contactConverted,
        icon: contactConverted ? (
          <Check
            aria-hidden
            className="h-4 w-4 text-green-600 dark:text-green-400"
            strokeWidth={2}
          />
        ) : (
          <User aria-hidden className="h-4 w-4" strokeWidth={2} />
        ),
      },
      {
        value: ResourceType.LEAD,
        label: "Leads",
        disabled: leadConverted,
        icon: leadConverted ? (
          <Check
            aria-hidden
            className="h-4 w-4 text-green-600 dark:text-green-400"
            strokeWidth={2}
          />
        ) : (
          <UserPlus aria-hidden className="h-4 w-4" strokeWidth={2} />
        ),
      },
      {
        value: ResourceType.JOB,
        label: "Jobs",
        disabled: jobConverted,
        icon: jobConverted ? (
          <Check
            aria-hidden
            className="h-4 w-4 text-green-600 dark:text-green-400"
            strokeWidth={2}
          />
        ) : (
          <Briefcase aria-hidden className="h-4 w-4" strokeWidth={2} />
        ),
      },
    ];
  }, [contactConverted, jobConverted, leadConverted]);

  const handleChange = (value: QuickActionConvertTarget) => {
    if (value === "contact") {
      onConvertContact();
    } else if (value === ResourceType.LEAD) {
      onConvertLead();
    } else {
      onConvertJob();
    }
    setMenuValue(undefined);
  };

  return (
    <Dropdown
      className="w-auto"
      fullWidth={false}
      menuMinWidth={200}
      options={options}
      placeholder="Convert"
      triggerClassName={cn(
        "rounded-md border border-border-subtle bg-white px-4 text-base font-medium text-black shadow-sm",
        "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50",
        "night:border-[#2d4a48] night:bg-[#142433] night:text-slate-100",
        "[&>span:first-child]:text-inherit"
      )}
      value={menuValue}
      onChange={handleChange}
    />
  );
}
