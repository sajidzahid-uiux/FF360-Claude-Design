"use client";

import {
  INDUSTRY_SPECIALISTS,
  IndustrySpecialistsDirectory,
} from "@/features/industry-specialists";
import { PageRenderer } from "@/shared/ui/common";
import { MajorRoleGate } from "@/shared/ui/permissions";

export default function IndustrySpecialistsPageContent() {
  return (
    <MajorRoleGate message="You do not have permission to view Industry Specialists.">
      <PageRenderer
        renderChildrenWhenEmpty
        data={INDUSTRY_SPECIALISTS}
        description="Connect with trusted drainage supply companies for all your project needs."
        emptyState={{
          title: "No specialists found",
          description:
            "There are no industry specialists available at this time.",
        }}
        error={null}
        isLoading={false}
        title="Industry Specialists"
      >
        {() => <IndustrySpecialistsDirectory />}
      </PageRenderer>
    </MajorRoleGate>
  );
}
