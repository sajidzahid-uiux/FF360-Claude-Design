"use client";

import {
  ConnectedPortalsSection,
  PlatformModulesSection,
  QuickListSection,
  UPCOMING_FEATURES,
} from "@/features/upcoming-features";
import { PageRenderer } from "@/shared/ui/common";

export default function UpcomingFeaturesPageContent() {
  return (
    <PageRenderer
      renderChildrenWhenEmpty
      data={UPCOMING_FEATURES}
      description="A quick view of what's coming next across the platform."
      emptyState={{
        title: "No upcoming features",
        description: "Check back later for the product roadmap.",
      }}
      error={null}
      isLoading={false}
      title="Upcoming Features"
    >
      {() => (
        <div className="mx-auto w-full max-w-6xl space-y-10 pb-4">
          <QuickListSection />
          <PlatformModulesSection />
          <ConnectedPortalsSection />
        </div>
      )}
    </PageRenderer>
  );
}
