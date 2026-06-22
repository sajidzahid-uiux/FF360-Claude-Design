"use client";

import { useCallback, useMemo, useState } from "react";

import {
  type Column,
  SearchInput,
  TableDataModeEnum,
  TableHeaderLabel,
  TableVariantEnum,
  Toggle,
} from "@fieldflow360/org-ui";
import { Bell, FileText } from "lucide-react";

import type { ImportantNotificationSetting } from "@/api/types";
import {
  useImportantNotificationSettings,
  usePatchImportantNotificationSetting,
} from "@/hooks";
import { CmsOrgUiTable } from "@/shared/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

type NotificationPreferenceTableRow = ImportantNotificationSetting & {
  id: string;
};

export function NotificationPreferencesTable() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: settings = [],
    isLoading,
    isError,
    error,
  } = useImportantNotificationSettings();
  const patchSetting = usePatchImportantNotificationSetting();

  const tableRows = useMemo(
    (): NotificationPreferenceTableRow[] =>
      settings.map((setting) => ({ ...setting, id: setting.event_key })),
    [settings]
  );

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return tableRows;
    const query = searchQuery.toLowerCase().trim();
    return tableRows.filter(
      (row) =>
        (row.title ?? "").toLowerCase().includes(query) ||
        (row.description ?? "").toLowerCase().includes(query) ||
        (row.event_key ?? "").toLowerCase().includes(query)
    );
  }, [tableRows, searchQuery]);

  const handleToggle = useCallback(
    (event_key: string, is_enabled: boolean) => {
      patchSetting.mutate({ event_key, is_enabled });
    },
    [patchSetting]
  );

  const columns = useMemo((): Column<NotificationPreferenceTableRow>[] => {
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
        key: "is_enabled",
        label: "Receive Notification",
        hideable: false,
        align: "right",
        header: (
          <TableHeaderLabel className="ml-auto" label="Receive Notification" />
        ),
        width: "180px",
        render: (row) => (
          <Toggle
            aria-label={row.title || row.event_key}
            checked={row.is_enabled}
            className="ml-auto shrink-0"
            disabled={patchSetting.isPending}
            onChange={(checked) => handleToggle(row.event_key, checked)}
          />
        ),
      },
    ];
  }, [handleToggle, patchSetting.isPending]);

  const emptyTitle =
    settings.length === 0
      ? "No notification settings available."
      : "No notifications match your search.";
  const emptyDescription =
    settings.length === 0
      ? "Notification preferences will appear here once available."
      : "Try another search term or clear the search field.";

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Notification preferences</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <SearchInput
          className="max-w-md"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onClear={() => setSearchQuery("")}
        />

        {isLoading ? (
          <p className="text-text-muted py-8 text-center text-sm">
            Loading notification settings...
          </p>
        ) : isError ? (
          <p className="text-feedback-error py-8 text-center text-sm">
            {error instanceof Error
              ? error.message
              : "Failed to load notification settings."}
          </p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
