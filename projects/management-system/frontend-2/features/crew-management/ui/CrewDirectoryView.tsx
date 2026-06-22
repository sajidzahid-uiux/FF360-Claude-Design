"use client";

import { useCallback, useMemo, useState } from "react";

import {
  ComponentSizeEnum,
  Loader,
  SearchInput,
  TabsSwitcher,
  TabsSwitcherViewEnum,
} from "@fieldflow360/org-ui";
import { Users } from "lucide-react";

import { CrewService } from "@/api/services";
import type { CrewDirectoryMember } from "@/api/types";
import {
  useCrewDirectoryMutations,
  useCrewGroupMutations,
} from "@/hooks/mutations";
import { useRoutePermissions } from "@/hooks/permissions";
import { useActiveCrewGroups, useCrewDirectoryList } from "@/hooks/queries";
import { useRouteIds } from "@/hooks/useRouteIds";

import type { CrewMemberActionHandlers } from "../lib/buildCrewMemberTableActions";
import { CrewDirectoryOverviewStats } from "./CrewDirectoryOverviewStats";
import { CrewMemberGridCard } from "./CrewMemberGridCard";

type DirectoryTab = "assigned" | "unassigned";

const DIRECTORY_TABS = [
  { value: "assigned" as const, label: "Assigned" },
  { value: "unassigned" as const, label: "Unassigned" },
] as const;

interface CrewMemberListProps {
  members: CrewDirectoryMember[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  emptyMessage: string;
  handlers: CrewMemberActionHandlers;
}

function CrewMemberList({
  members,
  isLoading,
  searchTerm,
  emptyMessage,
  handlers,
}: CrewMemberListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader size={ComponentSizeEnum.MD} text="Loading crew members..." />
      </div>
    );
  }

  if (!members?.length) {
    return (
      <div className="py-12 text-center">
        <Users aria-hidden className="text-text-muted mx-auto mb-4 h-12 w-12" />
        <h3 className="text-text-primary mb-2 text-lg font-medium">
          {emptyMessage}
        </h3>
        <p className="text-text-muted text-sm">
          {searchTerm
            ? "Try adjusting your search terms"
            : "No crew members found"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {members.map((member) => (
        <CrewMemberGridCard
          key={member.id}
          handlers={handlers}
          member={member}
        />
      ))}
    </div>
  );
}

export function CrewDirectoryView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<DirectoryTab>("assigned");
  const [isAddingToGroup, setIsAddingToGroup] = useState(false);

  const { orgId } = useRouteIds();
  const { write: canEditCrew } = useRoutePermissions() || {};
  const { addMemberToGroup } = useCrewDirectoryMutations();
  const { reactivateMembersInGroup } = useCrewGroupMutations();
  const { data: activeGroups = [] } = useActiveCrewGroups();

  const searchQuery = searchTerm.trim();
  const { data: overviewData, isLoading: overviewLoading } =
    useCrewDirectoryList();
  const {
    data: tabData,
    isLoading: tabLoading,
    error,
  } = useCrewDirectoryList(searchQuery || undefined, activeTab);

  const handleAddToGroup = useCallback(
    async (member: CrewDirectoryMember, groupId: number) => {
      setIsAddingToGroup(true);
      try {
        let shouldReactivate = false;
        try {
          if (!orgId) {
            throw new Error("Organization ID is required");
          }
          const group = await CrewService.getCrewGroup(orgId, groupId);
          const prior = group.members.find((m) => m.id === member.id);
          if (prior?.is_active === false) {
            shouldReactivate = true;
          }
        } catch {
          // Fall back to regular add
        }

        if (shouldReactivate) {
          await reactivateMembersInGroup.mutateAsync({
            crewGroupId: groupId,
            data: { members: [member.id] },
          });
        } else {
          await addMemberToGroup.mutateAsync({
            memberId: member.id,
            data: { group_id: groupId },
          });
        }
      } finally {
        setIsAddingToGroup(false);
      }
    },
    [addMemberToGroup, orgId, reactivateMembersInGroup]
  );

  const handlers: CrewMemberActionHandlers = useMemo(
    () => ({
      canEdit: !!canEditCrew,
      availableGroups: activeGroups,
      isAdding:
        isAddingToGroup ||
        addMemberToGroup.isPending ||
        reactivateMembersInGroup.isPending,
      onAddToGroup: handleAddToGroup,
    }),
    [
      canEditCrew,
      activeGroups,
      isAddingToGroup,
      addMemberToGroup.isPending,
      reactivateMembersInGroup.isPending,
      handleAddToGroup,
    ]
  );

  const emptyMessage =
    activeTab === "assigned"
      ? "No assigned crew members found"
      : "No unassigned crew members found";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          className="w-full sm:max-w-sm md:max-w-md"
          placeholder="Search crew members..."
          value={searchTerm}
          variant="underlined"
          onChange={(event) => setSearchTerm(event.target.value)}
          onClear={() => setSearchTerm("")}
        />
        <TabsSwitcher
          items={[...DIRECTORY_TABS]}
          size={ComponentSizeEnum.SM}
          value={activeTab}
          view={TabsSwitcherViewEnum.PILL}
          onChange={setActiveTab}
        />
      </div>

      <section className="space-y-4">
        <h2 className="text-text-primary text-lg font-semibold">Overview</h2>
        <CrewDirectoryOverviewStats
          isLoading={overviewLoading}
          stats={overviewData?.stats}
        />
      </section>

      {error ? (
        <p className="text-feedback-error py-12 text-center text-sm">
          Error loading crew directory: {error.message}
        </p>
      ) : (
        <CrewMemberList
          emptyMessage={emptyMessage}
          handlers={handlers}
          isLoading={tabLoading}
          members={tabData?.members}
          searchTerm={searchQuery}
        />
      )}
    </div>
  );
}
