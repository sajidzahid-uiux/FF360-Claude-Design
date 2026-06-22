"use client";

import type { SeatUsageResponse } from "@/hooks";

const ORANGE_PENDING = "bg-orange-500 dark:bg-orange-600";

interface SeatUsageDisplayProps {
  seatUsage?: SeatUsageResponse | null;
  isLoading?: boolean;
}

/**
 * Shows seat allocation: active members, pending invites (orange bar), and seats still available for new invites.
 */
export function SeatUsageDisplay({
  seatUsage,
  isLoading = false,
}: SeatUsageDisplayProps) {
  if (isLoading) {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Seats</p>
          <p className="text-text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!seatUsage) {
    return (
      <p className="text-text-muted mt-2 text-sm">Seat usage unavailable.</p>
    );
  }

  const total = seatUsage.total_seats;
  const used = seatUsage.used_seats;
  const pending = seatUsage.pending_invites ?? 0;
  const availableToInvite = Math.max(0, total - used - pending);

  if (total <= 0) {
    return null;
  }

  const usedPct = Math.min(100, (used / total) * 100);
  const pendingPct = Math.min(100 - usedPct, (pending / total) * 100);

  return (
    <div className="mt-1 space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-semibold">Seats</p>
        <div className="text-text-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span>
            <span className="text-text-primary font-medium">{used}</span> active
          </span>
          {pending > 0 && (
            <span>
              <span className="font-medium text-orange-600 dark:text-orange-500">
                {pending}
              </span>{" "}
              pending invite{pending === 1 ? "" : "s"}
            </span>
          )}
          <span>
            <span className="text-text-primary font-medium">
              {availableToInvite}
            </span>{" "}
            available
          </span>
          <span className="text-text-muted/80">({total} total)</span>
        </div>
      </div>

      <div
        aria-hidden
        className="bg-bg-surface flex h-2.5 w-full overflow-hidden rounded-full"
        title={`${used} active, ${pending} pending, ${availableToInvite} available of ${total}`}
      >
        {used > 0 && (
          <div
            className="bg-accent h-full shrink-0 transition-[width]"
            style={{ width: `${usedPct}%` }}
          />
        )}
        {pending > 0 && (
          <div
            className={`${ORANGE_PENDING} h-full shrink-0 transition-[width]`}
            style={{ width: `${pendingPct}%` }}
          />
        )}
      </div>

      <div className="text-text-muted flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-accent inline-block size-2.5 shrink-0 rounded-sm" />
          Active members
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={`${ORANGE_PENDING} inline-block size-2.5 shrink-0 rounded-sm`}
          />
          Pending invites
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-bg-surface border-border-subtle inline-block size-2.5 shrink-0 rounded-sm border" />
          Open for new invites
        </span>
      </div>

      <p className="text-text-muted text-sm">
        Your plan includes{" "}
        <span className="text-text-primary font-medium">{total}</span> seats.
        {availableToInvite > 0 ? (
          <>
            {" "}
            <span className="text-text-primary font-medium">
              {availableToInvite}
            </span>{" "}
            {availableToInvite === 1 ? "is" : "are"} still available for new
            members.
          </>
        ) : (
          <> No seats left to invite until someone leaves or you upgrade.</>
        )}
        {pending > 0 && (
          <>
            {" "}
            <span className="text-text-primary font-medium">
              {pending}
            </span>{" "}
            pending invitation{pending === 1 ? "" : "s"} count toward your seat
            limit until accepted or cancelled.
          </>
        )}
      </p>
    </div>
  );
}
