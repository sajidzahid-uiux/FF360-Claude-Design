"use client";

import { useCallback, useMemo } from "react";

import {
  Avatar,
  SearchableDropdown,
  type SearchableDropdownOption,
} from "@fieldflow360/org-ui";
import { ChevronDown } from "lucide-react";

import type { TeamMember } from "@/api/types";
import { getInitials, resolveAvatarUrl } from "@/shared/lib";
import {
  formatRemovedTeamMemberLabel,
  isTeamMemberRemoved,
} from "@/utils/team/assignmentOrder";

interface ReceiverCellProps {
  eventId: string;
  receivers: TeamMember[];
  allMembers: TeamMember[];
  currentUserId?: number;
  isAdmin: boolean;
  onReceiversChange: (eventId: string, receivers: TeamMember[]) => void;
}

function memberValue(member: TeamMember): string {
  return isTeamMemberRemoved(member)
    ? `removed:${member.id}`
    : String(member.id);
}

export function ReceiverCell({
  eventId,
  receivers,
  allMembers,
  currentUserId,
  isAdmin,
  onReceiversChange,
}: ReceiverCellProps) {
  const activeMembers = useMemo(
    () => allMembers.filter((member) => !isTeamMemberRemoved(member)),
    [allMembers]
  );

  const removedReceivers = useMemo(
    () => receivers.filter((receiver) => isTeamMemberRemoved(receiver)),
    [receivers]
  );

  const displayName = useCallback((member: TeamMember) => {
    if (isTeamMemberRemoved(member)) {
      return formatRemovedTeamMemberLabel(member);
    }
    return (
      [member.user?.first_name, member.user?.last_name]
        .filter(Boolean)
        .join(" ") ||
      member.user?.username ||
      member.user?.email ||
      "Unknown"
    );
  }, []);

  const memberLookup = useMemo(() => {
    const lookup = new Map<string, TeamMember>();
    for (const member of [...allMembers, ...receivers]) {
      lookup.set(memberValue(member), member);
    }
    return lookup;
  }, [allMembers, receivers]);

  const options = useMemo(() => {
    const result: SearchableDropdownOption<string>[] = [];

    for (const member of removedReceivers) {
      result.push({
        value: memberValue(member),
        label: formatRemovedTeamMemberLabel(member),
        description: "No longer on team",
        group: "Removed members",
      });
    }

    for (const member of activeMembers) {
      const isSelected = receivers.some(
        (receiver) =>
          receiver.id === member.id || receiver.user?.id === member.user?.id
      );

      result.push({
        value: memberValue(member),
        label: currentUserId === member.user?.id ? "Me" : displayName(member),
        description: member.role_fk?.name || "",
        group: isSelected ? "Assignee" : "Members",
      });
    }

    return result;
  }, [activeMembers, currentUserId, displayName, receivers, removedReceivers]);

  const selectedValues = useMemo(
    () => receivers.map((receiver) => memberValue(receiver)),
    [receivers]
  );

  const handleValuesChange = useCallback(
    (values: string[]) => {
      const nextReceivers = values
        .map((value) => memberLookup.get(value))
        .filter((member): member is TeamMember => member !== undefined);
      onReceiversChange(eventId, nextReceivers);
    },
    [eventId, memberLookup, onReceiversChange]
  );

  if (!isAdmin) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 px-4 py-3">
        {receivers.length === 0 ? (
          <span className="text-text-muted text-sm">No receivers</span>
        ) : (
          receivers
            .slice(0, 5)
            .map((receiver) => (
              <Avatar
                key={receiver.id}
                alt={displayName(receiver)}
                fallback={getInitials(
                  displayName(receiver),
                  receiver.user?.email
                )}
                size="sm"
                src={resolveAvatarUrl(receiver)}
              />
            ))
        )}
        {receivers.length > 5 && (
          <span className="text-text-muted text-xs">
            +{receivers.length - 5} more
          </span>
        )}
      </div>
    );
  }

  return (
    <SearchableDropdown
      multiple
      emptyStateText="No members found"
      menuMinWidth={321}
      options={options}
      placeholder="No receivers"
      searchPlaceholder="Search by username..."
      trigger={() => (
        <span className="hover:bg-bg-surface/50 flex min-h-[3.25rem] w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors">
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {receivers.length === 0 ? (
              <span className="text-text-muted text-sm">No receivers</span>
            ) : (
              receivers
                .slice(0, 3)
                .map((receiver) => (
                  <Avatar
                    key={receiver.id}
                    alt={displayName(receiver)}
                    className="border-background border-2"
                    fallback={getInitials(
                      displayName(receiver),
                      receiver.user?.email
                    )}
                    size="sm"
                    src={resolveAvatarUrl(receiver)}
                  />
                ))
            )}
            {receivers.length > 3 && (
              <span className="text-text-muted text-xs">
                +{receivers.length - 3}
              </span>
            )}
          </div>
          <ChevronDown className="text-text-muted h-5 w-5 shrink-0" />
        </span>
      )}
      values={selectedValues}
      onValuesChange={handleValuesChange}
    />
  );
}
