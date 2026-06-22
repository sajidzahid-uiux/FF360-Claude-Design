"use client";

import { ReactNode } from "react";

import { AuthenticatedAppShell } from "./AuthenticatedAppShell";
import PrivateRoute from "./PrivateRoute";

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateRoute>
      <AuthenticatedAppShell>{children}</AuthenticatedAppShell>
    </PrivateRoute>
  );
}
