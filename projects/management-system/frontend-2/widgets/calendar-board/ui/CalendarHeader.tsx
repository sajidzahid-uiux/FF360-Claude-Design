"use client";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { AlertCircle } from "lucide-react";

export interface CalendarHeaderProps {
  onMobileNotifyClick?: () => void;
  notificationCount?: number;
  className?: string;
}

export function CalendarHeader({
  onMobileNotifyClick,
  notificationCount = 0,
  className,
}: CalendarHeaderProps) {
  return (
    <div className={cn("bg-bg-app md:hidden", className)}>
      <div className="border-border-subtle flex items-center justify-end border-b px-4 py-3">
        <div className="relative">
          <Button
            iconOnly
            aria-label="Notifications"
            backgroundColor="var(--color-accent-orange-soft)"
            foregroundColor="var(--color-destructive)"
            leftIcon={
              <AlertCircle aria-hidden className="h-5 w-5" strokeWidth={2.25} />
            }
            size={ComponentSizeEnum.SM}
            variant={ButtonVariantEnum.COLORED}
            onClick={onMobileNotifyClick}
          />
          {notificationCount > 0 ? (
            <span className="bg-feedback-error absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white shadow-sm">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
