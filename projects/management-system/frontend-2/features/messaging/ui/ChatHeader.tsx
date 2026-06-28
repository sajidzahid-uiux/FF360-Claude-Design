import { FC } from "react";

import {
  Avatar,
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  cn,
} from "@fieldflow360/org-ui";
import { ArrowLeft, Users } from "lucide-react";

import { useOnlineMembers } from "@/features/messaging/model/online-members-store";

interface ChatHeaderProps {
  name: string;
  isGroup: boolean;
  memberCount?: number;
  directMemberId?: number | null;
  onBack?: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({
  name,
  isGroup,
  memberCount,
  directMemberId,
  onBack,
}) => {
  const { onlineMembers } = useOnlineMembers();
  const isOnline = directMemberId ? onlineMembers.includes(directMemberId) : false;

  const subtitle = isGroup
    ? `${memberCount ?? 0} member${memberCount === 1 ? "" : "s"}`
    : isOnline
      ? "Online"
      : "Offline";

  return (
    <header className="bg-bg-surface border-border-subtle flex shrink-0 items-center gap-3 border-b px-4 py-3">
      {onBack && (
        <Button
          iconOnly
          aria-label="Back to conversations"
          leftIcon={<ArrowLeft className="h-5 w-5" />}
          size={ComponentSizeEnum.SM}
          variant={ButtonVariantEnum.GHOST}
          onClick={onBack}
        />
      )}
      <div className="relative shrink-0">
        <Avatar
          alt={name}
          fallback={name?.[0]?.toUpperCase() || "U"}
          size="md"
        />
        {isGroup ? (
          <span className="bg-accent text-text-inverse border-bg-surface absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2">
            <Users className="h-2.5 w-2.5" />
          </span>
        ) : (
          <span
            className={cn(
              "border-bg-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2",
              isOnline ? "bg-feedback-success" : "bg-text-muted/40"
            )}
            title={isOnline ? "Online" : "Offline"}
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-text-primary truncate text-base leading-tight font-semibold">
          {name}
        </p>
        <p
          className={cn(
            "truncate text-xs",
            !isGroup && isOnline ? "text-feedback-success" : "text-text-muted"
          )}
        >
          {subtitle}
        </p>
      </div>
    </header>
  );
};

export default ChatHeader;
