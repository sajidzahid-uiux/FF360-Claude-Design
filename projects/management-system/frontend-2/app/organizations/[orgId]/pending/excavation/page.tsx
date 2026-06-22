"use client";

import { JobType } from "@/constants";
import { JobPagePermissionGate } from "@/shared/ui/permissions";

export default function PendingExcavationPage() {
  return (
    <JobPagePermissionGate jobType={JobType.EXCAVATION}>
      <div className="p-6">
        <h1 className="text-text-primary mb-6 text-2xl leading-7 font-bold sm:text-4xl">
          Pending Excavation Approvals
        </h1>
        <p className="text-text-muted">
          Review and approve excavation jobs here.
        </p>
      </div>
    </JobPagePermissionGate>
  );
}
