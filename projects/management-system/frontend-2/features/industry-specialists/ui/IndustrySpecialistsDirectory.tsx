"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  type Column,
  TableDataModeEnum,
  TableToolbar,
  TableVariantEnum,
} from "@fieldflow360/org-ui";
import { ExternalLink } from "lucide-react";

import {
  INDUSTRY_SPECIALISTS,
  type IndustrySpecialist,
} from "@/features/industry-specialists/data/industrySpecialists";
import { CmsOrgUiTable } from "@/shared/ui";

function filterSpecialists(
  specialists: IndustrySpecialist[],
  query: string
): IndustrySpecialist[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return specialists;

  return specialists.filter((specialist) =>
    specialist.name.toLowerCase().includes(normalized)
  );
}

function openSupplierSite(link: string) {
  window.open(link, "_blank", "noopener,noreferrer");
}

export interface IndustrySpecialistsDirectoryProps {
  specialists?: IndustrySpecialist[];
}

export function IndustrySpecialistsDirectory({
  specialists = INDUSTRY_SPECIALISTS,
}: IndustrySpecialistsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecialists = useMemo(
    () => filterSpecialists(specialists, searchQuery),
    [searchQuery, specialists]
  );

  const columns = useMemo((): Column<IndustrySpecialist>[] => {
    return [
      {
        key: "logo",
        label: "",
        hideable: false,
        width: "7.5rem",
        header: <span className="sr-only">Logo</span>,
        render: (specialist) => (
          <div className="border-border-subtle/80 bg-bg-surface flex h-12 w-[6.75rem] shrink-0 items-center justify-center overflow-hidden rounded-lg border px-2 py-1.5">
            <Image
              alt=""
              className="max-h-9 max-w-full object-contain object-center"
              height={36}
              sizes="108px"
              src={specialist.img}
              width={108}
            />
          </div>
        ),
      },
      {
        key: "name",
        label: "Partner",
        header: "Partner",
        render: (specialist) => (
          <div className="min-w-0 py-0.5">
            <p className="text-text-primary truncate text-sm font-medium">
              {specialist.name}
            </p>
            <p className="text-text-muted truncate text-xs">
              Drainage supply · external ordering site
            </p>
          </div>
        ),
      },
      {
        key: "actions",
        label: "",
        hideable: false,
        align: "right",
        width: "8.5rem",
        header: <span className="sr-only">Actions</span>,
        render: (specialist) => (
          <Button
            leftIcon={
              <ExternalLink aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            title="Order now"
            variant={ButtonVariantEnum.SURFACE}
            onClick={() => openSupplierSite(specialist.link)}
          />
        ),
      },
    ];
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <CmsOrgUiTable
        showHeaderWhenEmpty
        columns={columns}
        data={filteredSpecialists}
        dataMode={TableDataModeEnum.CLIENT}
        emptyState={{
          title: "No partners match your search",
          description: "Try another name or clear the search field.",
        }}
        toolbar={
          <TableToolbar
            search={{
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search partners…",
            }}
            showViewSwitcher={false}
          />
        }
        variant={TableVariantEnum.PLAIN}
      />
    </div>
  );
}
