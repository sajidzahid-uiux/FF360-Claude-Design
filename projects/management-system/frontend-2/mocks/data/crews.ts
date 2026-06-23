import type { MockRoute } from "./types";

/**
 * CREW MANAGEMENT module — "Sajid & Sons Contractors" (org id 1).
 *
 * Endpoints (normalized URLs the mock matches; query string dropped):
 *  - Crew groups list      ms/organizations/1/crew-groups/        -> CrewGroupDetail[]
 *                          (also serves ?is_active=true used by getActiveCrewGroups)
 *  - Crew group detail     ms/organizations/1/crew-groups/<id>/   -> CrewGroupDetail (verbatim)
 *  - Crew groups list-lite ms/organizations/1/crew-groups-list/   -> CrewGroupListItem[]
 *  - Available members     ms/organizations/1/crew-groups/<id>/available_members/ (verbatim {members})
 *  - Crew directory        ms/organizations/1/crew-directory/     -> { stats, members } (verbatim object)
 *  - Directory member      ms/organizations/1/crew-directory/<id>/ -> CrewDirectoryMember (verbatim)
 *  - Job crew assignments  ms/organizations/1/jobs/all/<jobId>/crew-assignments/...
 *
 * The crew-management page renders two tabs:
 *  - Groups tab     -> CrewGroupGridCard reads members[].user.username/profile_image,
 *                      members[].role_display, members[].is_active, project_types[],
 *                      is_active, is_default, name, id.
 *  - Directory tab  -> CrewDirectoryOverviewStats reads stats.{total_crew,total_groups,
 *                      assigned_count,unassigned_count}; CrewMemberGridCard reads
 *                      member.name/role_display/email/groups[].{id,name,is_default},
 *                      group_count.
 *
 * Canon team members (id -> username / role_display):
 *  1 Sajid Zahid (Owner/Admin), 2 Bilal Zahid (Project Manager),
 *  3 Omar Zahid (Crew Lead), 4 Marcus Reed (Excavator Operator),
 *  5 Tyler Brooks (Tile Technician), 6 Dana White (Bookkeeper).
 */

// ============================================
// CANON TEAM MEMBERS as UserInfo blocks
// ============================================

const userSajid = {
  id: 1,
  username: "Sajid Zahid",
  email: "sajid.zahid@fieldflow360.com",
  first_name: "Sajid",
  last_name: "Zahid",
  profile_image: null,
};
const userBilal = {
  id: 2,
  username: "Bilal Zahid",
  email: "bilal.zahid@fieldflow360.com",
  first_name: "Bilal",
  last_name: "Zahid",
  profile_image: null,
};
const userOmar = {
  id: 3,
  username: "Omar Zahid",
  email: "omar.zahid@fieldflow360.com",
  first_name: "Omar",
  last_name: "Zahid",
  profile_image: null,
};
const userMarcus = {
  id: 4,
  username: "Marcus Reed",
  email: "marcus.reed@fieldflow360.com",
  first_name: "Marcus",
  last_name: "Reed",
  profile_image: null,
};
const userTyler = {
  id: 5,
  username: "Tyler Brooks",
  email: "tyler.brooks@fieldflow360.com",
  first_name: "Tyler",
  last_name: "Brooks",
  profile_image: null,
};
const userDana = {
  id: 6,
  username: "Dana White",
  email: "dana.white@fieldflow360.com",
  first_name: "Dana",
  last_name: "White",
  profile_image: null,
};

// CrewGroupMember factory: { id, user, role, role_display, is_active, added_at }
const member = (
  id: number,
  user: typeof userSajid,
  role: string,
  roleDisplay: string,
  addedAt: string,
  isActive = true
) => ({
  id,
  user,
  role,
  role_display: roleDisplay,
  is_active: isActive,
  added_at: addedAt,
});

// ============================================
// PROJECT TYPES (ProjectType: id,name,color,category,category_display,is_default,organization)
// ============================================

const ptTiling = {
  id: 1,
  name: "Drainage Tiling",
  color: "#2563eb",
  category: "drainage_tiling",
  category_display: "Tile",
  is_default: true,
  organization: 1,
  created_at: "2026-01-05T08:00:00Z",
};
const ptExcavation = {
  id: 2,
  name: "Excavation",
  color: "#d97706",
  category: "excavation",
  category_display: "Excavation",
  is_default: true,
  organization: 1,
  created_at: "2026-01-05T08:00:00Z",
};
const ptRepair = {
  id: 3,
  name: "Pipe Repair",
  color: "#dc2626",
  category: "repair",
  category_display: "Repair",
  is_default: true,
  organization: 1,
  created_at: "2026-01-05T08:00:00Z",
};

// ============================================
// CREW GROUPS (CrewGroupDetail[])
// ============================================

const group1 = {
  id: 1,
  name: "Tiling Crew Alpha",
  description: "Primary drainage-tiling crew running the Soil-Max Gold plow.",
  leader: 3,
  color: "#2563eb",
  is_default: true,
  is_active: true,
  member_count: 3,
  created_at: "2026-01-08T09:00:00Z",
  last_updated: "2026-05-22T14:30:00Z",
  updated_at: "2026-05-22T14:30:00Z",
  project_types: [ptTiling],
  members: [
    member(101, userOmar, "crew_lead", "Crew Lead", "2026-01-08T09:00:00Z"),
    member(102, userTyler, "tile_tech", "Tile Technician", "2026-01-08T09:05:00Z"),
    member(103, userMarcus, "operator", "Excavator Operator", "2026-02-14T10:10:00Z"),
  ],
};

const group2 = {
  id: 2,
  name: "Excavation Crew Bravo",
  description: "Heavy excavation and trenching crew for outlet and main runs.",
  leader: 4,
  color: "#d97706",
  is_default: false,
  is_active: true,
  member_count: 3,
  created_at: "2026-01-20T08:30:00Z",
  last_updated: "2026-06-01T11:15:00Z",
  updated_at: "2026-06-01T11:15:00Z",
  project_types: [ptExcavation, ptTiling],
  members: [
    member(201, userMarcus, "operator", "Excavator Operator", "2026-01-20T08:30:00Z"),
    member(202, userOmar, "crew_lead", "Crew Lead", "2026-03-02T07:45:00Z"),
    member(203, userBilal, "project_manager", "Project Manager", "2026-04-11T09:20:00Z"),
  ],
};

const group3 = {
  id: 3,
  name: "Repair & Service Crew",
  description: "Rapid-response crew for pipe repair and tile line maintenance.",
  leader: 5,
  color: "#dc2626",
  is_default: false,
  is_active: true,
  member_count: 2,
  created_at: "2026-02-05T10:00:00Z",
  last_updated: "2026-05-30T16:00:00Z",
  updated_at: "2026-05-30T16:00:00Z",
  project_types: [ptRepair],
  members: [
    member(301, userTyler, "tile_tech", "Tile Technician", "2026-02-05T10:00:00Z"),
    member(302, userMarcus, "operator", "Excavator Operator", "2026-02-18T13:30:00Z"),
  ],
};

const group4 = {
  id: 4,
  name: "Field Supervision",
  description: "Project managers and leads overseeing all active jobs.",
  leader: 2,
  color: "#7c3aed",
  is_default: false,
  is_active: true,
  member_count: 3,
  created_at: "2026-02-12T08:00:00Z",
  last_updated: "2026-06-10T09:00:00Z",
  updated_at: "2026-06-10T09:00:00Z",
  project_types: [ptTiling, ptExcavation, ptRepair],
  members: [
    member(401, userBilal, "project_manager", "Project Manager", "2026-02-12T08:00:00Z"),
    member(402, userOmar, "crew_lead", "Crew Lead", "2026-02-12T08:05:00Z"),
    member(403, userSajid, "admin", "Owner/Admin", "2026-02-12T08:10:00Z"),
  ],
};

const group5 = {
  id: 5,
  name: "Seasonal Tiling Crew Charlie",
  description:
    "Overflow crew stood up for spring backlog; currently stood down for the season.",
  leader: 3,
  color: "#0d9488",
  is_default: false,
  is_active: false,
  member_count: 2,
  created_at: "2026-03-01T07:00:00Z",
  last_updated: "2026-06-15T17:00:00Z",
  updated_at: "2026-06-15T17:00:00Z",
  project_types: [ptTiling],
  members: [
    member(501, userTyler, "tile_tech", "Tile Technician", "2026-03-01T07:00:00Z"),
    // a deactivated member to exercise the active-filter in the card
    member(502, userMarcus, "operator", "Excavator Operator", "2026-03-01T07:05:00Z", false),
  ],
};

const group6 = {
  id: 6,
  name: "Office & Logistics",
  description: "Bookkeeping, scheduling, and material logistics support.",
  leader: 6,
  color: "#475569",
  is_default: false,
  is_active: true,
  member_count: 2,
  created_at: "2026-01-15T08:00:00Z",
  last_updated: "2026-05-18T10:45:00Z",
  updated_at: "2026-05-18T10:45:00Z",
  project_types: [],
  members: [
    member(601, userDana, "bookkeeper", "Bookkeeper", "2026-01-15T08:00:00Z"),
    member(602, userBilal, "project_manager", "Project Manager", "2026-04-01T09:00:00Z"),
  ],
};

const crewGroups = [group1, group2, group3, group4, group5, group6];

// Lightweight crew-groups-list rows (CrewGroupListItem[])
const crewGroupsListLite = crewGroups.map((g) => ({
  id: g.id,
  name: g.name,
  is_default: g.is_default,
  is_active: g.is_active,
}));

// available_members response for a group (org members not yet in the group)
const availableMembersResponse = {
  members: [
    { id: 1, name: "Sajid Zahid", email: "sajid.zahid@fieldflow360.com", role: "admin", role_display: "Owner/Admin" },
    { id: 2, name: "Bilal Zahid", email: "bilal.zahid@fieldflow360.com", role: "project_manager", role_display: "Project Manager" },
    { id: 6, name: "Dana White", email: "dana.white@fieldflow360.com", role: "bookkeeper", role_display: "Bookkeeper" },
  ],
};

// ============================================
// CREW DIRECTORY (CrewDirectoryResponse: { stats, members })
// ============================================

const dirGroup = (id: number, name: string, isDefault: boolean, addedAt: string) => ({
  id,
  name,
  is_default: isDefault,
  added_at: addedAt,
});

const dirSajid = {
  id: 1,
  name: "Sajid Zahid",
  role: "admin",
  role_display: "Owner/Admin",
  email: "sajid.zahid@fieldflow360.com",
  assignment_status: "assigned",
  group_count: 1,
  groups: [dirGroup(4, "Field Supervision", false, "2026-02-12T08:10:00Z")],
};
const dirBilal = {
  id: 2,
  name: "Bilal Zahid",
  role: "project_manager",
  role_display: "Project Manager",
  email: "bilal.zahid@fieldflow360.com",
  assignment_status: "assigned",
  group_count: 3,
  groups: [
    dirGroup(2, "Excavation Crew Bravo", false, "2026-04-11T09:20:00Z"),
    dirGroup(4, "Field Supervision", false, "2026-02-12T08:00:00Z"),
    dirGroup(6, "Office & Logistics", false, "2026-04-01T09:00:00Z"),
  ],
};
const dirOmar = {
  id: 3,
  name: "Omar Zahid",
  role: "crew_lead",
  role_display: "Crew Lead",
  email: "omar.zahid@fieldflow360.com",
  assignment_status: "assigned",
  group_count: 3,
  groups: [
    dirGroup(1, "Tiling Crew Alpha", true, "2026-01-08T09:00:00Z"),
    dirGroup(2, "Excavation Crew Bravo", false, "2026-03-02T07:45:00Z"),
    dirGroup(4, "Field Supervision", false, "2026-02-12T08:05:00Z"),
  ],
};
const dirMarcus = {
  id: 4,
  name: "Marcus Reed",
  role: "operator",
  role_display: "Excavator Operator",
  email: "marcus.reed@fieldflow360.com",
  assignment_status: "assigned",
  group_count: 4,
  groups: [
    dirGroup(1, "Tiling Crew Alpha", true, "2026-02-14T10:10:00Z"),
    dirGroup(2, "Excavation Crew Bravo", false, "2026-01-20T08:30:00Z"),
    dirGroup(3, "Repair & Service Crew", false, "2026-02-18T13:30:00Z"),
    dirGroup(5, "Seasonal Tiling Crew Charlie", false, "2026-03-01T07:05:00Z"),
  ],
};
const dirTyler = {
  id: 5,
  name: "Tyler Brooks",
  role: "tile_tech",
  role_display: "Tile Technician",
  email: "tyler.brooks@fieldflow360.com",
  assignment_status: "assigned",
  group_count: 3,
  groups: [
    dirGroup(1, "Tiling Crew Alpha", true, "2026-01-08T09:05:00Z"),
    dirGroup(3, "Repair & Service Crew", false, "2026-02-05T10:00:00Z"),
    dirGroup(5, "Seasonal Tiling Crew Charlie", false, "2026-03-01T07:00:00Z"),
  ],
};
const dirDana = {
  id: 6,
  name: "Dana White",
  role: "bookkeeper",
  role_display: "Bookkeeper",
  email: "dana.white@fieldflow360.com",
  assignment_status: "unassigned",
  group_count: 0,
  groups: [],
};

const directoryMembers = [dirSajid, dirBilal, dirOmar, dirMarcus, dirTyler, dirDana];

const directoryStats = {
  total_crew: directoryMembers.length,
  total_groups: crewGroups.length,
  assigned_count: directoryMembers.filter((m) => m.assignment_status === "assigned").length,
  unassigned_count: directoryMembers.filter((m) => m.assignment_status === "unassigned").length,
};

const directoryResponse = {
  stats: directoryStats,
  members: directoryMembers,
};

// ============================================
// JOB CREW ASSIGNMENTS (behind job detail pages)
// ============================================

const jobAvailableCrewGroups = crewGroups
  .filter((g) => g.is_active)
  .map((g) => ({
    id: g.id,
    name: g.name,
    description: g.description,
    color: g.color,
    is_default: g.is_default,
    is_active: g.is_active,
    member_count: g.member_count,
  }));

const jobAvailableIndividuals = [
  { id: 1, name: "Sajid Zahid", email: "sajid.zahid@fieldflow360.com", role: "admin", role_display: "Owner/Admin" },
  { id: 2, name: "Bilal Zahid", email: "bilal.zahid@fieldflow360.com", role: "project_manager", role_display: "Project Manager" },
  { id: 4, name: "Marcus Reed", email: "marcus.reed@fieldflow360.com", role: "operator", role_display: "Excavator Operator" },
  { id: 6, name: "Dana White", email: "dana.white@fieldflow360.com", role: "bookkeeper", role_display: "Bookkeeper" },
];

const jobAssignments = [
  {
    id: 1,
    assignment_type: "crew_group",
    crew_group_id: 1,
    crew_group_name: "Tiling Crew Alpha",
    member_id: null,
    member_name: null,
    member_email: null,
    member_role: null,
    member_role_display: null,
    is_active: true,
    assigned_at: "2026-04-02T08:00:00Z",
    deactivated_at: null,
    assigned_by_username: "Bilal Zahid",
    deactivated_by_username: null,
    status_display: "Active",
  },
  {
    id: 2,
    assignment_type: "individual",
    crew_group_id: null,
    crew_group_name: null,
    member_id: 3,
    member_name: "Omar Zahid",
    member_email: "omar.zahid@fieldflow360.com",
    member_role: "crew_lead",
    member_role_display: "Crew Lead",
    is_active: true,
    assigned_at: "2026-04-03T07:30:00Z",
    deactivated_at: null,
    assigned_by_username: "Bilal Zahid",
    deactivated_by_username: null,
    status_display: "Active",
  },
  {
    id: 3,
    assignment_type: "individual",
    crew_group_id: null,
    crew_group_name: null,
    member_id: 5,
    member_name: "Tyler Brooks",
    member_email: "tyler.brooks@fieldflow360.com",
    member_role: "tile_tech",
    member_role_display: "Tile Technician",
    is_active: false,
    assigned_at: "2026-03-15T09:00:00Z",
    deactivated_at: "2026-04-01T17:00:00Z",
    assigned_by_username: "Bilal Zahid",
    deactivated_by_username: "Bilal Zahid",
    status_display: "Inactive",
  },
];

const jobTeamListResponse = {
  assignments: jobAssignments,
  total_crew_groups: 1,
  total_individuals: 2,
  active_crew_groups: 1,
  active_individuals: 1,
};

// ============================================
// ROUTES
// ============================================

export const routes: MockRoute[] = [
  // ----------------------------------------
  // JOB CREW ASSIGNMENTS — sub-action routes first (more specific)
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/jobs\/all\/\d+\/crew-assignments\/available_crew_groups\/?$/,
    list: false,
    data: jobAvailableCrewGroups,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/all\/\d+\/crew-assignments\/available_individuals\/?$/,
    list: false,
    data: jobAvailableIndividuals,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/all\/\d+\/crew-assignments\/job_team_list\/?$/,
    list: false,
    data: jobTeamListResponse,
  },
  {
    match: /^ms\/organizations\/\d+\/jobs\/all\/\d+\/crew-assignments\/?$/,
    list: false,
    data: jobTeamListResponse,
  },

  // ----------------------------------------
  // CREW GROUP available_members — must precede the group-detail route
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/crew-groups\/\d+\/available_members\/?$/,
    list: false,
    data: availableMembersResponse,
  },

  // ----------------------------------------
  // CREW GROUP DETAIL — verbatim CrewGroupDetail (must precede the list route)
  // ----------------------------------------
  { match: /^ms\/organizations\/\d+\/crew-groups\/1\/?$/, list: false, data: group1 },
  { match: /^ms\/organizations\/\d+\/crew-groups\/2\/?$/, list: false, data: group2 },
  { match: /^ms\/organizations\/\d+\/crew-groups\/3\/?$/, list: false, data: group3 },
  { match: /^ms\/organizations\/\d+\/crew-groups\/4\/?$/, list: false, data: group4 },
  { match: /^ms\/organizations\/\d+\/crew-groups\/5\/?$/, list: false, data: group5 },
  { match: /^ms\/organizations\/\d+\/crew-groups\/6\/?$/, list: false, data: group6 },
  // Fallback for any other crew-group id
  { match: /^ms\/organizations\/\d+\/crew-groups\/\d+\/?$/, list: false, data: group1 },

  // ----------------------------------------
  // CREW GROUPS — lightweight list (Installed Footage filter)
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/crew-groups-list\/?$/,
    data: crewGroupsListLite,
  },

  // ----------------------------------------
  // CREW GROUPS — full list (also serves ?is_active=true active variant)
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/crew-groups\/?$/,
    data: crewGroups,
  },

  // ----------------------------------------
  // CREW DIRECTORY MEMBER DETAIL — verbatim CrewDirectoryMember (before list)
  // ----------------------------------------
  { match: /^ms\/organizations\/\d+\/crew-directory\/1\/?$/, list: false, data: dirSajid },
  { match: /^ms\/organizations\/\d+\/crew-directory\/2\/?$/, list: false, data: dirBilal },
  { match: /^ms\/organizations\/\d+\/crew-directory\/3\/?$/, list: false, data: dirOmar },
  { match: /^ms\/organizations\/\d+\/crew-directory\/4\/?$/, list: false, data: dirMarcus },
  { match: /^ms\/organizations\/\d+\/crew-directory\/5\/?$/, list: false, data: dirTyler },
  { match: /^ms\/organizations\/\d+\/crew-directory\/6\/?$/, list: false, data: dirDana },
  // Fallback for any other directory member id
  { match: /^ms\/organizations\/\d+\/crew-directory\/\d+\/?$/, list: false, data: dirMarcus },

  // ----------------------------------------
  // CREW DIRECTORY — verbatim { stats, members } object (NOT a list)
  // ----------------------------------------
  {
    match: /^ms\/organizations\/\d+\/crew-directory\/?$/,
    list: false,
    data: directoryResponse,
  },
];
