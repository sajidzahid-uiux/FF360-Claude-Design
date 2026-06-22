import { useMemo } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";

import { API_ENDPOINTS } from "@/api/endpoints";
import type {
  PaginatedResponseAlt,
  RecordContact,
  RecordEquipment,
  RecordFarm,
  RecordJobStatus,
  RecordLeadStatus,
  RecordLeadType,
} from "@/api/types";
import type { JobLeadTypeSegment } from "@/constants";
import { EquipmentType, QUERY_KEYS, ResourceType } from "@/constants/enums";
import { useRouteIds } from "@/hooks/useRouteIds";
import axiosInstance from "@/lib/axios";

interface ContactsParams {
  resourceType?: ResourceType;
  jobType?: JobLeadTypeSegment;
  search?: string;
}

interface EquipmentParams {
  resourceType?: ResourceType;
  jobType?: JobLeadTypeSegment;
  search?: string;
  equipmentType?: EquipmentType;
  paginate?: boolean;
}

interface FarmsParams {
  resourceType?: ResourceType;
  jobType?: JobLeadTypeSegment;
  contactId?: number;
  search?: string;
}

interface JobStatusesParams {
  jobType?: string;
}

interface LeadStatusesParams {
  jobType?: string;
}

interface LeadTypesParams {
  jobType?: string;
}

export const useRecordContacts = (params: ContactsParams) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<RecordContact[] | PaginatedResponseAlt<RecordContact>>({
    queryKey: [QUERY_KEYS.RECORD_CONTACTS, organizationId, params],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization selected");

      const queryParams = new URLSearchParams();
      if (params.resourceType)
        queryParams.append("resource_type", params.resourceType);
      if (params.jobType) queryParams.append("job_type", params.jobType);
      if (params.search) queryParams.append("search", params.search);

      const response = await axiosInstance.get(
        `ms/organizations/${organizationId}/records/contacts/?${queryParams.toString()}`
      );

      return response.data;
    },
    enabled:
      !!organizationId &&
      (!!params.jobType || params.resourceType === ResourceType.LEAD),
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecordEquipment = (params: EquipmentParams) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<RecordEquipment[] | PaginatedResponseAlt<RecordEquipment>>({
    queryKey: ["recordEquipment", organizationId, params],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization selected");

      const queryParams = new URLSearchParams();
      if (params.resourceType)
        queryParams.append("resource_type", params.resourceType);
      if (params.jobType) queryParams.append("job_type", params.jobType);
      if (params.search) queryParams.append("search", params.search);
      if (params.equipmentType)
        queryParams.append("equipment_type", params.equipmentType);
      if (params.paginate !== undefined)
        queryParams.append("paginate", String(params.paginate));

      const response = await axiosInstance.get(
        `ms/organizations/${organizationId}/records/equipment/?${queryParams.toString()}`
      );

      return response.data;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecordFarms = (params: FarmsParams) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<RecordFarm[] | PaginatedResponseAlt<RecordFarm>>({
    queryKey: [QUERY_KEYS.RECORD_FARMS, organizationId, params],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization selected");
      return fetchRecordFarms(organizationId, params);
    },
    enabled:
      !!organizationId &&
      (!!params.jobType || params.resourceType === ResourceType.LEAD),
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecordJobStatuses = (params: JobStatusesParams = {}) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<RecordJobStatus[] | PaginatedResponseAlt<RecordJobStatus>>({
    queryKey: ["recordJobStatuses", organizationId, params],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization selected");

      const queryParams = new URLSearchParams();
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const response = await axiosInstance.get(
        `ms/organizations/${organizationId}/settings/job-statuses/?${queryParams.toString()}`
      );

      return response.data;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecordLeadStatuses = (params: LeadStatusesParams = {}) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<RecordLeadStatus[] | PaginatedResponseAlt<RecordLeadStatus>>({
    queryKey: ["recordLeadStatuses", organizationId, params],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization selected");

      const queryParams = new URLSearchParams();
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const response = await axiosInstance.get(
        API_ENDPOINTS.organizations.statuses.leadDetail(
          organizationId as string,
          queryParams.toString()
        )
      );

      return response.data;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useRecordLeadTypes = (params: LeadTypesParams = {}) => {
  const { orgId: organizationId } = useRouteIds();

  return useQuery<RecordLeadType[] | PaginatedResponseAlt<RecordLeadType>>({
    queryKey: ["recordLeadTypes", organizationId, params],
    queryFn: async () => {
      if (!organizationId) throw new Error("No organization selected");

      const queryParams = new URLSearchParams();
      if (params.jobType) queryParams.append("job_type", params.jobType);

      const response = await axiosInstance.get(
        API_ENDPOINTS.organizations.statuses.leadTypeDetail(
          organizationId as string,
          queryParams.toString()
        )
      );

      return response.data;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
  });
};

function fetchRecordFarms(
  organizationId: string,
  params: FarmsParams
): Promise<RecordFarm[] | PaginatedResponseAlt<RecordFarm>> {
  const queryParams = new URLSearchParams();
  if (params.resourceType)
    queryParams.append("resource_type", params.resourceType);
  if (params.jobType) queryParams.append("job_type", params.jobType);
  if (params.contactId)
    queryParams.append("contact_id", params.contactId.toString());
  if (params.search) queryParams.append("search", params.search);

  return axiosInstance
    .get(
      `ms/organizations/${organizationId}/records/farms/?${queryParams.toString()}`
    )
    .then((response) => response.data);
}

/** Farms for multiple contacts (parallel queries, merged and deduped by farm id). */
export const useRecordFarmsForContacts = (
  contactIds: number[],
  params: Omit<FarmsParams, "contactId"> = {}
) => {
  const { orgId: organizationId } = useRouteIds();
  const uniqueContactIds = useMemo(
    () => [...new Set(contactIds.filter((id) => id > 0))],
    [contactIds]
  );

  const queries = useQueries({
    queries: uniqueContactIds.map((contactId) => ({
      queryKey: [
        QUERY_KEYS.RECORD_FARMS,
        organizationId,
        { ...params, contactId },
      ],
      queryFn: () =>
        fetchRecordFarms(organizationId!, { ...params, contactId }),
      enabled:
        !!organizationId &&
        (!!params.jobType || params.resourceType === ResourceType.LEAD),
      staleTime: 2 * 60 * 1000,
    })),
  });

  const farms = useMemo(() => {
    const byId = new Map<number, RecordFarm>();
    for (const query of queries) {
      const data = query.data;
      if (!data) continue;
      const list = Array.isArray(data) ? data : data.results || [];
      for (const farm of list) {
        if (!byId.has(farm.id)) {
          byId.set(farm.id, farm);
        }
      }
    }
    return [...byId.values()];
  }, [queries]);

  return {
    farms,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
};

export const useJobRecords = (
  jobType: JobLeadTypeSegment,
  resourceType: ResourceType = ResourceType.JOB,
  options?: {
    contactId?: number;
    equipmentType?: EquipmentType;
    search?: string;
  }
) => {
  const contacts = useRecordContacts({
    resourceType,
    jobType,
    search: options?.search,
  });
  const equipment = useRecordEquipment({
    resourceType,
    jobType,
    equipmentType: options?.equipmentType,
    search: options?.search,
  });
  const farms = useRecordFarms({
    resourceType,
    jobType,
    contactId: options?.contactId,
    search: options?.search,
  });

  return {
    contacts,
    equipment,
    farms,
    isLoading: contacts.isLoading || equipment.isLoading || farms.isLoading,
    isError: contacts.isError || equipment.isError || farms.isError,
  };
};
