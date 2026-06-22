"use client";

import { useCallback, useMemo, useState } from "react";

import {
  type Column,
  SearchInput,
  TableDataModeEnum,
  TableHeaderLabel,
  TableVariantEnum,
} from "@fieldflow360/org-ui";
import { Bell, FileText, Users } from "lucide-react";

import type { FyiNotificationSetting, TeamMember } from "@/api/types";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useTeamData } from "@/hooks";
import { usePatchFyiNotificationSetting } from "@/hooks/mutations";
import { useFyiNotificationSettings, useIsAdmin } from "@/hooks/queries";
import { CmsOrgUiTable } from "@/shared/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { ReceiverCell } from "./ReceiverCell";

type FyiNotificationTableRow = FyiNotificationSetting & {
  id: string;
  receivers: TeamMember[];
};

export function FYINotificationsTable() {
  const isAdmin = useIsAdmin();
  const { currentUser } = useAuth();
  const { data: teamMembers = [] } = useTeamData();
  const {
    data: fyiSettings = [],
    isLoading,
    isError,
    error,
  } = useFyiNotificationSettings();
  const patchFyi = usePatchFyiNotificationSetting();
  const [searchQuery, setSearchQuery] = useState("");

  const tableRows = useMemo((): FyiNotificationTableRow[] => {
    return fyiSettings.map((setting) => {
      const assignedIds = new Set(setting.assigned_users.map((u) => u.id));
      const receivers = teamMembers.filter((m) => assignedIds.has(m.id));
      return { ...setting, id: setting.event_key, receivers };
    });
  }, [fyiSettings, teamMembers]);

  const handleReceiversChange = useCallback(
    (eventKey: string, receivers: TeamMember[]) => {
      const assigned_user_ids = receivers.map((r) => r.id);
      patchFyi.mutate({ event_key: eventKey, assigned_user_ids });
    },
    [patchFyi]
  );

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return tableRows;
    const q = searchQuery.toLowerCase().trim();
    return tableRows.filter(
      (row) =>
        (row.title ?? "").toLowerCase().includes(q) ||
        (row.description ?? "").toLowerCase().includes(q) ||
        (row.event_key ?? "").toLowerCase().includes(q)
    );
  }, [tableRows, searchQuery]);

  const currentUserMember = useMemo(
    () =>
      teamMembers.find((m) => m.user?.email === currentUser?.email) as
        | TeamMember
        | undefined,
    [teamMembers, currentUser?.email]
  );
  const currentUserId = currentUserMember?.user?.id;

  const columns = useMemo((): Column<FyiNotificationTableRow>[] => {
    return [
      {
        key: "title",
        label: "Notification",
        header: <TableHeaderLabel icon={Bell} label="Notification" />,
        width: "220px",
        render: (row) => (
          <span className="text-text-primary font-medium">
            {row.title || row.event_key}
          </span>
        ),
      },
      {
        key: "description",
        label: "Description",
        header: <TableHeaderLabel icon={FileText} label="Description" />,
        render: (row) => (
          <span className="text-text-secondary text-sm break-words whitespace-normal">
            {row.description ?? "—"}
          </span>
        ),
      },
      {
        key: "receivers",
        label: "Receiver",
        hideable: false,
        header: <TableHeaderLabel icon={Users} label="Receiver" />,
        width: "280px",
        cellClassName: "!px-0 !py-0",
        render: (row) => (
          <ReceiverCell
            allMembers={teamMembers}
            currentUserId={currentUserId}
            eventId={row.event_key}
            isAdmin={isAdmin}
            receivers={row.receivers}
            onReceiversChange={handleReceiversChange}
          />
        ),
      },
    ];
  }, [currentUserId, handleReceiversChange, isAdmin, teamMembers]);

  const emptyTitle =
    fyiSettings.length === 0
      ? "No FYI notification settings available."
      : "No notifications match your search.";
  const emptyDescription =
    fyiSettings.length === 0
      ? "FYI notification settings will appear here once configured."
      : "Try another search term or clear the search field.";

  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <p className="text-text-muted text-center text-sm">
            Loading FYI settings...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-12">
          <p className="text-feedback-error text-center text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load FYI notification settings."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Notification settings</CardTitle>
        <CardDescription>
          Assign team members who receive FYI notifications for each event.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <SearchInput
          className="w-full min-w-0 sm:max-w-md"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery("")}
        />

        <div className="border-border-subtle -mx-1 overflow-x-auto rounded-xl border sm:mx-0">
          <CmsOrgUiTable
            compact
            showHeaderWhenEmpty
            columns={columns}
            data={filteredRows}
            dataMode={TableDataModeEnum.CLIENT}
            emptyState={{
              title: emptyTitle,
              description: emptyDescription,
            }}
            variant={TableVariantEnum.PLAIN}
          />
        </div>
      </CardContent>
    </Card>
  );
}
