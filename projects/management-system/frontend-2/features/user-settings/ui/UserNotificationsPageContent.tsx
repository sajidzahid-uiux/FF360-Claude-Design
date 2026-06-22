"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  Checkbox,
  ComponentSizeEnum,
  SearchInput,
  TabsSwitcher,
  cn,
} from "@fieldflow360/org-ui";
import { Check, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

import type { NewNotificationItem } from "@/api/types";
import {
  INITIAL_SELECTION_BY_TAB,
  NotificationItem,
  type NotificationsTab,
} from "@/features/notification";
import { getNotificationGroupLabel } from "@/features/notification/utils/notificationDateUtils";
import { notificationTargetHref } from "@/features/notification/utils/notificationNavigation";
import {
  useDeleteAllNewNotifications,
  useDeleteNewNotification,
  useMarkAllNewNotificationsRead,
  useMarkNewNotificationRead,
} from "@/hooks/mutations";
import { useNewNotifications } from "@/hooks/queries";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDialogManager } from "@/hooks/useDialogManager";
import { parseEntityId } from "@/shared/lib/parseEntityId";
import { DialogManager } from "@/shared/ui/common/DialogManager";
import { PageRenderer } from "@/shared/ui/common/page-renderer";
import { Card, CardContent } from "@/shared/ui/primitives";

const PAGE_SIZE = 10;

const PRIORITY_LEGEND = [
  {
    label: "Critical",
    dotClass: "bg-[var(--color-feedback-error)]",
  },
  {
    label: "Important",
    dotClass: "bg-[var(--color-accent)]",
  },
  {
    label: "Updates",
    dotClass: "bg-[var(--color-border-strong)]",
  },
] as const;

function groupByDisplayDate(
  items: NewNotificationItem[]
): Record<string, NewNotificationItem[]> {
  const groups: Record<string, NewNotificationItem[]> = {};
  items.forEach((n) => {
    const key = getNotificationGroupLabel(n.created_at);
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
}

const GROUP_ORDER = ["Today", "Yesterday", "Last 7 days", "Older"] as const;

export default function NotificationsPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const dialogManager = useDialogManager();
  const [tab, setTab] = useState<NotificationsTab>("all");
  const [selectedByTab, setSelectedByTab] = useState<
    Record<NotificationsTab, string[]>
  >(() => ({ ...INITIAL_SELECTION_BY_TAB }));
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300, { trim: true });
  const [page, setPage] = useState(1);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selected = selectedByTab[tab];

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch]);

  const params = useMemo(
    () => ({
      page,
      page_size: PAGE_SIZE,
      search: debouncedSearch || undefined,
      unread: tab === "unread" ? true : tab === "read" ? false : undefined,
    }),
    [page, tab, debouncedSearch]
  );

  const notificationsQuery = useNewNotifications(params);
  const markAsReadMutation = useMarkNewNotificationRead();
  const markAllReadMutation = useMarkAllNewNotificationsRead();
  const deleteNotification = useDeleteNewNotification();
  const deleteAllMutation = useDeleteAllNewNotifications();

  const {
    items = [],
    totalCount = 0,
    currentPage = 1,
    totalPages = 1,
  } = notificationsQuery.data ?? {};
  const isLoading = notificationsQuery.isLoading;
  const error = notificationsQuery.error
    ? (notificationsQuery.error as Error)
    : null;

  const allIds = useMemo(() => items.map((n) => String(n.id)), [items]);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.includes(id));
  const someSelected = selected.length > 0;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedByTab((prev) => ({
        ...prev,
        [tab]: checked ? allIds : [],
      }));
    },
    [allIds, tab]
  );

  const handleSelect = useCallback(
    (id: string, checked: boolean) => {
      setSelectedByTab((prev) => ({
        ...prev,
        [tab]: checked
          ? [...prev[tab], id]
          : prev[tab].filter((sid) => sid !== id),
      }));
    },
    [tab]
  );

  const handleBulkMarkRead = useCallback(() => {
    selected.forEach((id) => {
      const notif = items.find((n) => String(n.id) === id);
      if (notif && !notif.read)
        markAsReadMutation.mutate({ id: notif.id, read: true });
    });
    setSelectedByTab((prev) => ({ ...prev, [tab]: [] }));
  }, [selected, items, markAsReadMutation, tab]);

  const handleBulkDelete = useCallback(() => {
    const ids = selected;
    const count = ids.length;
    const currentTab = tab;
    dialogManager.openConfirmationDialog({
      title: "Delete Notifications",
      confirmationType: "delete",
      itemTitle: `${count} notification${count !== 1 ? "s" : ""}`,
      variant: "destructive",
      onConfirm: async () => {
        ids.forEach((id) => deleteNotification.mutate(Number(id)));
        setSelectedByTab((prev) => ({ ...prev, [currentTab]: [] }));
      },
    });
  }, [dialogManager, selected, tab, deleteNotification]);

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate(undefined);
  }, [markAllReadMutation]);

  const handleDeleteAll = useCallback(() => {
    dialogManager.openConfirmationDialog({
      title: "Delete All Notifications",
      confirmationType: "delete",
      itemTitle: "all notifications",
      variant: "destructive",
      onConfirm: async () => {
        deleteAllMutation.mutate(undefined, {
          onSuccess: () => {
            setSelectedByTab((prev) => ({ ...prev, all: [] }));
          },
        });
      },
    });
  }, [dialogManager, deleteAllMutation]);

  const handleMarkOneRead = useCallback(
    (id: number | string) => {
      markAsReadMutation.mutate({ id: parseEntityId(id), read: true });
    },
    [markAsReadMutation]
  );

  const handleDeleteOne = useCallback(
    (n: NewNotificationItem) => {
      dialogManager.openConfirmationDialog({
        title: "Delete Notification",
        confirmationType: "delete",
        itemTitle: "this notification",
        variant: "destructive",
        onConfirm: async () => {
          deleteNotification.mutate(n.id);
        },
      });
    },
    [dialogManager, deleteNotification]
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const hasUnreadSelected = useMemo(() => {
    return selected.some((id) => {
      const notif = items.find((n) => String(n.id) === id);
      return notif && !notif.read;
    });
  }, [selected, items]);

  const hasNotifications = totalCount > 0;

  return (
    <>
      <DialogManager manager={dialogManager} />
      <PageRenderer<NewNotificationItem>
        renderChildrenWhenEmpty
        data={items}
        emptyState={{
          title: "No notifications",
          description:
            "You're all caught up. New notifications will appear here.",
        }}
        error={error}
        isLoading={isLoading}
        loadingMessage="Loading notifications..."
        padding="none"
        title=""
      >
        {(itemsToRender) => {
          const filtered =
            tab === "read"
              ? itemsToRender.filter((n) => n.read)
              : tab === "unread"
                ? itemsToRender.filter((n) => !n.read)
                : itemsToRender;

          return (
            <div className="bg-bg-app w-full min-w-0 space-y-4">
              <Card className="rounded-2xl py-0">
                <CardContent className="space-y-3 px-4 py-3 sm:px-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <TabsSwitcher
                      className="w-full min-w-0 lg:w-auto"
                      items={[
                        { value: "all", label: "All" },
                        { value: "unread", label: "Unread" },
                        { value: "read", label: "Read" },
                      ]}
                      size={ComponentSizeEnum.SM}
                      value={tab}
                      onChange={(value) => setTab(value)}
                    />

                    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                      {someSelected ? (
                        <>
                          {tab !== "read" && hasUnreadSelected ? (
                            <Button
                              disabled={
                                markAsReadMutation.isPending ||
                                markAllReadMutation.isPending
                              }
                              leftIcon={<Check className="h-4 w-4" />}
                              size={ComponentSizeEnum.SM}
                              title="Mark selected read"
                              variant={ButtonVariantEnum.SURFACE}
                              onClick={handleBulkMarkRead}
                            />
                          ) : null}
                          <Button
                            disabled={deleteNotification.isPending}
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            size={ComponentSizeEnum.SM}
                            title="Delete selected"
                            variant={ButtonVariantEnum.DELETE}
                            onClick={handleBulkDelete}
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            disabled={
                              markAllReadMutation.isPending || !hasNotifications
                            }
                            leftIcon={<Check className="h-4 w-4" />}
                            size={ComponentSizeEnum.SM}
                            title="Mark all read"
                            variant={ButtonVariantEnum.SURFACE}
                            onClick={handleMarkAllRead}
                          />
                          <Button
                            disabled={
                              deleteAllMutation.isPending || !hasNotifications
                            }
                            leftIcon={<Trash2 className="h-4 w-4" />}
                            size={ComponentSizeEnum.SM}
                            title="Delete all"
                            variant={ButtonVariantEnum.DELETE}
                            onClick={handleDeleteAll}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <SearchInput
                      className="w-full min-w-0 sm:max-w-xs"
                      placeholder="Search notifications..."
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      onClear={() => setSearchInput("")}
                    />

                    <div
                      aria-label="Notification priority legend"
                      className="flex items-center gap-3"
                    >
                      {PRIORITY_LEGEND.map((item) => (
                        <span
                          key={item.label}
                          className="text-text-muted inline-flex items-center gap-1.5 text-xs"
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "h-2 w-2 rounded-full",
                              item.dotClass
                            )}
                          />
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {someSelected ? (
                    <div className="border-border-subtle flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                      <label className="text-text-secondary inline-flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          ref={selectAllRef}
                          checked={allSelected}
                          onChange={(event) =>
                            handleSelectAll(event.target.checked)
                          }
                        />
                        Select all on this page
                        <span className="text-text-muted text-xs">
                          ({selected.length} selected)
                        </span>
                      </label>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="space-y-5">
                {filtered.length === 0 ? (
                  <p className="text-text-muted py-12 text-center text-sm">
                    No notifications found.
                  </p>
                ) : (
                  GROUP_ORDER.filter(
                    (displayDate) =>
                      (groupByDisplayDate(filtered)[displayDate]?.length ?? 0) >
                      0
                  ).map((displayDate) => {
                    const groupItems =
                      groupByDisplayDate(filtered)[displayDate] ?? [];
                    return (
                      <section key={displayDate}>
                        <h2 className="text-text-secondary mb-2 text-xs font-semibold tracking-wide uppercase">
                          {displayDate}
                        </h2>
                        <div className="space-y-2">
                          {groupItems.map((n) => (
                            <NotificationItem
                              key={n.id}
                              n={n}
                              navigationHref={notificationTargetHref(
                                n.web_url ?? n.webUrl ?? n.url,
                                String(orgId ?? "")
                              )}
                              selected={selected.includes(String(n.id))}
                              onDelete={() => handleDeleteOne(n)}
                              onMarkRead={() => handleMarkOneRead(n.id)}
                              onSelect={(checked) =>
                                handleSelect(String(n.id), !!checked)
                              }
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })
                )}
              </div>

              {totalPages > 1 ? (
                <div className="border-border-subtle flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-text-muted text-sm">
                    Page {currentPage} of {totalPages} ({totalCount} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      disabled={currentPage <= 1 || isLoading}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                      size={ComponentSizeEnum.SM}
                      title="Previous"
                      variant={ButtonVariantEnum.SURFACE}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                    <Button
                      disabled={currentPage >= totalPages || isLoading}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                      size={ComponentSizeEnum.SM}
                      title="Next"
                      variant={ButtonVariantEnum.SURFACE}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        }}
      </PageRenderer>
    </>
  );
}
