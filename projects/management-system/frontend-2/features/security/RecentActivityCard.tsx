"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";

import type { LoginActivityEvent } from "@/api/types";
import { useLoginActivity } from "@/hooks";
import { formatRelativeActivityDate } from "@/shared/lib";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { parseUserAgent } from "./utils/parseUserAgent";

function ActivityItem({ event }: { event: LoginActivityEvent }) {
  const location = [event.city, event.country].filter(Boolean).join(", ");
  const deviceInfo = parseUserAgent(event.user_agent);
  const formattedDate = formatRelativeActivityDate(event.date);

  const details: { label: string; value: string }[] = [];
  if (event.ip_address)
    details.push({ label: "IP Address", value: event.ip_address });
  if (event.connection)
    details.push({ label: "Connection", value: event.connection });
  if (event.application)
    details.push({ label: "Application", value: event.application });
  details.push({ label: "Browser", value: deviceInfo });
  details.push({ label: "Time", value: formattedDate });

  return (
    <div className="flex flex-col gap-1.5 px-4 py-4">
      <p className="text-text-primary text-sm font-medium">
        {location ? `Login from ${location}` : "Login"}
      </p>
      <div className="text-text-muted grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {details.map(({ label, value }) => (
          <span key={label}>
            <span className="text-text-secondary font-medium">{label}:</span>{" "}
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RecentActivityCard() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLoginActivity();

  const allEvents = data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Login activity</CardTitle>
        <CardDescription>
          Monitor recent account sign-in activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <p className="text-text-muted py-8 text-center text-sm">
            Loading activity...
          </p>
        ) : allEvents.length === 0 ? (
          <p className="text-text-muted py-8 text-center text-sm">
            No recent activity to display
          </p>
        ) : (
          <>
            <div className="border-border-subtle divide-border-subtle divide-y overflow-hidden rounded-xl border">
              {allEvents.map((event, index) => (
                <ActivityItem
                  key={`${event.date}-${event.ip_address}-${index}`}
                  event={event}
                />
              ))}
            </div>
            {hasNextPage ? (
              <div className="mt-4 flex justify-center">
                <Button
                  disabled={isFetchingNextPage}
                  loading={isFetchingNextPage}
                  title={isFetchingNextPage ? "Loading..." : "View more"}
                  variant={ButtonVariantEnum.SURFACE}
                  onClick={() => fetchNextPage()}
                />
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
