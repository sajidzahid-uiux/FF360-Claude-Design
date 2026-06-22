"use client";

import { useSeatUsage } from "@/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@/shared/ui/primitives";

export function TeamMemberQuotaCard() {
  const { data, isLoading, error, isError } = useSeatUsage();

  if (isLoading) {
    return (
      <Card className="mb-6 w-full min-w-0">
        <CardHeader>
          <CardTitle>Team Member Quota</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-muted text-sm">
            Loading subscription usage...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isError || error || !data) {
    return null;
  }

  const { total_seats, used_seats, pending_invites } = data;
  const pending = pending_invites ?? 0;
  // Remaining seats = total_seats - used_seats - pending_invites (matches backend formula)
  const remainingSeats = Math.max(0, total_seats - used_seats - pending);
  // Include pending invites in usage display (e.g. 3 members + 2 invites = 5/5)
  const usedOrPending = used_seats + pending;
  const usagePercent =
    total_seats > 0 ? Math.min(100, (usedOrPending / total_seats) * 100) : 0;
  const isAtLimit = remainingSeats <= 0;

  return (
    <Card className="mb-6 w-full min-w-0">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Team Member Quota</CardTitle>
          <p className="text-text-muted mt-1 text-sm">
            Track your subscription usage
          </p>
        </div>
        <p className="text-text-primary text-right text-lg font-semibold">
          {usedOrPending}/{total_seats}
        </p>
        <p className="text-text-muted text-sm">
          {remainingSeats} slot{remainingSeats !== 1 ? "s" : ""} remaining
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress className="h-2" value={usagePercent} />
        {isAtLimit && (
          <p className="text-feedback-error text-sm">
            You have reached your team member limit. Upgrade your subscription
            plan to add more members.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
