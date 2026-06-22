"use client";

import { ReactNode, useState } from "react";

import AppLayout from "@/shared/ui/layout/AppLayout";

import { OrganizationSwitcherModal } from "./OrganizationSwitcherModal";

export function AuthenticatedAppShell({ children }: { children: ReactNode }) {
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  return (
    <>
      <AppLayout onOpenOrganizationSwitcher={() => setIsSwitcherOpen(true)}>
        {children}
      </AppLayout>
      <OrganizationSwitcherModal
        open={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
}
