"use client";

import { createLazyRoutePage } from "@/shared/lib/lazy/createLazyRoutePage";

const FavoritesPageContent = createLazyRoutePage(
  () => import("@/features/order-pipe/favorites/FavoritesPageContent")
);

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}
