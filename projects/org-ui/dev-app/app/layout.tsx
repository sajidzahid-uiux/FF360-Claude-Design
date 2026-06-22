import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "@fieldflow360/org-ui Dev App",
  description: "Component playground for @fieldflow360/org-ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
