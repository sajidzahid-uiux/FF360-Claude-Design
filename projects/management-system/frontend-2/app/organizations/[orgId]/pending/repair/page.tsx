"use client";

import { JobType } from "@/constants";
import { JobPagePermissionGate } from "@/shared/ui/permissions";

export default function PendingRepairPage() {
  return (
    <JobPagePermissionGate jobType={JobType.REPAIR}>
      <div className="p-6">
        <h1 className="text-text-primary mb-6 text-2xl leading-7 font-bold sm:text-4xl">
          Pending Repair Approvals
        </h1>
        <p className="text-text-muted">Review and approve repair jobs here.</p>
      </div>
    </JobPagePermissionGate>
  );
}
