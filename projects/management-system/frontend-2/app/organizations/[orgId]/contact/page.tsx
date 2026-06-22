"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const ContactPageContent = createLazyRoutePage(
  () => import("@/features/contacts/ui/ContactPageContent")
);

export default function ContactPage() {
  return <ContactPageContent />;
}
