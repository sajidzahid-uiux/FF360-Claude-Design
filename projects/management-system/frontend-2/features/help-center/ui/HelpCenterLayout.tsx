"use client";

import type { ReactNode } from "react";

import { HelpCenterMobileNav } from "./HelpCenterMobileNav";
import { HelpCenterSidebar } from "./HelpCenterSidebar";

interface HelpCenterLayoutProps {
  children: ReactNode;
}

export function HelpCenterLayout({ children }: HelpCenterLayoutProps) {
  return (
    <div className="bg-bg-app flex min-h-screen">
      <HelpCenterSidebar />
      <main className="flex min-w-0 flex-1 flex-col p-6 md:p-10 lg:p-12">
        <HelpCenterMobileNav />
        {children}
      </main>
    </div>
  );
}
