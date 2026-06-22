"use client";

import { ResourceType } from "@/constants";

export interface ConvertRequiresContactNoticeProps {
  target: ResourceType;
}

export function ConvertRequiresContactNotice({
  target,
}: ConvertRequiresContactNoticeProps) {
  const targetLabel = target === ResourceType.JOB ? "job" : "lead";

  return (
    <p className="text-text-muted text-sm">
      This quick action must be converted to a contact before creating a{" "}
      {targetLabel}. Convert to contact first, then return here to convert to{" "}
      {targetLabel}.
    </p>
  );
}
