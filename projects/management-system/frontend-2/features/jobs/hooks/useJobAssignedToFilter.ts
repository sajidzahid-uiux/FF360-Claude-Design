"use client";

import { useEffect, useMemo, useRef } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import type { JobListAssignedFilterPreferenceResponse } from "@/api/types";
import type { TeamMember } from "@/api/types/team";
import { CACHE_TIME, QUERY_KEYS } from "@/constants";
import {
  useJobAssignedToFilterActions,
  useJobAssignedToFilterStore,
} from "@/features/jobs/model/job-assigned-to-filter-store";
import { useIsAdmin } from "@/hooks/queries";
import { useRouteIds } from "@/hooks/useRouteIds";
import useTeamData from "@/hooks/useTeamData";
import axiosInstance from "@/lib/axios";
import { isTeamMemberRemoved } from "@/utils/team/assignmentOrder";

function preferenceToAssignedParam(
  pref: JobListAssignedFilterPreferenceResponse
): string {
  if (!pref.has_saved_preference || pref.assigned_to === "all") {
    return "all";
  }
  if (pref.assigned_to === "me") {
    return "me";
  }
  if (pref.filter_member_id != null) {
    return String(pref.filter_member_id);
  }
  return "all";
}

export function useJobAssignedToFilterSync() {
  const { orgId } = useRouteIds();
  const queryClient = useQueryClient();
  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setOrgId, setAssignedTo, setHydrated, setIsPersisting, resetForOrg } =
    useJobAssignedToFilterActions();

  const assignedTo = useJobAssignedToFilterStore((state) => state.assignedTo);
  const hydrated = useJobAssignedToFilterStore((state) => state.hydrated);

  const { data: pref, isSuccess: preferenceLoaded } = useQuery({
    queryKey: ["jobAssignedFilterPreference", orgId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        | JobListAssignedFilterPreferenceResponse
        | { data: JobListAssignedFilterPreferenceResponse }
      >(`ms/organizations/${orgId}/job-list-assigned-filter-preference/`);
      const body = data as { data?: JobListAssignedFilterPreferenceResponse };
      return (body?.data ?? data) as JobListAssignedFilterPreferenceResponse;
    },
    enabled: !!orgId,
    staleTime: CACHE_TIME.STALE,
  });

  const { data: team } = useTeamData();

  useEffect(() => {
    resetForOrg(orgId ?? null);
  }, [orgId, resetForOrg]);

  useEffect(() => {
    setOrgId(orgId ?? null);
  }, [orgId, setOrgId]);

  useEffect(() => {
    if (!preferenceLoaded || !pref) return;
    if (hydrated) return;
    setAssignedTo(preferenceToAssignedParam(pref));
    setHydrated(true);
  }, [preferenceLoaded, pref, hydrated, setAssignedTo, setHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!assignedTo || assignedTo === "all" || assignedTo === "me") return;
    if (!team || team.length === 0) return;
    const memberId = Number(assignedTo);
    if (Number.isNaN(memberId)) return;
    const memberAvailable = team.some(
      (member: TeamMember) =>
        member.id === memberId && !isTeamMemberRemoved(member)
    );
    if (!memberAvailable) {
      setAssignedTo("all");
    }
  }, [hydrated, assignedTo, team, setAssignedTo]);

  useEffect(() => {
    return () => {
      if (persistTimeoutRef.current !== null) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, []);

  const persistMutation = useMutation({
    mutationFn: async (assigned_to: string) => {
      await axiosInstance.get(
        `ms/organizations/${orgId}/jobs/all/?page=1&page_size=1&assigned_to=${encodeURIComponent(assigned_to)}&persist_save=true`
      );
    },
    onMutate: () => {
      setIsPersisting(true);
    },
    onSettled: () => {
      setIsPersisting(false);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["jobAssignedFilterPreference", orgId],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_JOBS] });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAP] });
      await queryClient.invalidateQueries({ queryKey: ["mapDataV2"] });
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.JOB_HISTORY],
      });
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB] });
    },
    onError: () => {
      toast.error("Could not save job filter preference.");
    },
  });

  useEffect(() => {
    if (!orgId) return;
    if (!hydrated) return;
    if (assignedTo === null) return;

    if (pref && preferenceToAssignedParam(pref) === assignedTo) {
      if (persistTimeoutRef.current !== null) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
      return;
    }

    if (persistTimeoutRef.current !== null) {
      clearTimeout(persistTimeoutRef.current);
    }

    persistTimeoutRef.current = setTimeout(() => {
      persistMutation.mutate(assignedTo);
    }, 300);

    return () => {
      if (persistTimeoutRef.current !== null) {
        clearTimeout(persistTimeoutRef.current);
        persistTimeoutRef.current = null;
      }
    };
  }, [orgId, hydrated, assignedTo, persistMutation, pref]);
}

export function useJobAssignedToFilter() {
  const isAdmin = useIsAdmin();
  const { data: team } = useTeamData();
  const { assignedTo, hydrated, isPersisting } = useJobAssignedToFilterStore(
    useShallow((state) => ({
      assignedTo: state.assignedTo,
      hydrated: state.hydrated,
      isPersisting: state.isPersisting,
    }))
  );
  const setAssignedTo = useJobAssignedToFilterStore(
    (state) => state.setAssignedTo
  );

  const memberOptions = useMemo(() => {
    if (!team) return [];
    return team
      .filter((member: TeamMember) => !isTeamMemberRemoved(member))
      .map((member: TeamMember) => ({
        id: member.id,
        label:
          member.user?.username || member.user?.email || `Member ${member.id}`,
      }));
  }, [team]);

  return {
    assignedTo,
    setAssignedTo: (value: string) => {
      setAssignedTo(value);
    },
    isPreferenceReady: hydrated && assignedTo !== null,
    isAdmin: Boolean(isAdmin),
    memberOptions,
    filterActive: assignedTo !== null && assignedTo !== "all",
    isPersisting,
  };
}
