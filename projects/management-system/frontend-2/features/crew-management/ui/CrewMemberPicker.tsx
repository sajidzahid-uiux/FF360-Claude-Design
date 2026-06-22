"use client";

import { useCallback, useMemo } from "react";

import {
  Avatar,
  Checkbox,
  ComponentSizeEnum,
  Loader,
  SearchInput,
} from "@fieldflow360/org-ui";

import type { AvailableMember } from "@/api/types";

interface CrewMemberPickerProps {
  members: AvailableMember[];
  selectedMemberIds: number[];
  onSelectedMemberIdsChange: (ids: number[]) => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  isLoading?: boolean;
  label?: string;
}

export function CrewMemberPicker({
  members,
  selectedMemberIds,
  onSelectedMemberIdsChange,
  searchTerm,
  onSearchTermChange,
  isLoading = false,
  label = "Select members",
}: CrewMemberPickerProps) {
  const allFilteredSelected =
    members.length > 0 &&
    members.every((member) => selectedMemberIds.includes(member.id));

  const handleSelectAll = useCallback(() => {
    if (allFilteredSelected) {
      onSelectedMemberIdsChange(
        selectedMemberIds.filter(
          (id) => !members.some((member) => member.id === id)
        )
      );
      return;
    }

    const toAdd = members
      .filter((member) => !selectedMemberIds.includes(member.id))
      .map((member) => member.id);
    onSelectedMemberIdsChange([...selectedMemberIds, ...toAdd]);
  }, [
    allFilteredSelected,
    members,
    onSelectedMemberIdsChange,
    selectedMemberIds,
  ]);

  const toggleMember = useCallback(
    (memberId: number) => {
      onSelectedMemberIdsChange(
        selectedMemberIds.includes(memberId)
          ? selectedMemberIds.filter((id) => id !== memberId)
          : [...selectedMemberIds, memberId]
      );
    },
    [onSelectedMemberIdsChange, selectedMemberIds]
  );

  const emptyMessage = useMemo(() => {
    if (isLoading) return null;
    if (searchTerm.trim()) return "No members found";
    return "No available members";
  }, [isLoading, searchTerm]);

  return (
    <div className="space-y-2">
      <p className="text-text-primary text-sm font-medium">{label}</p>
      <SearchInput
        placeholder="Search members..."
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
      />

      <div className="border-border-subtle max-h-48 overflow-y-auto rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader centerInContainer={false} size={ComponentSizeEnum.SM} />
          </div>
        ) : members.length === 0 ? (
          <p className="text-text-muted px-3 py-6 text-center text-sm">
            {emptyMessage}
          </p>
        ) : (
          <div className="divide-border-subtle divide-y">
            <label className="hover:bg-bg-surface flex cursor-pointer items-center gap-3 px-3 py-2.5">
              <Checkbox
                checked={allFilteredSelected}
                onChange={() => handleSelectAll()}
              />
              <span className="text-sm font-medium">Select all</span>
            </label>
            {members.map((member) => {
              const displayName = member.user.username;
              const checked = selectedMemberIds.includes(member.id);

              return (
                <label
                  key={member.id}
                  className="hover:bg-bg-surface flex cursor-pointer items-center gap-3 px-3 py-2.5"
                >
                  <Checkbox
                    checked={checked}
                    onChange={() => toggleMember(member.id)}
                  />
                  <Avatar
                    alt={displayName}
                    fallback={displayName.slice(0, 1)}
                    size={32}
                    src={member.user.profile_image ?? undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="text-text-muted truncate text-xs">
                      {member.role_display}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
