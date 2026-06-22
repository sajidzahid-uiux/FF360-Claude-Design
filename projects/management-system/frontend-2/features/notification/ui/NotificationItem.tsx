"use client";

import { useRouter } from "next/navigation";

import {
  Button,
  ButtonVariantEnum,
  Checkbox,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { Check, Trash2 } from "lucide-react";

import type { NewNotificationItem } from "@/api/types";
import {
  getNotificationPriorityBadgeClass,
  getNotificationPriorityCardClass,
} from "@/api/types";
import { Badge } from "@/shared/ui/primitives";

import { formatNotificationDate } from "../utils/notificationDateUtils";

export interface NotificationItemProps {
  n: NewNotificationItem;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onMarkRead?: () => void;
  onDelete?: () => void;
  navigationHref?: string | null;
}

export function NotificationItem({
  n,
  selected,
  onSelect,
  onMarkRead,
  onDelete,
  navigationHref,
}: NotificationItemProps) {
  const router = useRouter();
  const canNavigate = Boolean(navigationHref);

  const handleCardActivate = () => {
    if (navigationHref) router.push(navigationHref);
  };

  return (
    <article
      className={cn(
        "group relative flex items-start gap-3 rounded-xl px-3 py-3 sm:gap-4 sm:px-4",
        getNotificationPriorityCardClass(n.category),
        n.read ? "opacity-80" : "shadow-sm",
        canNavigate &&
          "hover:border-border-strong hover:bg-bg-hover cursor-pointer transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-out hover:opacity-100 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-app)] focus-visible:outline-none"
      )}
      role={canNavigate ? "link" : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      onClick={canNavigate ? handleCardActivate : undefined}
      onKeyDown={
        canNavigate
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardActivate();
              }
            }
          : undefined
      }
    >
      <div
        className="shrink-0 pt-0.5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              {!n.read ? (
                <span
                  aria-hidden
                  className="bg-accent h-2 w-2 shrink-0 rounded-full"
                />
              ) : null}
              <h3
                className={cn(
                  "text-sm leading-snug font-medium break-words",
                  n.read ? "text-text-secondary" : "text-text-primary"
                )}
              >
                {n.title}
              </h3>
            </div>
            {n.description ? (
              <p className="text-text-muted text-sm leading-relaxed break-words">
                {n.description}
              </p>
            ) : null}
            {n.created_at ? (
              <p className="text-text-muted text-xs">
                {formatNotificationDate(n.created_at)}
              </p>
            ) : null}
          </div>

          {n.module ? (
            <Badge
              className={cn(
                "shrink-0 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase sm:text-xs",
                getNotificationPriorityBadgeClass(n.category)
              )}
            >
              {n.module}
            </Badge>
          ) : null}
        </div>

        {(onMarkRead || onDelete) && (
          <div className="mt-2 flex items-center justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            {onMarkRead && !n.read ? (
              <Button
                leftIcon={<Check className="h-3.5 w-3.5" />}
                size={ComponentSizeEnum.SM}
                title="Mark as read"
                variant={ButtonVariantEnum.GHOST}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead();
                }}
              />
            ) : null}
            {onDelete ? (
              <Button
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                size={ComponentSizeEnum.SM}
                title="Delete"
                variant={ButtonVariantEnum.GHOST}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
