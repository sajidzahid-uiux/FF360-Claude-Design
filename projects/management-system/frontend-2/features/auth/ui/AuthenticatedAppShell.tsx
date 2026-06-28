"use client";

import { ReactNode } from "react";

import { useModalStack } from "@/shared/model/use-modal-stack";
import AppLayout from "@/shared/ui/layout/AppLayout";

import { OrganizationSwitcherModal } from "./OrganizationSwitcherModal";

export function AuthenticatedAppShell({ children }: { children: ReactNode }) {
  const { stack, openModal, closeModalKey } = useModalStack();
  const isSwitcherOpen = stack.some((f) => f.key === "switch-organization");

  return (
    <>
      <AppLayout
        onOpenOrganizationSwitcher={() => openModal("switch-organization")}
      >
        {children}
      </AppLayout>
      <OrganizationSwitcherModal
        open={isSwitcherOpen}
        onClose={() => closeModalKey("switch-organization")}
      />
    </>
  );
}
