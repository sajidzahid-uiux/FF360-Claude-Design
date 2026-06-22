"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const BookKeepingPageContent = createLazyRoutePage(
  () => import("@/features/book-keeping/ui/BookKeepingPageContent")
);

export default function Page() {
  return <BookKeepingPageContent />;
}
