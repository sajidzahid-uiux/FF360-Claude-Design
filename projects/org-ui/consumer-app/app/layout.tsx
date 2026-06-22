"use client";

import type { ReactNode } from "react";
import { ThemeModeEnum, ThemeProvider } from "@fieldflow360/org-ui";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
