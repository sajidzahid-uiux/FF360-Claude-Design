import { EquipmentType, JobType, LeadType } from "@/constants/enums";
import type { MapFileType } from "@/shared/lib/mapFilesV2";

// Re-export enums for convenience
export { EquipmentType, JobType, LeadType };

const BASE_MS_URL = "ms/organizations/";
const MS_BASE = "ms/";

const MAP_FILE_DELETE_SEGMENTS: Record<
  MapFileType,
  { legacy: string; v2: string }
> = {
  xml: { legacy: "delete_xml_file/", v2: "delete_xml_file_v2/" },
  shp: { legacy: "delete_shp_file/", v2: "delete_shp_file_v2/" },
  kml: { legacy: "delete_kml_file/", v2: "delete_kml_file_v2/" },
};

function buildMapFileDeleteEndpoint(
  basePath: string,
  fileType: MapFileType,
  mapId?: number | string
): string {
  const segment =
    mapId != null
      ? MAP_FILE_DELETE_SEGMENTS[fileType].v2
      : MAP_FILE_DELETE_SEGMENTS[fileType].legacy;
  const endpoint = `${basePath}${segment}`;
  return mapId != null ? `${endpoint}?map_id=${mapId}` : endpoint;
}

export const API_ENDPOINTS = {
  // ============================================
  // AUTH ENDPOINTS
  // ============================================
  auth: {
    users: "auth/users/",
    user: (id: string | number) => `auth/users/${id}/`,
    webActivity: "auth/users/web-activity/",
    updatePassword: "auth/users/update/",
    changePassword: "auth/users/change-password/",
    loginActivity: "auth/users/login-activity/",
    devices: "auth/users/devices/",
    login: "auth/jwt/create/",
    refresh: "auth/jwt/refresh/",
    verify: "auth/jwt/verify/",
  },
  // ============================================
  // ORGANIZATION ENDPOINTS
  // ============================================
  organizations: {
    list: BASE_MS_URL,
    detail: (orgId: string) => `${BASE_MS_URL}${orgId}/`,
    members: (orgId: string) => `${BASE_MS_URL}${orgId}/members/`,
    seatUsage: (orgId: string) => `${BASE_MS_URL}${orgId}/seat-usage/`,
    settings: (orgId: string) => `${BASE_MS_URL}${orgId}/settings/`,
    pinCategories: (orgId: string) => `${BASE_MS_URL}${orgId}/pin-categories/`,
    pinCategoryDetail: (orgId: string, id: number | string) =>
      `${BASE_MS_URL}${orgId}/pin-categories/${id}/`,
    settingsPinCategories: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/settings/pin-categories/`,
    settingsPinCategoryDetail: (orgId: string, id: number | string) =>
      `${BASE_MS_URL}${orgId}/settings/pin-categories/${id}/`,
    paymentStatuses: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/payment-statuses/`,
    /** Battery type catalog for equipment battery replacement */
    batteryTypes: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/battery-types/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/battery-types/${id}/`,
    },
    /** Job labor time entries (installed hours / on-site tracking) */
    jobTimeEntries: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/job-time-entries/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/job-time-entries/${id}/`,
    },
    /** GET activity logs — filter by module, entity_id, event_key, actor_member_id, pagination */
    activityLogs: (orgId: string) => `${BASE_MS_URL}${orgId}/activity-logs/`,
    /** Generic comments (jobs, leads, equipment) — content_type + object_id */
    comments: (orgId: string) => `${BASE_MS_URL}${orgId}/comments/`,
    commentDetail: (orgId: string, commentId: number | string) =>
      `${BASE_MS_URL}${orgId}/comments/${commentId}/`,
    commentsExportPdf: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/comments/export_pdf/`,
    /** Generic file attachments — POST uses content_type + object_id */
    files: (orgId: string) => `${BASE_MS_URL}${orgId}/files/`,
    fileDetail: (orgId: string, fileId: number | string) =>
      `${BASE_MS_URL}${orgId}/files/${fileId}/`,
    filesForJobs: (orgId: string) => `${BASE_MS_URL}${orgId}/files/jobs/`,
    filesForLeads: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/files/drainageLeads/`,
    // ----------------------------------------
    // JOBS
    // ----------------------------------------
    jobs: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/jobs/all/`,
      listByType: (orgId: string, type: JobType) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/`,
      create: (orgId: string, type: JobType) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/`,
      detail: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/`,
      archive: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/archive/`,
      unarchive: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/unarchive/`,
      trash: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/trash/`,
      createInvoice: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/create_invoice/`,
      orderPipes: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/drainage_tiling/${id}/order_pipes/`,
      deleteMapFile: (
        orgId: string,
        type: JobType,
        id: number | string,
        fileType: MapFileType,
        mapId?: number | string
      ) =>
        buildMapFileDeleteEndpoint(
          `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/`,
          fileType,
          mapId
        ),
      permanentDelete: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/permanent_delete/`,
      restore: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/restore/`,
      completedCancelled: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/jobs/completed-cancelled/`,
      financial: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/financial/`,
      financialDetail: (
        orgId: string,
        type: JobType,
        jobId: number | string,
        financialId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${jobId}/financial/${financialId}/`,
      financialMachines: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/financial-machines/`,
      financialMachineDetail: (
        orgId: string,
        type: JobType,
        jobId: number | string,
        assignmentId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${jobId}/financial-machines/${assignmentId}/`,
      corePoints: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/drainage_tiling/${id}/cores/`,
      corePointDetail: (
        orgId: string,
        jobId: number | string,
        coreId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/jobs/drainage_tiling/${jobId}/cores/${coreId}/`,
      files: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/files/`,
      fileDetail: (
        orgId: string,
        type: JobType,
        jobId: number | string,
        fileId: number | string
      ) => `${BASE_MS_URL}${orgId}/jobs/${type}/${jobId}/files/${fileId}/`,
      comments: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/comments/`,
      commentDetail: (
        orgId: string,
        type: JobType,
        jobId: number | string,
        commentId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${jobId}/comments/${commentId}/`,
      estimate: (orgId: string, type: JobType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${type}/${id}/estimate/`,
      pins: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/pins/`,
      pinDetail: (
        orgId: string,
        jobId: number | string,
        pinId: number | string
      ) => `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/pins/${pinId}/`,
      equipmentHoursBreakdown: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/${jobId}/equipment-hours-breakdown/`,
    },
    // ----------------------------------------
    // LEADS
    // ----------------------------------------
    leads: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/leads/all/`,
      listByType: (orgId: string, type: LeadType) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/`,
      create: (orgId: string, type: LeadType) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/`,
      detail: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/`,
      archive: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/archive/`,
      unarchive: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/unarchive/`,
      trash: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/trash/`,
      deleteMapFile: (
        orgId: string,
        type: LeadType,
        id: number | string,
        fileType: MapFileType,
        mapId?: number | string
      ) =>
        buildMapFileDeleteEndpoint(
          `${BASE_MS_URL}${orgId}/leads/${type}/${id}/`,
          fileType,
          mapId
        ),
      convertToJob: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/convert_to_job/`,
      permanentDelete: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/permanent_delete/`,
      restore: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/restore/`,
      corePoints: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/drainage_tiling/${id}/cores/`,
      corePointDetail: (
        orgId: string,
        leadId: number | string,
        coreId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/leads/drainage_tiling/${leadId}/cores/${coreId}/`,
      files: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/files/`,
      fileDetail: (
        orgId: string,
        type: LeadType,
        leadId: number | string,
        fileId: number | string
      ) => `${BASE_MS_URL}${orgId}/leads/${type}/${leadId}/files/${fileId}/`,
      comments: (orgId: string, type: LeadType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${id}/comments/`,
      commentDetail: (
        orgId: string,
        type: LeadType,
        leadId: number | string,
        commentId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/leads/${type}/${leadId}/comments/${commentId}/`,
      pins: (orgId: string, leadId: number | string) =>
        `${BASE_MS_URL}${orgId}/leads/all/${leadId}/pins/`,
      pinDetail: (
        orgId: string,
        leadId: number | string,
        pinId: number | string
      ) => `${BASE_MS_URL}${orgId}/leads/all/${leadId}/pins/${pinId}/`,
    },
    // ----------------------------------------
    // EQUIPMENT V2
    // ----------------------------------------
    equipment: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/equipment/all/`,
      listByType: (orgId: string, type: EquipmentType) =>
        `${BASE_MS_URL}${orgId}/equipment-v2/${type}/`,
      create: (orgId: string, type: EquipmentType) =>
        `${BASE_MS_URL}${orgId}/equipment-v2/${type}/`,
      detail: (orgId: string, type: EquipmentType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/equipment-v2/${type}/${id}/`,
      uploadImage: (orgId: string, type: EquipmentType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/equipment-v2/${type}/${id}/upload-image/`,
      putToTrash: (orgId: string, type: EquipmentType, id: number | string) =>
        `${BASE_MS_URL}${orgId}/equipment-v2/${type}/${id}/trash/`,
      restoreFromTrash: (
        orgId: string,
        type: EquipmentType,
        id: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/equipment-v2/${type}/${id}/restore/?trashed=true`,
      // Legacy equipment endpoints
      legacy: {
        machines: (orgId: string) =>
          `${BASE_MS_URL}${orgId}/equipment/machines/`,
        vehicles: (orgId: string) =>
          `${BASE_MS_URL}${orgId}/equipment/vehicles/`,
        trailers: (orgId: string) =>
          `${BASE_MS_URL}${orgId}/equipment/trailers/`,
      },
      battery: {
        byId: (
          orgId: string,
          equipmentType: EquipmentType,
          id: number | string
        ) =>
          `${BASE_MS_URL}${orgId}/equipment-v2/${equipmentType}/${id}/battery-replacement/`,
        replaceById: (
          orgId: string,
          equipmentType: EquipmentType,
          id: number | string,
          replacementId: number | string
        ) =>
          `${BASE_MS_URL}${orgId}/equipment-v2/${equipmentType}/${id}/battery-replacement/${replacementId}/`,
      },
    },
    // ----------------------------------------
    // CONTACTS V2
    // ----------------------------------------
    contacts: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/contacts-v2/`,
      create: (orgId: string) => `${BASE_MS_URL}${orgId}/contacts-v2/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/contacts-v2/${id}/`,
      categories: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/contact-categories/`,
      categoryDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/contact-categories/${id}/`,
      jobHistory: (orgId: string, contactId: number | string) =>
        `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/job-history/`,
      subContacts: {
        list: (orgId: string, contactId: number | string) =>
          `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/sub-contacts/`,
        link: (orgId: string, contactId: number | string) =>
          `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/sub-contacts/`,
        unlink: (
          orgId: string,
          contactId: number | string,
          subContactId: number | string
        ) =>
          `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/sub-contacts/${subContactId}/`,
        createAndLink: (orgId: string, contactId: number | string) =>
          `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/sub-contacts/create_and_link/`,
      },
    },
    // ----------------------------------------
    // FARMS
    // ----------------------------------------
    farms: {
      list: (orgId: string, contactId: number | string) =>
        `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/farms/`,
      create: (orgId: string, contactId: number | string) =>
        `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/farms/`,
      detail: (
        orgId: string,
        contactId: number | string,
        farmId: number | string
      ) => `${BASE_MS_URL}${orgId}/contacts-v2/${contactId}/farms/${farmId}/`,
    },
    // ----------------------------------------
    // TEAM / MEMBERS
    // ----------------------------------------
    team: {
      members: (orgId: string) => `${BASE_MS_URL}${orgId}/team_members/`,
      memberDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/team_members/${id}/`,
      sendInvitation: (orgId: string) => `${BASE_MS_URL}${orgId}/invitation/`,
      onlineMembers: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/online-members/`,
    },
    // ----------------------------------------
    // CREW
    // ----------------------------------------
    crew: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/crew/`,
      create: (orgId: string) => `${BASE_MS_URL}${orgId}/crew/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew/${id}/`,
      groups: (orgId: string) => `${BASE_MS_URL}${orgId}/crew-groups/`,
      groupsList: (orgId: string) => `${BASE_MS_URL}${orgId}/crew-groups-list/`,
      groupDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/`,
      groupDeactivate: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/deactivate/`,
      groupReactivate: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/reactivate/`,
      groupAddMembers: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/add_members/`,
      groupDeactivateMembers: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/deactivate_members/`,
      groupReactivateMembers: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/reactivate_members/`,
      groupAvailableMembers: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-groups/${id}/available_members/`,
      directory: (orgId: string) => `${BASE_MS_URL}${orgId}/crew-directory/`,
      directoryMember: (orgId: string, memberId: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-directory/${memberId}/`,
      directoryAddToGroup: (orgId: string, memberId: number | string) =>
        `${BASE_MS_URL}${orgId}/crew-directory/${memberId}/add_to_group/`,
      jobAssignments: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/`,
      jobAvailableCrewGroups: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/available_crew_groups/`,
      jobAvailableIndividuals: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/available_individuals/`,
      jobTeamList: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/job_team_list/`,
      jobAssignCrewGroup: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/assign_crew_group/`,
      jobAssignIndividual: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/assign_individual/`,
      jobDeactivateAssignment: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/deactivate_assignment/`,
      jobReactivateAssignment: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/jobs/all/${jobId}/crew-assignments/reactivate_assignment/`,
    },
    // ----------------------------------------
    // MAP
    // ----------------------------------------
    map: {
      allJobsLeads: (orgId: string) => `${BASE_MS_URL}${orgId}/all-jobs-leads/`,
      mapData: (orgId: string) => `${BASE_MS_URL}${orgId}/map-data/`,
      legends: (orgId: string) => `${BASE_MS_URL}${orgId}/map-legends/`,
      legendDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/map-legends/${id}/`,
    },
    // ----------------------------------------
    // INVOICES
    // ----------------------------------------
    invoices: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/invoices/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/invoices/${id}/`,
      jobActiveInvoices: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/invoices/jobs_active_invoices/`,
    },
    // ----------------------------------------
    // STATUSES (Legacy - used by leads, jobs, map pages)
    // ----------------------------------------
    statuses: {
      jobs: (orgId: string) => `${BASE_MS_URL}${orgId}/statuses/`,
      jobDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/statuses/${id}/`,
      leads: (orgId: string) => `${BASE_MS_URL}${orgId}/lead_statuses/`,
      leadDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/lead_statuses/${id}/`,
      leadTypes: (orgId: string) => `${BASE_MS_URL}${orgId}/leadTypes/`,
      leadTypeDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/leadTypes/${id}/`,
    },
    // ----------------------------------------
    // SETTINGS STATUSES (New - used only by settings page)
    // ----------------------------------------
    projectTypes: (orgId: string) => `${BASE_MS_URL}${orgId}/project-types/`,
    projectTypeDetail: (orgId: string, id: number | string) =>
      `${BASE_MS_URL}${orgId}/project-types/${id}/`,
    settingsStatuses: {
      jobs: (orgId: string) => `${BASE_MS_URL}${orgId}/settings/job-statuses/`,
      jobDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/settings/job-statuses/${id}/`,
      leads: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/settings/lead_statuses/`,
      leadDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/settings/lead_statuses/${id}/`,
      leadTypes: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/settings/leadTypes/`,
      leadTypeDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/settings/leadTypes/${id}/`,
      paymentStatuses: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/settings/payment-statuses/`,
      paymentStatusDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/settings/payment-statuses/${id}/`,
      projectTypes: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/settings/project-types/`,
      projectTypeDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/settings/project-types/${id}/`,
    },
    // ----------------------------------------
    // TIME TRACKING
    // ----------------------------------------
    timeTracking: {
      entries: (orgId: string) => `${BASE_MS_URL}${orgId}/time-entries/`,
      entryDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/time-entries/${id}/`,
    },
    // ----------------------------------------
    // FOOTAGE PAGE
    // ----------------------------------------
    footagePage: {
      /** GET all jobs footage summary; accepts ?include_archived, ?year, ?month, ?crew, ?sort_order */
      allJobs: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/footage-page/all_jobs/`,
      /** GET organisation-wide footage totals */
      all: (orgId: string) => `${BASE_MS_URL}${orgId}/footage-page/all/`,
      /** GET detailed footage stats for a single job */
      job: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/footage-page/${jobId}/`,
      /** Generic comments (footage-page uses content-type-based comments) */
      comments: (orgId: string) => `${BASE_MS_URL}${orgId}/comments/`,
      commentsGet: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/comments/get_comments/`,
      commentDetail: (orgId: string, commentId: number | string) =>
        `${BASE_MS_URL}${orgId}/comments/${commentId}/`,
    },
    // ----------------------------------------
    // DAILY PROGRESS
    // ----------------------------------------
    dailyProgress: {
      main: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/daily-progress/${jobId}/main/`,
      lateral: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/daily-progress/${jobId}/lateral/`,
      raisers: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/daily-progress/${jobId}/raisers/`,
      excel: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/daily-progress/${jobId}/excel/`,
      /** Unified installed footage logs (main / lateral / raisers) */
      logs: (orgId: string, jobId: number | string) =>
        `${BASE_MS_URL}${orgId}/daily-progress/${jobId}/logs/`,
      logDetail: (
        orgId: string,
        jobId: number | string,
        logType: string,
        id: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/daily-progress/${jobId}/logs/${logType}:${id}/`,
    },
    // ----------------------------------------
    // STATE DATA (One Call)
    // ----------------------------------------
    stateData: {
      sites: (orgId: string, jobType: string) =>
        `${BASE_MS_URL}${orgId}/${jobType}/state_sites/`,
    },
    // ----------------------------------------
    // ROLES & PERMISSIONS
    // ----------------------------------------
    roles: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/roles/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/roles/${id}/`,
    },
    permissions: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/permissions/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/permissions/${id}/`,
      myPermissions: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/my-permissions/`,
    },
    notificationSettings: {
      important: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/notification-settings/important/`,
      fyi: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/notification-settings/fyi/`,
    },
    newNotifications: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/new-notifications/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/new-notifications/${id}/`,
      markAllRead: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/new-notifications/mark-all-read/`,
      deleteAll: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/new-notifications/delete-all/`,
    },
    // ----------------------------------------
    // SCHEDULING / CALENDAR
    // ----------------------------------------
    scheduling: {
      statistics: (orgId: string) =>
        `${BASE_MS_URL}${orgId}/scheduling/statistics/`,
      items: (orgId: string) => `${BASE_MS_URL}${orgId}/scheduling/items/`,
      itemDetail: (orgId: string, itemId: number | string) =>
        `${BASE_MS_URL}${orgId}/scheduling/items/${itemId}/`,
    },
    // ----------------------------------------
    // TASKS
    // ----------------------------------------
    tasks: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/tasks/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/tasks/${id}/`,
    },
    // TASK STATUSES
    taskStatuses: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/task-statuses/`,
    },
    // ----------------------------------------
    // TASK TYPES
    // ----------------------------------------
    taskTypes: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/task-types/`,
      detail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/task-types/${id}/`,
    },
    // ----------------------------------------
    // VENDORS
    // ----------------------------------------
    vendors: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/vendors/`,
      favorites: (orgId: string) => `${BASE_MS_URL}${orgId}/vendor-favorites/`,
      favoriteDetail: (orgId: string, id: number | string) =>
        `${BASE_MS_URL}${orgId}/vendor-favorites/${id}/`,
    },
    // ----------------------------------------
    // VENDOR FORMS V2
    // ----------------------------------------
    vendorFormsV2: {
      list: (orgId: string) => `${BASE_MS_URL}${orgId}/vendor_forms-v2/`,
      create: (orgId: string) => `${BASE_MS_URL}${orgId}/vendor_forms-v2/`,
      detail: (orgId: string, vendorFormId: number | string) =>
        `${BASE_MS_URL}${orgId}/vendor_forms-v2/${vendorFormId}/`,
      pipeDropPayload: (orgId: string, vendorFormId: number | string) =>
        `${BASE_MS_URL}${orgId}/vendor_forms-v2/${vendorFormId}/pipe_drop_payload/`,
      canProceed: (orgId: string, vendorFormId: number | string) =>
        `${BASE_MS_URL}${orgId}/vendor_forms-v2/${vendorFormId}/can_proceed/`,
      deliveryLocations: (orgId: string, vendorFormId: number | string) =>
        `${BASE_MS_URL}${orgId}/vendor_forms-v2/${vendorFormId}/delivery_locations/`,
      deliveryLocationDetail: (
        orgId: string,
        vendorFormId: number | string,
        locationId: number | string
      ) =>
        `${BASE_MS_URL}${orgId}/vendor_forms-v2/${vendorFormId}/delivery_locations/${locationId}/`,
      generateInvoice: (orgId: string, vendorFormId: number | string) =>
        `${BASE_MS_URL}${orgId}/vendor_forms-v2/${vendorFormId}/generate_invoice/`,
    },
  },
  // ----------------------------------------
  // ORDER PIPE (categories for order details)
  // ----------------------------------------
  orderPipe: {
    categories: () => `${MS_BASE}order-pipe-categories/`,
  },
  // ----------------------------------------
  // CHAT / MESSAGING
  // ----------------------------------------
  chat: {
    groupMessages: (
      orgId: string | number,
      groupId: number | string,
      page = 1
    ) => `chat/${orgId}/groupmessages/?group_id=${groupId}&page=${page}`,
  },
  // ----------------------------------------
  // QUICK ACTIONS
  // ----------------------------------------
  quickActions: {
    list: (orgId: string) => `${BASE_MS_URL}${orgId}/quick-actions/`,
    detail: (orgId: string, id: number | string) =>
      `${BASE_MS_URL}${orgId}/quick-actions/${id}/`,
    fileUpload: (orgId: string) => `${BASE_MS_URL}${orgId}/files/`,
    fileDetail: (orgId: string, fileId: number | string) =>
      `${BASE_MS_URL}${orgId}/files/${fileId}/`,
    convertToContactLookup: (orgId: string, quickActionId: number | string) =>
      `${BASE_MS_URL}${orgId}/quick-actions/${quickActionId}/convert-to-contact/lookup/`,
    convertToContact: (orgId: string, quickActionId: number | string) =>
      `${BASE_MS_URL}${orgId}/quick-actions/${quickActionId}/convert-to-contact/`,
    convertToLead: (orgId: string, quickActionId: number | string) =>
      `${BASE_MS_URL}${orgId}/quick-actions/${quickActionId}/convert-to-lead/`,
    convertToJob: (orgId: string, quickActionId: number | string) =>
      `${BASE_MS_URL}${orgId}/quick-actions/${quickActionId}/convert-to-job/`,
  },
  // ----------------------------------------
  // FIELDLOW360 / TD INTEGRATION
  // ----------------------------------------
  tdIntegration: {
    designParameters: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/design-parameters/`,
    designRequestStatuses: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/design-requests/statuses/`,
    designRequests: (orgId: string) =>
      `${BASE_MS_URL}${orgId}/design-requests/`,
    designRequestNotes: (orgId: string, requestId: number | string) =>
      `${BASE_MS_URL}${orgId}/design-requests/${requestId}/notes/`,
    designRequestNoteDetail: (
      orgId: string,
      requestId: number | string,
      noteId: number | string
    ) => `${BASE_MS_URL}${orgId}/design-requests/${requestId}/notes/${noteId}/`,
    designRequestSharedOutput: (orgId: string, requestId: number | string) =>
      `${BASE_MS_URL}${orgId}/design-requests/${requestId}/shared-output/`,
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
