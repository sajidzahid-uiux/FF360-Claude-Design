"use client";

import { Button, ButtonVariantEnum } from "@fieldflow360/org-ui";
import { formatDate } from "date-fns";
import { History, PhoneCall, Share2, StickyNote } from "lucide-react";

import type { DesignRequestStatus } from "@/api/types/designRequest";

import {
  getDesignRequestFooterButtonTitle,
  getDesignRequestFooterVariant,
  shouldShowDesignRequestFooterButton,
} from "../../lib/design-request-lifecycle";
import { DesignRequestStatusBadge } from "../shared/DesignRequestStatusBadge";

export interface JobLeadDesignRequestFooterProps {
  isTiling: boolean;
  canSubmit: boolean;
  canView: boolean;
  isLoading: boolean;
  status: DesignRequestStatus | null;
  onOpenPanel: () => void;
  onOpenNotes?: () => void;
  onLogs?: () => void;
  onOneCall?: () => void;
  oneCallActive?: boolean;
  oneCallDate?: string | null;
  canEdit?: boolean;
}

export function JobLeadDesignRequestFooter({
  isTiling,
  canSubmit,
  canView,
  isLoading,
  status,
  onOpenPanel,
  onOpenNotes,
  onLogs,
  onOneCall,
  oneCallActive,
  oneCallDate,
  canEdit,
}: JobLeadDesignRequestFooterProps) {
  const showDesignRequest = isTiling && !isLoading && canView;

  if (!showDesignRequest && !onLogs && !onOneCall && !onOpenNotes) {
    return null;
  }

  const variant = getDesignRequestFooterVariant(status, canSubmit);
  const buttonTitle = getDesignRequestFooterButtonTitle(variant);
  const showButton = shouldShowDesignRequestFooterButton(variant);
  const isRequestButton = variant === "request";

  const designRequestButtonClassName = "min-w-[12rem] flex-1 sm:flex-none";
  const designRequestButtonIcon = (
    <Share2 aria-hidden className="h-4 w-4" strokeWidth={2} />
  );

  return (
    <div className="border-border-subtle bg-bg-surface sticky bottom-0 z-20 border-t px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center gap-2">
        {onOneCall && canEdit ? (
          <div className="flex flex-col items-center">
            <Button
              leftIcon={
                <PhoneCall aria-hidden className="h-4 w-4" strokeWidth={2} />
              }
              title="One Call"
              variant={
                oneCallActive
                  ? ButtonVariantEnum.ACCENT
                  : ButtonVariantEnum.DANGER
              }
              onClick={onOneCall}
            />
            {oneCallDate ? (
              <p className="text-text-muted mt-1 text-center text-xs">
                {formatDate(new Date(oneCallDate), "MM/dd/yyyy")}
              </p>
            ) : null}
          </div>
        ) : null}
        {onLogs ? (
          <Button
            leftIcon={
              <History aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            title="Logs"
            variant={ButtonVariantEnum.SURFACE}
            onClick={onLogs}
          />
        ) : null}
        {showDesignRequest ? (
          <>
            {status ? <DesignRequestStatusBadge status={status} /> : null}
            {showButton && buttonTitle ? (
              isRequestButton ? (
                <Button
                  aria-label={buttonTitle}
                  backgroundColor="var(--accent-design-request)"
                  className={designRequestButtonClassName}
                  foregroundColor="var(--accent-design-request-foreground)"
                  leftIcon={designRequestButtonIcon}
                  title={buttonTitle}
                  variant={ButtonVariantEnum.COLORED}
                  onClick={onOpenPanel}
                />
              ) : (
                <Button
                  aria-label={buttonTitle}
                  className={designRequestButtonClassName}
                  leftIcon={designRequestButtonIcon}
                  title={buttonTitle}
                  variant={ButtonVariantEnum.ACCENT}
                  onClick={onOpenPanel}
                />
              )
            ) : buttonTitle ? (
              <Button
                aria-label={buttonTitle}
                className="flex-1 sm:flex-none"
                title={buttonTitle}
                variant={ButtonVariantEnum.GHOST}
                onClick={onOpenPanel}
              />
            ) : null}
          </>
        ) : null}
        {onOpenNotes ? (
          <Button
            className="ml-auto"
            leftIcon={
              <StickyNote aria-hidden className="h-4 w-4" strokeWidth={2} />
            }
            title="Notes"
            onClick={onOpenNotes}
          />
        ) : null}
      </div>
    </div>
  );
}
