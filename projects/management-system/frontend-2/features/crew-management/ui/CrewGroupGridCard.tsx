"use client";

import { Avatar, TableActions, TableGridCard } from "@fieldflow360/org-ui";

import type { CrewGroupDetail } from "@/api/types";
import { INLINE_TABLE_ROW_ACTIONS_PROPS } from "@/shared/lib/table/columns";

import {
  type CrewGroupActionHandlers,
  buildCrewGroupTableActions,
} from "../lib/buildCrewGroupTableActions";

export interface CrewGroupGridCardProps {
  group: CrewGroupDetail;
  handlers: CrewGroupActionHandlers;
}

function ProjectTypeBadges({
  projectTypes,
}: {
  projectTypes: CrewGroupDetail["project_types"];
}) {
  const types = projectTypes ?? [];
  if (types.length === 0) {
    return <p className="text-text-muted text-xs">No job types assigned</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {types.map((projectType) => (
        <span
          key={projectType.id}
          className="border-border-subtle bg-bg-surface text-text-primary inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
        >
          {projectType.color ? (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: projectType.color }}
            />
          ) : null}
          <span className="truncate">{projectType.name}</span>
        </span>
      ))}
    </div>
  );
}

export function CrewGroupGridCard({ group, handlers }: CrewGroupGridCardProps) {
  const isActive = group.is_active ?? true;
  const isDefault = group.is_default ?? false;
  const activeMembers = group.members.filter((member) => member.is_active);
  const actions = buildCrewGroupTableActions(group, handlers);

  return (
    <div className={!isActive ? "opacity-60" : undefined}>
      <TableGridCard
        actions={
          actions.length > 0 ? (
            <TableActions
              actions={actions}
              item={group}
              {...INLINE_TABLE_ROW_ACTIONS_PROPS}
            />
          ) : undefined
        }
        headerContent={
          <div className="flex flex-wrap items-center gap-2">
            {isDefault ? (
              <span className="bg-bg-surface text-text-secondary rounded-full px-2 py-0.5 text-xs font-medium">
                Default
              </span>
            ) : null}
            <ProjectTypeBadges projectTypes={group.project_types} />
          </div>
        }
        title={group.name}
      >
        <div className="space-y-3">
          <p className="text-text-muted text-xs">
            {activeMembers.length} member
            {activeMembers.length === 1 ? "" : "s"}
          </p>
          <ul className="max-h-36 space-y-2 overflow-y-auto">
            {activeMembers.slice(0, 5).map((member) => (
              <li key={member.id} className="flex min-w-0 items-center gap-2">
                <Avatar
                  alt={member.user.username}
                  fallback={member.user.username.slice(0, 1)}
                  size={32}
                  src={member.user.profile_image ?? undefined}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.user.username}
                  </p>
                  <p className="text-text-muted truncate text-xs">
                    {member.role_display}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {activeMembers.length > 5 ? (
            <p className="text-text-muted text-center text-xs">
              +{activeMembers.length - 5} more
            </p>
          ) : null}
        </div>
      </TableGridCard>
    </div>
  );
}
