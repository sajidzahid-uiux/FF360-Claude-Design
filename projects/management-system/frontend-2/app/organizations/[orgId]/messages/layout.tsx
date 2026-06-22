"use client";

import { ReactNode } from "react";

import { OnlineMembersSync } from "@/features/messaging/ui/OnlineMembersSync";

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return <OnlineMembersSync>{children}</OnlineMembersSync>;
}
