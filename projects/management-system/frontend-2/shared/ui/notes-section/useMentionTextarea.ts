"use client";

import { useCallback, useState } from "react";

import type { TeamMember } from "@/api/types";
import { isTeamMemberRemoved } from "@/utils/team/assignmentOrder";

export function useMentionTextarea(members: TeamMember[] | undefined) {
  const [mentioning, setMentioning] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<TeamMember[]>(
    []
  );
  const [selectedMentionIds, setSelectedMentionIds] = useState<number[]>([]);

  const resetMentions = useCallback(() => {
    setMentioning(false);
    setMentionSuggestions([]);
    setSelectedMentionIds([]);
  }, []);

  const handleTextChange = useCallback(
    (value: string, cursorIndex: number) => {
      const textUntilCursor = value.slice(0, cursorIndex);
      const match = textUntilCursor.match(/@(\w*)$/);

      if (match && members) {
        const query = match[1].toLowerCase();
        const filtered = members.filter(
          (m) =>
            !isTeamMemberRemoved(m) &&
            m.user.username.toLowerCase().includes(query)
        );
        setMentionSuggestions(filtered);
        setMentioning(true);
      } else {
        setMentioning(false);
        setMentionSuggestions([]);
      }
    },
    [members]
  );

  const applyMention = useCallback(
    (currentText: string, username: string, memberId: number) => {
      const lastAt = currentText.lastIndexOf("@");
      const newText = currentText.slice(0, lastAt) + `@${username} `;
      setSelectedMentionIds((prev) =>
        prev.includes(memberId) ? prev : [...prev, memberId]
      );
      setMentioning(false);
      setMentionSuggestions([]);
      return newText;
    },
    []
  );

  return {
    mentioning,
    mentionSuggestions,
    selectedMentionIds,
    setSelectedMentionIds,
    resetMentions,
    handleTextChange,
    applyMention,
  };
}
