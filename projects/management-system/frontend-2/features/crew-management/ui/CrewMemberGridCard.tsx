"use client";

import { useMemo } from "react";

import {
  Avatar,
  Dropdown,
  type DropdownOption,
  TableActions,
  TableGridCard,
} from "@fieldflow360/org-ui";
import { Mail, Users } from "lucide-react";

import type { CrewDirectoryMember } from "@/api/types";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";

import {
  type CrewMemberActionHandlers,
  buildCrewMemberTableActions,
} from "../lib/buildCrewMemberTableActions";

const VISIBLE_GROUP_COUNT = 3;

export interface CrewMemberGridCardProps {
  member: CrewDirectoryMember;
  handlers: CrewMemberActionHandlers;
}

export function CrewMemberGridCard({
  member,
  handlers,
}: CrewMemberGridCardProps) {
  const actions = buildCrewMemberTableActions(member, handlers);
  const visibleGroups = member.groups.slice(0, VISIBLE_GROUP_COUNT);
  const hiddenGroups = member.groups.slice(VISIBLE_GROUP_COUNT);

  const overflowOptions = useMemo(
    (): DropdownOption<string>[] =>
      hiddenGroups.map((group) => ({
        value: String(group.id),
        label: group.is_default ? `${group.name} (Default)` : group.name,
      })),
    [hiddenGroups]
  );

  return (
    <TableGridCard
      actions={
        actions.length > 0 ? (
          <TableActions
            actions={actions}
            item={member}
            {...INLINE_TABLE_ROW_ACTIONS_PROPS}
          />
        ) : undefined
      }
      headerContent={
        <span className="bg-bg-surface text-text-secondary inline-flex rounded-full px-2 py-0.5 text-xs font-medium">
          {member.role_display}
        </span>
      }
      title={
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar
            alt={member.name}
            fallback={member.name.slice(0, 1)}
            size={40}
          />
          <span className="truncate">{member.name}</span>
        </div>
      }
    >
      <dl className="flex flex-col gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Mail aria-hidden className="text-text-muted h-4 w-4 shrink-0" />
          <dd className="text-text-secondary min-w-0 truncate text-xs">
            {member.email}
          </dd>
        </div>

        <div className="space-y-2">
          <dt className="text-text-muted flex items-center gap-2 text-xs font-medium">
            <Users aria-hidden className="h-4 w-4" />
            Groups ({member.groups.length})
          </dt>
          {member.groups.length === 0 ? (
            <dd className="text-text-muted text-xs">No groups assigned</dd>
          ) : (
            <dd className="flex flex-wrap items-center gap-1.5">
              {visibleGroups.map((group) => (
                <span
                  key={group.id}
                  className="border-border-subtle bg-bg-surface text-text-primary inline-flex max-w-full rounded-full border px-2 py-0.5 text-xs"
                  title={group.name}
                >
                  <span className="truncate">
                    {group.name}
                    {group.is_default ? " (Default)" : ""}
                  </span>
                </span>
              ))}
              {hiddenGroups.length > 0 ? (
                <Dropdown
                  className="w-auto"
                  fullWidth={false}
                  menuMinWidth={220}
                  options={overflowOptions}
                  placeholder={`+${hiddenGroups.length} more`}
                  triggerClassName="!w-auto"
                  onChange={() => {}}
                />
              ) : null}
            </dd>
          )}
        </div>
      </dl>
    </TableGridCard>
  );
}
