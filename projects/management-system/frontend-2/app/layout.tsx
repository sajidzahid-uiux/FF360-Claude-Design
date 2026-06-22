// app/layout.tsx
import type { Metadata } from "next";
import { ReactNode } from "react";

import { AuthProviders } from "@/providers/auth-providers";
import QueryProvider from "@/providers/query-provider";
import PosthogInit from "@/shared/lib/analytics/PosthogInit";
import { ChatBotSync } from "@/shared/ui/common/ChatBotSync";
import { ThemeProvider } from "@/shared/ui/common/ThemeProvider";
import { Toaster } from "@/shared/ui/common/Toaster";
import { DeleteDialog } from "@/shared/ui/delete-dialog";
import ClientRootLayoutContent from "@/shared/ui/layout/ClientRootLayoutContent";
import { CmsDynamicFavicon } from "@/shared/ui/layout/CmsDynamicFavicon";

import AppShellLayout from "./AppShellLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMS",
  description: "FieldFlow360 CMS",
  icons: {
    apple: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
};

function RootLayoutContent({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta content="CMS" name="apple-mobile-web-app-title" />
      </head>
      <body suppressHydrationWarning className="bg-bg-app antialiased">
        <PosthogInit />
        <QueryProvider>
          <AuthProviders>
            <ThemeProvider>
              <CmsDynamicFavicon />
              <ChatBotSync>
                <ClientRootLayoutContent>
                  <AppShellLayout>{children}</AppShellLayout>
                </ClientRootLayoutContent>
              </ChatBotSync>
              <Toaster />
              <DeleteDialog />
            </ThemeProvider>
          </AuthProviders>
        </QueryProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <RootLayoutContent>{children}</RootLayoutContent>;
}
