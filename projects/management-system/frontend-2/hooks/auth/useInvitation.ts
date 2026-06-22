"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { usePersistentStorage } from "@/hooks/lib/usePersistentStorage";
import useTeamData from "@/hooks/team/useTeamData";

export function useInvitation() {
  const searchParams = useSearchParams();
  const { acceptInvitation } = useTeamData();
  const storage = usePersistentStorage();
  const [hasInvitation, setHasInvitation] = useState(false);

  const readHasInvitation = useCallback(() => {
    return !!storage.getItem("invitationToken");
  }, [storage]);

  useEffect(() => {
    const rawToken = searchParams.get("token");
    const token = rawToken?.replace(/\/$/, "");
    if (token) {
      storage.setItem("invitationToken", token);
    }
    setHasInvitation(readHasInvitation());
  }, [searchParams, storage, readHasInvitation]);

  const handleInvitation = async () => {
    const rawToken = storage.getItem("invitationToken");
    const token = rawToken?.replace(/\/$/, "");
    if (token) {
      try {
        await acceptInvitation.mutateAsync(token);
        storage.removeItem("invitationToken");
        setHasInvitation(false);
        return true;
      } catch (error) {
        console.error("Failed to accept invitation:", error);
        storage.removeItem("invitationToken");
        setHasInvitation(false);
        return false;
      }
    }
    return false;
  };

  return {
    handleInvitation,
    hasInvitation,
  };
}
