"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const ContactDetailRoutePage = createLazyRoutePage(
  () => import("@/features/contacts/ui/ContactDetailRoutePage")
);

export default function ContactDetailsPage() {
  return <ContactDetailRoutePage />;
}
