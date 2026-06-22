"use client";

import { usePathname, useRouter } from "next/navigation";

import {
  ComponentSizeEnum,
  TabsSwitcher,
  TabsSwitcherViewEnum,
} from "@fieldflow360/org-ui";
import { ArrowLeft } from "lucide-react";

import { useOrgNavigation } from "@/hooks/useOrgNavigation";

import {
  HELP_CENTER_NAV_ITEMS,
  getHelpCenterSectionFromPath,
} from "../model/nav";

export function HelpCenterMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { navigateWithOrg } = useOrgNavigation();
  const activeSection = getHelpCenterSectionFromPath(pathname);

  return (
    <div className="mb-6 flex w-full flex-col gap-3 md:hidden">
      <button
        className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm"
        type="button"
        onClick={() => navigateWithOrg("dashboard")}
      >
        <ArrowLeft aria-hidden className="h-5 w-5" />
        <span className="text-lg font-semibold">Help &amp; Support</span>
      </button>
      <TabsSwitcher
        fullWidth
        items={HELP_CENTER_NAV_ITEMS.map((item) => ({
          value: item.id,
          label: item.label,
        }))}
        size={ComponentSizeEnum.SM}
        value={activeSection}
        view={TabsSwitcherViewEnum.PILL}
        onChange={(sectionId) => {
          const item = HELP_CENTER_NAV_ITEMS.find(
            (nav) => nav.id === sectionId
          );
          if (item) {
            router.push(item.href);
          }
        }}
      />
    </div>
  );
}
