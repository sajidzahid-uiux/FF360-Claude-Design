import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ApiError } from "@/api/client";
import { ContactsService } from "@/api/services";
import type {
  SubContactCreateAndLinkPayload,
  SubContactLinkArgs,
  SubContactUnlinkArgs,
} from "@/api/types";

import { invalidateSubContactQueriesForParent } from "../queries/invalidateSubContactQueries";
import { useRouteIds } from "../useRouteIds";

function subContactMutationErrorMessage(
  error: Error,
  fallback: string
): string {
  return error instanceof ApiError ? error.getUserMessage() : fallback;
}

export const useSubContactMutations = (parentContactId: number) => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  const invalidateSubContactQueries = useCallback(() => {
    if (!organizationId) return;
    invalidateSubContactQueriesForParent(
      queryClient,
      organizationId,
      parentContactId
    );
  }, [queryClient, organizationId, parentContactId]);

  const patchSubContacts = useCallback(
    async (subContactIds: number[]) => {
      if (!organizationId) throw new Error("Organization ID is required");
      const contact = await ContactsService.updateContact(
        organizationId,
        parentContactId,
        { sub_contacts: subContactIds }
      );
      invalidateSubContactQueries();
      return contact;
    },
    [organizationId, parentContactId, invalidateSubContactQueries]
  );

  const updateSubContacts = useMutation({
    mutationFn: patchSubContacts,
    onError: (error: Error) => {
      toast.error(
        subContactMutationErrorMessage(error, "Failed to update sub-contacts")
      );
    },
  });

  const link = useMutation({
    mutationFn: async ({
      contactId,
      currentSubContactIds,
    }: SubContactLinkArgs) => {
      if (currentSubContactIds.includes(contactId)) return;
      return patchSubContacts([...currentSubContactIds, contactId]);
    },
    onSuccess: () => {
      toast.success("Sub-contact linked successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to link sub-contact");
    },
  });

  const unlink = useMutation({
    mutationFn: async ({
      subContactId,
      currentSubContactIds,
    }: SubContactUnlinkArgs) => {
      return patchSubContacts(
        currentSubContactIds.filter((id: number) => id !== subContactId)
      );
    },
    onSuccess: () => {
      toast.success("Sub-contact unlinked successfully");
    },
    onError: (error: Error) => {
      toast.error(
        subContactMutationErrorMessage(error, "Failed to unlink sub-contact")
      );
    },
  });

  const createAndLink = useMutation({
    mutationFn: async (data: SubContactCreateAndLinkPayload) => {
      if (!organizationId) throw new Error("Organization ID is required");

      const result = await ContactsService.createAndLinkSubContact(
        organizationId,
        parentContactId,
        data
      );
      invalidateSubContactQueries();
      return result;
    },
    onSuccess: () => {
      toast.success("Sub-contact created and linked successfully");
    },
    onError: (error: Error) => {
      toast.error(
        subContactMutationErrorMessage(error, "Failed to create sub-contact")
      );
    },
  });

  return { updateSubContacts, link, unlink, createAndLink };
};
