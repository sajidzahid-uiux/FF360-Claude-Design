import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ContactsService } from "@/api/services";
import type { ContactCreatePayload, ContactUpdatePayload } from "@/api/types";
import type { IdNumberUpdatePayload } from "@/api/types/common";
import { QUERY_KEYS } from "@/constants/enums";
import { bulkDeleteSuccessMessage } from "@/shared/lib";
import { getErrorMessage, getSimpleErrorMessage } from "@/utils/apiError";

import { invalidateContactActivityLogs } from "../queries/invalidateActivityLogs";
import { invalidateAllSubContactQueries } from "../queries/invalidateSubContactQueries";
import { useRouteIds } from "../useRouteIds";

export const useContactMutations = () => {
  const queryClient = useQueryClient();
  const { orgId: organizationId } = useRouteIds();

  // Invalidate all contact-related queries
  const invalidateContactQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACTS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTACT] });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CONTACT_CATEGORIES],
    });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOBS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEADS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAD] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOB_HISTORY] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_JOBS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MAP] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FOOTAGE] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECORD_CONTACTS] });
    invalidateAllSubContactQueries(queryClient);
  }, [queryClient]);

  const create = useMutation({
    mutationFn: (data: ContactCreatePayload) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.createContact(organizationId, data);
    },
    onSuccess: (data) => {
      invalidateContactQueries();
      invalidateContactActivityLogs(queryClient, organizationId, data.id);
      toast.success("Contact created successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create contact"));
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: IdNumberUpdatePayload<ContactUpdatePayload>) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.updateContact(organizationId, id, data);
    },
    onSuccess: (_, variables) => {
      invalidateContactQueries();
      invalidateContactActivityLogs(queryClient, organizationId, variables.id);
      toast.success("Contact updated successfully");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update contact"));
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => {
      if (!organizationId) throw new Error("Organization ID is required");
      return ContactsService.deleteContact(organizationId, id);
    },
    onSuccess: (_data, id) => {
      invalidateContactQueries();
      invalidateContactActivityLogs(queryClient, organizationId, id);
      toast.success("Contact deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(getSimpleErrorMessage(error) || "Failed to delete contact");
    },
  });

  const bulkDelete = useMutation({
    mutationFn: async (contactIds: number[]) => {
      if (!organizationId) throw new Error("Organization ID is required");
      if (contactIds.length === 0) throw new Error("No contacts selected");

      await Promise.all(
        contactIds.map((id) =>
          ContactsService.deleteContact(organizationId, id)
        )
      );
      return contactIds;
    },
    onSuccess: (deletedIds) => {
      invalidateContactQueries();
      for (const id of deletedIds) {
        invalidateContactActivityLogs(queryClient, organizationId, id);
      }
      toast.success(
        bulkDeleteSuccessMessage(deletedIds.length, "contact", "contacts", {
          pastTense: "deleted successfully",
        })
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getSimpleErrorMessage(error) || "Failed to delete selected contacts"
      );
    },
  });

  return {
    create,
    update,
    remove,
    bulkDelete,
    createContact: create,
    updateContact: update,
    patchContact: update,
    deleteContact: remove,
    deleteSelectedContacts: bulkDelete,
  };
};
