import { FC } from "react";

import { Avatar, cn } from "@fieldflow360/org-ui";

import { useOnlineMembers } from "@/features/messaging/model/online-members-store";

import MessageUnseenBadge from "./MessageUnseenBadge";

interface MessageListCardProps {
  title: string;
  unseenCount?: number;
  date?: string;
  latestMessage?: string;
  selected?: boolean;
  onClick?: () => void;
  memberId?: number; // Added memberId prop
}

const MessageListCard: FC<MessageListCardProps> = ({
  title,
  unseenCount,
  date,
  latestMessage,
  selected,
  onClick,
  memberId,
}) => {
  const { onlineMembers } = useOnlineMembers();
  const isOnline = memberId ? onlineMembers.includes(memberId) : false;
  const hasUnseen = Boolean(unseenCount && unseenCount > 0);

  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
        selected ? "bg-bg-hover" : "hover:bg-bg-hover/60"
      )}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="relative shrink-0">
        <Avatar alt={title} fallback={title?.[0]?.toUpperCase() || "U"} size="md" />
        {memberId ? (
          <span
            className={cn(
              "border-bg-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2",
              isOnline ? "bg-feedback-success" : "bg-text-muted/40"
            )}
            title={`${title} is ${isOnline ? "online" : "offline"}`}
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              hasUnseen ? "text-text-primary font-semibold" : "font-medium"
            )}
          >
            {title}
          </span>
          {date ? (
            <span className="text-text-muted shrink-0 text-[11px] whitespace-nowrap">
              {date}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-xs",
              hasUnseen ? "text-text-secondary" : "text-text-muted"
            )}
          >
            {latestMessage || "No messages yet."}
          </span>
          <MessageUnseenBadge count={unseenCount || 0} />
        </div>
      </div>
    </div>
  );
};

export default MessageListCard;
