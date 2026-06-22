"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { cn } from "@fieldflow360/org-ui";
import { Shield } from "lucide-react";

import type { UserPermissionsResponse } from "@/api/types";
import { useUserPermissions } from "@/hooks";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/primitives";

import { groupPermissionsByConfig } from "./utils/groupPermissionsByConfig";

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

  const role = (data as UserPermissionsResponse).role;
  const permissions = (data as UserPermissionsResponse).permissions ?? [];
  const roleName = role?.name ?? "No role assigned";
  const roleDescription = getRoleDescription(roleName);
  const permissionGroups = groupPermissionsByConfig(permissions);

  return (
    <div className="w-full min-w-0 space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="bg-bg-app text-text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Shield className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <CardTitle className="truncate text-lg">
                  {user?.name ?? user?.email ?? "User"}
                </CardTitle>
                {user?.email ? (
                  <CardDescription className="truncate">
                    {user.email}
                  </CardDescription>
                ) : null}
              </div>
            </div>
            <Badge
              className="shrink-0 self-start px-3 py-1 text-xs font-semibold"
              variant="secondary"
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

      {permissionGroups.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-text-primary text-lg font-semibold">
              Your permissions
            </h2>
            <p className="text-text-muted mt-1 text-sm">
              Access granted to your account across organization features.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {permissionGroups.map((group) => (
              <Card
                key={group.entityTitle}
                className="flex h-full flex-col rounded-2xl"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                  <CardTitle className="text-base leading-snug">
                    {group.entityTitle}
                  </CardTitle>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                      "bg-[var(--color-feedback-success-soft)] text-[var(--color-feedback-success-strong)]"
                    )}
                  >
                    Granted
                  </span>
                </CardHeader>
                <CardContent className="flex-1 pt-0">
                  <ul className="space-y-2">
                    {group.actionLabels.map((label, idx) => (
                      <li
                        key={`${group.entityTitle}-${label}-${idx}`}
                        className="text-text-secondary flex gap-2 text-sm leading-relaxed"
                      >
                        <span
                          aria-hidden
                          className="text-text-muted mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                        />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
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
