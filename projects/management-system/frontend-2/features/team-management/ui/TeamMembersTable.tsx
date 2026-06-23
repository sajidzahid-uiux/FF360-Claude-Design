"use client";

import { type ReactNode, useMemo } from "react";

import {
  Avatar,
  type Column,
  type TableGridViewConfig,
  type TableViewMode,
  TableViewSwitcher,
} from "@fieldflow360/org-ui";
import { Shield } from "lucide-react";

import type { TeamMember } from "@/api/types";
import { API_URL } from "@/constants";
import { TeamMemberRoleBadges } from "@/features/team";
import { CmsOrgUiTable } from "@/shared/ui";

export interface TeamMembersTableProps {
  members: TeamMember[];
  isLoading?: boolean;
  view: TableViewMode;
  onViewChange: (view: TableViewMode) => void;
  /** Resolves a member's human-readable role label. */
  getRoleDisplayName: (member: TeamMember) => string;
  /** Renders the per-row actions menu (role change, flags, remove). */
  renderRowActions?: (member: TeamMember) => ReactNode;
}

function memberDisplayName(member: TeamMember): string {
  const user = member.user;
  return user.first_name || user.last_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user.username;
}

function resolveAvatarUrl(member: TeamMember): string | undefined {
  let imageUrl = member.user.profile_image;
  if (!imageUrl) return undefined;
  imageUrl = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  imageUrl = imageUrl.endsWith("/") ? imageUrl.slice(0, -1) : imageUrl;
  return imageUrl.includes("http") ? imageUrl : `${API_URL}${imageUrl}`;
}

function MemberIdentity({ member }: { member: TeamMember }) {
  const name = memberDisplayName(member);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar fallback={name} size="sm" src={resolveAvatarUrl(member)} />
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="text-text-primary truncate font-medium">{name}</span>
        {member.owner ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            <Shield className="h-3 w-3" />
            Owner
          </span>
        ) : null}
        <TeamMemberRoleBadges member={member} />
      </div>
    </div>
  );
}

export function TeamMembersTable({
  members,
  isLoading,
  view,
  onViewChange,
  getRoleDisplayName,
  renderRowActions,
}: TeamMembersTableProps) {
  const columns = useMemo<Column<TeamMember>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        render: (member) => <MemberIdentity member={member} />,
      },
      {
        key: "role",
        header: "Role",
        render: (member) => (
          <span className="flex items-center gap-2">
            <span className="text-sm">{getRoleDisplayName(member)}</span>
            {member.owner ? (
              <span className="text-text-muted text-xs italic">
                (Permanent)
              </span>
            ) : null}
          </span>
        ),
      },
      {
        key: "username",
        header: "Username",
        render: (member) => (
          <span className="text-sm">{member.user.username}</span>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        render: (member) => (
          <span className="text-sm tabular-nums">
            {member.user.phone_number || "—"}
          </span>
        ),
      },
      {
        key: "email",
        header: "Email",
        render: (member) => (
          <span className="text-sm">{member.user.email || "—"}</span>
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        hideable: false,
        render: (member) =>
          renderRowActions ? (
            <div data-no-row-nav className="flex justify-end">
              {renderRowActions(member)}
            </div>
          ) : null,
      },
    ],
    [getRoleDisplayName, renderRowActions]
  );

  const grid = useMemo<TableGridViewConfig<TeamMember>>(
    () => ({
      minColumnWidth: "minmax(18rem, 1fr)",
      renderCard: (member) => (
        <div className="border-border-subtle bg-bg-surface-elevated flex h-full flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-start justify-between gap-2">
            <MemberIdentity member={member} />
            {renderRowActions ? (
              <div data-no-row-nav className="shrink-0">
                {renderRowActions(member)}
              </div>
            ) : null}
          </div>
          <dl className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Role</dt>
              <dd className="text-text-primary text-xs font-medium">
                {getRoleDisplayName(member)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Username</dt>
              <dd className="text-text-primary text-xs font-medium">
                {member.user.username}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Phone</dt>
              <dd className="text-text-primary text-xs font-medium tabular-nums">
                {member.user.phone_number || "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-text-muted text-xs">Email</dt>
              <dd className="text-text-primary truncate text-xs font-medium">
                {member.user.email || "—"}
              </dd>
            </div>
          </dl>
        </div>
      ),
    }),
    [getRoleDisplayName, renderRowActions]
  );

  return (
    <CmsOrgUiTable
      compact
      columns={columns}
      data={members}
      emptyState={{
        title: "No team members",
        description: "Team members will appear here.",
      }}
      grid={grid}
      isLoading={isLoading}
      toolbar={
        <div className="flex justify-end pb-3">
          <TableViewSwitcher value={view} onValueChange={onViewChange} />
        </div>
      }
      view={view}
    />
  );
}
