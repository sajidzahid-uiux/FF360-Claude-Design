"use client";

import type { ReactNode } from "react";
import { ThemeModeEnum, ThemeProvider } from "@fieldflow360/org-ui";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      defaultMode={ThemeModeEnum.LIGHT}
      accentStorageKey="ui-accent-color"
    >
      {children}
    </ThemeProvider>
  );
}
