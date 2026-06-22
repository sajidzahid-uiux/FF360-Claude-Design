"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { AuthenticatedLayout } from "@/features/auth/ui/AuthenticatedLayout";
import { isPublicAppShellPath } from "@/lib/auth-routes";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isPublicAppShellPath(pathname)) {
    return children;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
