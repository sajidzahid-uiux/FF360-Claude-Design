"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Table, type Column } from "@fieldflow360/org-ui";
import { Check, ShieldCheck } from "lucide-react";

import type { UserPermissionsResponse } from "@/api/types";
import { useUserPermissions } from "@/hooks";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import type { ConfigPermissionGroup } from "./utils/groupPermissionsByConfig";
import { groupPermissionsByConfig } from "./utils/groupPermissionsByConfig";

type PermissionRow = ConfigPermissionGroup & { id: string };

const PERMISSION_COLUMNS: Column<PermissionRow>[] = [
  {
    key: "module",
    header: "Module",
    width: "30%",
    render: (row) => (
      <span className="text-text-primary font-medium">{row.entityTitle}</span>
    ),
  },
  {
    key: "access",
    header: "Access",
    width: "140px",
    render: () => (
      <span className="bg-[var(--color-feedback-success-soft)] text-[var(--color-feedback-success-text)] inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
        Granted
      </span>
    ),
  },
  {
    key: "permissions",
    header: "Permissions",
    render: (row) => (
      <div className="flex flex-wrap gap-1.5">
        {row.actionLabels.map((label, idx) => (
          <span
            key={`${row.id}-${label}-${idx}`}
            className="bg-bg-app text-text-secondary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
          >
            <Check
              aria-hidden
              className="text-[var(--color-feedback-success)] h-3 w-3 shrink-0"
              strokeWidth={2.5}
            />
            {label}
          </span>
        ))}
      </div>
    ),
  },
];

export default function RoleAndAccessOverview() {
  const { user } = useAuth0();
  const { data, isLoading, error } = useUserPermissions();

  if (isLoading) {
    return (
      <p className="text-text-muted py-12 text-center text-sm">
        Loading role and permissions...
      </p>
    );
  }

  if (error || !data) {
    return (
      <p className="text-feedback-error py-12 text-center text-sm">
        {error?.message || "Failed to load role and permissions."}
      </p>
    );
  }

  const typed = data as UserPermissionsResponse;
  const role = typed.role;
  // The my-permissions endpoint returns a flat `permission_codes` array; the
  // richer `permissions` object array isn't always populated, so fall back.
  const permissionCodes =
    typed.permission_codes?.length > 0
      ? typed.permission_codes
      : (typed.permissions ?? []).map((p) => p.code);
  const roleName = role?.name ?? "No role assigned";
  const displayName = user?.name ?? user?.email ?? "User";
  const isAdmin = role?.is_admin === true || roleName === "Admin";
  const roleDescription = getRoleDescription(roleName);
  const permissionRows: PermissionRow[] = groupPermissionsByConfig(
    permissionCodes
  ).map((group) => ({ ...group, id: group.entityTitle }));

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <Avatar
                size="lg"
                alt={displayName}
                fallback={getInitials(user?.name, user?.email)}
              />
              <div className="min-w-0">
                <CardTitle className="truncate text-lg">{displayName}</CardTitle>
                {user?.email ? (
                  <CardDescription className="truncate">
                    {user.email}
                  </CardDescription>
                ) : null}
              </div>
            </div>
            <Badge
              className="shrink-0 self-start px-3 py-1 text-xs font-semibold sm:self-center"
              variant={isAdmin ? "default" : "secondary"}
            >
              {roleName}
            </Badge>
          </div>
          {roleDescription ? (
            <p className="text-text-muted text-sm leading-relaxed">
              {roleDescription}
            </p>
          ) : null}
        </CardHeader>
      </Card>

      {permissionRows.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-text-primary text-lg font-semibold">
              Your permissions
            </h2>
            <p className="text-text-muted mt-1 text-sm">
              Access granted to your account across organization features.
            </p>
          </div>

          {isAdmin ? (
            <div className="border-[var(--color-feedback-success)]/25 bg-[var(--color-feedback-success-soft)] flex items-start gap-3 rounded-xl border px-4 py-3">
              <ShieldCheck className="text-[var(--color-feedback-success)] mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-text-secondary text-sm leading-relaxed">
                <span className="text-text-primary font-semibold">Admin</span> —
                full access to every module. The complete breakdown is listed
                below.
              </p>
            </div>
          ) : null}

          <Table
            data={permissionRows}
            columns={PERMISSION_COLUMNS}
            emptyState={{
              title: "No permissions",
              description: "This role has no module access assigned.",
            }}
          />
        </section>
      ) : null}
    </div>
  );
}

function getInitials(name?: string, email?: string): string {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "U";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function getRoleDescription(roleName: string): string {
  const descriptions: Record<string, string> = {
    Admin: "Full access to all organization features and settings.",
    "Project Manager":
      "Manages projects, team coordination, and client communications.",
    "Contractor Manager":
      "Manages drainage projects, team coordination, and client communications.",
    "Project Crew": "Access to assigned jobs and field operations.",
    Bookkeeper: "Access to financial records and bookkeeping features.",
    Viewer: "Read-only access to view organization data.",
  };
  return descriptions[roleName] ?? "";
}
