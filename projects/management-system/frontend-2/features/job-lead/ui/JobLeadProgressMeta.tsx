"use client";

import { Progress } from "@/shared/ui/primitives";

function parseProgress(progressBar: string | number | null | undefined) {
  const progressStr =
    typeof progressBar === "number" ? String(progressBar) : progressBar || "";
  if (!progressStr) return null;

  const progressParts = progressStr.split("/").map(Number);
  const progressCurrent = progressParts[0];
  const progressTotal = progressParts[1];
  const progressPct =
    progressTotal > 0 &&
    Number.isFinite(progressCurrent) &&
    Number.isFinite(progressTotal)
      ? (progressCurrent / progressTotal) * 100
      : 0;

  return { progressStr, progressPct };
}

export function JobLeadProgressMeta({
  progressBar,
}: {
  progressBar?: string | number | null;
}) {
  const parsed = parseProgress(progressBar);
  if (!parsed) return null;

  return (
    <div className="flex max-w-md items-center gap-2">
      <Progress className="h-2 flex-1" max={100} value={parsed.progressPct} />
      <span className="text-text-muted text-xs">{parsed.progressStr}</span>
    </div>
  );
}
