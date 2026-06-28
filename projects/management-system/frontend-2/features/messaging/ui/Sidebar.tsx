import { ReactNode, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  SearchInput,
} from "@fieldflow360/org-ui";
import { Plus } from "lucide-react";

import type { Conversation, MessagePreview } from "@/api/types/chat";
import type { TeamMember } from "@/api/types/team";
import MessageListCard from "@/features/messaging/ui/MessageListCard";

export default function Sidebar({
  conversations,
  selectedId,
  setSelectedId,
  tab,
  children,
  onAddGroup,
  unseenChats,
  latestMessages = {},
  teamMembers = [],
  selectedDirectMemberId,
  onSelectDirectMember,
  currentUserId = 1,
}: {
  conversations: Conversation[];
  selectedId: number;
  setSelectedId: (id: number) => void;
  tab?: string;
  children?: ReactNode;
  onAddGroup?: () => void;
  unseenChats?: Record<string, number>;
  latestMessages?: Record<number, MessagePreview>;
  teamMembers?: TeamMember[];
  selectedDirectMemberId?: number | null;
  onSelectDirectMember?: (id: number) => void;
  currentUserId?: number;
}) {
  const [search, setSearch] = useState("");

  const getMessageTimestamp = (message?: MessagePreview): number => {
    const rawTimestamp =
      message?.created_at || message?.timestamp || message?.time || null;
    if (!rawTimestamp) return 0;
    const parsed = new Date(rawTimestamp).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  // Filter for DMs and Groups
  const directGroups = conversations.filter(
    (g) => g.is_private && g.members && g.members.length === 2
  );
  const groupGroups = conversations.filter(
    (g) => !g.is_private || (g.members && g.members.length > 2)
  );
  // Filter and sort by latest message timestamp (newest first)
  const filteredGroups = useMemo(() => {
    return groupGroups
      .filter((group) =>
        (group.group_name || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aTs = getMessageTimestamp(latestMessages[a.id]);
        const bTs = getMessageTimestamp(latestMessages[b.id]);
        if (aTs === bTs) {
          return (a.group_name || "").localeCompare(b.group_name || "");
        }
        return bTs - aTs;
      });
  }, [groupGroups, latestMessages, search]);

  const sortedDirectMembers = useMemo(() => {
    return teamMembers
      .filter((member) => member.user.id !== currentUserId)
      .filter((member) =>
        (member.user?.username || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aGroup = directGroups.find((group) =>
          group.members?.find((id: number) => id === a.id)
        );
        const bGroup = directGroups.find((group) =>
          group.members?.find((id: number) => id === b.id)
        );
        const aTs = aGroup ? getMessageTimestamp(latestMessages[aGroup.id]) : 0;
        const bTs = bGroup ? getMessageTimestamp(latestMessages[bGroup.id]) : 0;

        if (aTs === bTs) {
          return (a.user?.username || "").localeCompare(b.user?.username || "");
        }
        return bTs - aTs;
      });
  }, [teamMembers, currentUserId, search, directGroups, latestMessages]);
  // Helper to format ISO date strings (copied from ChatWindow)
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <aside className="bg-bg-surface border-border-subtle flex h-full w-[100%] flex-col border-r">
      <div className="border-border-subtle flex flex-col gap-3 border-b px-4 pt-4 pb-3">
        <div>
          <h2 className="text-text-primary text-xl font-semibold">Messages</h2>
          <p className="text-text-muted mt-0.5 text-xs">
            Chat with team members and clients.
          </p>
        </div>
        {children}
        <div className="flex items-center gap-2">
          <SearchInput
            className="h-9 flex-1"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
          {tab === "groups" && (
            <Button
              iconOnly
              aria-label="New group"
              leftIcon={<Plus className="h-5 w-5" />}
              size={ComponentSizeEnum.MD}
              variant={ButtonVariantEnum.SURFACE}
              onClick={onAddGroup}
            />
          )}
        </div>
      </div>
      {/* Direct Messages Section */}
      {tab === "direct" && (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {sortedDirectMembers.length === 0 && (
            <p className="text-text-muted px-3 py-8 text-center text-sm">
              No conversations found.
            </p>
          )}
          {sortedDirectMembers.map((member) => {
            // Find existing conversation with this member
            const existingGroup = directGroups.find((group) => {
              return group.members?.find((id: number) => id === member.id);
            });
            const latest = existingGroup
              ? latestMessages[existingGroup.id]
              : null;
            const username = member.user?.username || "";

            return (
              <MessageListCard
                key={member.id}
                date={latest?.created_at ? formatDate(latest.created_at) : ""}
                latestMessage={latest?.body || latest?.text || ""}
                memberId={member.id}
                selected={selectedDirectMemberId === member.id}
                title={username}
                unseenCount={
                  existingGroup ? unseenChats?.[existingGroup.id] : undefined
                }
                onClick={() =>
                  onSelectDirectMember && onSelectDirectMember(member.id)
                }
              />
            );
          })}
        </div>
      )}
      {/* Group Chats Section */}
      {tab === "groups" && (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {filteredGroups.length === 0 && (
            <p className="text-text-muted px-3 py-8 text-center text-sm">
              No groups found.
            </p>
          )}
          {filteredGroups.map((group) => {
            const latest = latestMessages[group.id];
            // For groups, we don't pass memberId since it's a group chat
            return (
              <MessageListCard
                key={group.id}
                date={latest?.created_at ? formatDate(latest.created_at) : ""}
                latestMessage={latest?.body || latest?.text || ""}
                selected={selectedId === group.id}
                title={group.group_name || ""}
                unseenCount={unseenChats?.[group.id]}
                onClick={() => setSelectedId(group.id)}
              />
            );
          })}
        </div>
      )}
    </aside>
  );
}
