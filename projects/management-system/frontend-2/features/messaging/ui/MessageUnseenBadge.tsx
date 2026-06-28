import { FC } from "react";

import { cn } from "@fieldflow360/org-ui";

interface MessageUnseenBadgeProps {
  count: number;
  className?: string;
}

const MessageUnseenBadge: FC<MessageUnseenBadgeProps> = ({
  count,
  className,
}) => {
  if (!count || count <= 0) return null;
  return (
    <span
      className={cn(
        "bg-accent text-text-inverse inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default MessageUnseenBadge;
