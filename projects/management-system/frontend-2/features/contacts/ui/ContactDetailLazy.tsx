"use client";

import dynamic from "next/dynamic";

import { RouteContentLoading } from "@/shared/ui/layout/RouteContentLoading";

interface ContactDetailViewProps {
  contact: import("@/api/types").Contact;
  onBack: () => void;
  onDelete: (contact: import("@/api/types").Contact) => void;
}

export const LazyContactDetailView = dynamic<ContactDetailViewProps>(
  () =>
    import("./ContactDetailView").then((module) => module.ContactDetailView),
  { loading: () => <RouteContentLoading /> }
);
