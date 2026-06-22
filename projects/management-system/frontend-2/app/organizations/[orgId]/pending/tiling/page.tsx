"use client";

import { JobType } from "@/constants";
import { JobPagePermissionGate } from "@/shared/ui/permissions";

export default function PendingTilingPage() {
  return (
    <JobPagePermissionGate jobType={JobType.TILING}>
      <div className="p-6">
        <h1 className="text-text-primary mb-6 text-2xl leading-7 font-bold sm:text-4xl">
          Pending Tiling Approvals
        </h1>
        <p className="text-text-muted">Review and approve tiling jobs here.</p>
      </div>
    </JobPagePermissionGate>
  );
}
