import { FC } from "react";

import { cn } from "@fieldflow360/org-ui";

import { useOnlineMembers } from "@/features/messaging/model/online-members-store";
import { Card } from "@/shared/ui/primitives";

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

  return (
    <Card
      className={cn(
        "hover:border-accent mb-2 flex cursor-pointer items-start justify-between border border-transparent p-4 transition-all",
        selected && "bg-bg-hover text-text-primary border-accent"
      )}
      onClick={onClick}
    >
      <div className="w-full min-w-0 flex-1">
        <div className="flex w-full items-start justify-between">
          <div className="flex min-w-0 flex-1 items-center">
            {memberId && (
              <span
                className={cn(
                  "mr-2 h-2 w-2 flex-shrink-0 rounded-full",
                  isOnline ? "bg-green-500" : "bg-red-500"
                )}
                title={`${title} is ${isOnline ? "online" : "offline"}`}
              />
            )}
            <span className="truncate text-base font-medium">{title}</span>
            <span className="ml-2">
              <MessageUnseenBadge count={unseenCount || 0} />
            </span>
          </div>
          <div>
            <span className="text-text-muted ml-auto text-xs whitespace-nowrap">
              {date}
            </span>
          </div>
        </div>
        <div className="text-text-muted truncate text-xs">
          {latestMessage || "No messages yet."}
        </div>
      </div>
    </Card>
  );
};

export default MessageListCard;
