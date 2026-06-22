import type { TeamMember } from "@/api/types";

export type TableDateEmptyLabel = "N/A" | "—" | "-";

function parseTableDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTableLocaleDate(
  value: string | undefined | null,
  emptyLabel: TableDateEmptyLabel = "—"
): string {
  const date = parseTableDate(value);
  return date ? date.toLocaleDateString() : emptyLabel;
}

export function formatTableIsoDate(
  value: string | undefined | null,
  emptyLabel: TableDateEmptyLabel = "—"
): string {
  const date = parseTableDate(value);
  return date ? date.toISOString().split("T")[0] : emptyLabel;
}

export function formatTableDateIsoPart(
  value: string | undefined | null,
  emptyLabel: TableDateEmptyLabel = "N/A"
): string {
  if (!value) return emptyLabel;
  return value.split("T")[0] || emptyLabel;
}

export function resolveTeamMemberUsername(
  memberId: number | string | undefined,
  teamMembers: TeamMember[] | undefined
): string | undefined {
  if (memberId == null || !teamMembers?.length) return undefined;
  return teamMembers.find((member) => member.id === memberId)?.user?.username;
}

export function formatTableLastUpdatedWithUsername(
  value: string | undefined | null,
  username: string | null | undefined,
  emptyLabel: TableDateEmptyLabel = "N/A"
): string {
  const date = parseTableDate(value);
  if (!date) return emptyLabel;
  return `${date.toLocaleDateString()} • ${username || "N/A"}`;
}

export function formatTableLastUpdatedWithMemberId(
  value: string | undefined | null,
  memberId: number | string | undefined,
  teamMembers: TeamMember[] | undefined,
  emptyLabel: TableDateEmptyLabel = "N/A"
): string {
  return formatTableLastUpdatedWithUsername(
    value,
    resolveTeamMemberUsername(memberId, teamMembers),
    emptyLabel
  );
}
