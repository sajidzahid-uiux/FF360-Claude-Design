"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { AppFormModal, Input } from "@fieldflow360/org-ui";

import { useTeamData } from "@/hooks";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

export interface AddGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (group: { name: string; members: string[] }) => void;
}

export default function AddGroupDialog({
  open,
  onOpenChange,
  onCreate,
}: AddGroupDialogProps) {
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { data: team = [] } = useTeamData();

  const handleToggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setName("");
    setSelectedMembers([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onCreate({ name, members: selectedMembers });
    resetForm();
    onOpenChange(false);
  };

  if (!open) {
    return null;
  }

  return (
    <AppFormModal
      showCancel
      isOpen={open}
      submitDisabled={selectedMembers.length < 2 || name.trim() === ""}
      submitLabel="Create Group"
      title="Add New Group"
      width={480}
      onClose={handleClose}
      onSubmit={handleSubmit}
    >
      <Input
        label="Group Name"
        placeholder="Group Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div>
        <p className="text-text-primary mb-2 text-sm font-medium">Members</p>
        <div className="border-border-subtle h-40 overflow-y-auto rounded border p-2">
          {filterActiveTeamMembers(team).map((member) => {
            const memberId = String(member.id);
            const inputId = `member-${member.id}`;
            return (
              <div key={member.id} className="mb-1 flex items-center gap-2">
                <input
                  checked={selectedMembers.includes(memberId)}
                  className="size-4"
                  id={inputId}
                  type="checkbox"
                  onChange={() => handleToggleMember(memberId)}
                />
                <label htmlFor={inputId}>
                  {member.user?.username ||
                    member.user?.email ||
                    member.user?.first_name ||
                    `Member #${member.id}`}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </AppFormModal>
  );
}
