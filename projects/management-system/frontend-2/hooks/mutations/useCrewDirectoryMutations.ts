import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CrewService } from "@/api/services";
import type { MemberIdGroupUpdateArgs } from "@/api/types";
import { getErrorMessage } from "@/utils/apiError";

import { useRouteIds } from "../useRouteIds";

export const useCrewDirectoryMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const addMemberToGroup = useMutation({
    mutationFn: async ({ memberId, data }: MemberIdGroupUpdateArgs) => {
      if (!organizationId) {
        throw new Error("Organization ID is required");
      }
      return CrewService.addMemberToGroup(organizationId, memberId, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["crew-directory"] });
      queryClient.invalidateQueries({ queryKey: ["crew-member"] });
      queryClient.invalidateQueries({ queryKey: ["crew-groups"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add member to group"));
    },
  });

  return {
    addMemberToGroup,
  };
};
