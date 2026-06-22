"use client";

import { useMemo } from "react";

import type { FeatureCategory } from "@/features/upcoming-features";
import {
  CategoryFeatureCard,
  UPCOMING_FEATURES,
} from "@/features/upcoming-features";

export function QuickListSection() {
  const categories = useMemo(() => {
    const featuresByCategory: Record<FeatureCategory, string[]> = {} as Record<
      FeatureCategory,
      string[]
    >;

    UPCOMING_FEATURES.forEach((feature) => {
      if (!featuresByCategory[feature.category]) {
        featuresByCategory[feature.category] = [];
      }
      featuresByCategory[feature.category].push(feature.title);
    });

    return Object.entries(featuresByCategory).sort(
      ([, left], [, right]) => right.length - left.length
    );
  }, []);

  return (
    <section className="space-y-4">
      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map(([category, titles]) => (
          <li key={category} className="min-w-0">
            <CategoryFeatureCard category={category} titles={titles} />
          </li>
        ))}
      </ul>
    </section>
  );
}
