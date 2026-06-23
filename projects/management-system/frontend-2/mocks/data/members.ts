import type { MockRoute } from "./types";

/**
 * TEAM MEMBERS / org roster mock data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *  - ms/organizations/1/team_members/        -> RAW array of TeamMember
 *      (useTeamData -> the org team page at /settings/org/team. Consumed via
 *       .map/.find/.filter directly, NOT a DRF page.)
 *  - ms/organizations/1/team_members/<id>/   -> single TeamMember (list:false)
 *  - ms/organizations/1/invitation/          -> RAW array of pending invitations
 *      (useInvitedMembersWithPermission filters m.accepted !== true)
 *
 * NOTE: this route file is only consulted for org 1 (mockApi scopes the dummy
 * dataset to the org that "has data"). For the second demo org ("Fresh
 * Contractor", id 2) team_members falls through to the generic members handler
 * which returns just the owner, and invitation falls through to an empty list —
 * exactly the "brand new org, nothing set up yet" state we want.
 *
 * TeamMember fields the card renders (verified against OrgTeamPageContent):
 *   user { id, email, first_name, last_name, username, profile_image, phone_number },
 *   role_fk { id, name, organization, is_default, is_admin, members_count,
 *             created_at, updated_at }, owner, is_active, is_designer, is_operator,
 *   created_at, last_updated.
 *
 * role_fk ids mirror DEMO_ROLES in mockApi.ts: 1 Admin, 2 Project Manager,
 * 3 Crew, 4 Bookkeeper, 5 Operator.
 */

// ---- Role objects (denormalized onto each member; mirror DEMO_ROLES) ----
const roleAdmin = {
  id: 1,
  name: "Admin",
  organization: 1,
  is_default: true,
  is_admin: true,
  members_count: 1,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};
const rolePM = {
  id: 2,
  name: "Project Manager",
  organization: 1,
  is_default: false,
  is_admin: false,
  members_count: 1,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};
const roleCrew = {
  id: 3,
  name: "Crew",
  organization: 1,
  is_default: false,
  is_admin: false,
  members_count: 3,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};
const roleBookkeeper = {
  id: 4,
  name: "Bookkeeper",
  organization: 1,
  is_default: false,
  is_admin: false,
  members_count: 1,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// TeamMember factory.
const teamMember = (
  id: number,
  first_name: string,
  last_name: string,
  username: string,
  email: string,
  phone_number: string,
  role_fk: typeof roleAdmin,
  opts: {
    owner?: boolean;
    is_designer?: boolean;
    is_operator?: boolean;
    is_active?: boolean;
    created_at?: string;
  } = {}
) => ({
  id,
  user: {
    id,
    email,
    first_name,
    last_name,
    username,
    profile_image: null,
    phone_number,
  },
  role_fk,
  role: role_fk.name,
  owner: opts.owner ?? false,
  is_active: opts.is_active ?? true,
  is_removed: false,
  is_designer: opts.is_designer ?? false,
  is_operator: opts.is_operator ?? false,
  phone_number,
  created_at: opts.created_at ?? "2026-01-05T08:00:00Z",
  last_updated: "2026-06-10T09:00:00Z",
});

// ---- The six-person roster (ids 1-6 mirror the shared canon team) ----
const teamMembers = [
  teamMember(
    1,
    "Sajid",
    "Zahid",
    "sajid.zahid",
    "sajid.zahid@fieldflow360.com",
    "+1 515 555 0142",
    roleAdmin,
    { owner: true, is_designer: true, created_at: "2026-01-01T00:00:00Z" }
  ),
  teamMember(
    2,
    "Bilal",
    "Zahid",
    "bilal.zahid",
    "bilal.zahid@fieldflow360.com",
    "+1 515 555 0143",
    rolePM,
    { is_designer: true, created_at: "2026-01-03T08:00:00Z" }
  ),
  teamMember(
    3,
    "Omar",
    "Zahid",
    "omar.zahid",
    "omar.zahid@fieldflow360.com",
    "+1 515 555 0144",
    roleCrew,
    { created_at: "2026-01-08T08:00:00Z" }
  ),
  teamMember(
    4,
    "Marcus",
    "Reed",
    "marcus.reed",
    "marcus.reed@fieldflow360.com",
    "+1 515 555 0145",
    roleCrew,
    { is_operator: true, created_at: "2026-01-20T08:00:00Z" }
  ),
  teamMember(
    5,
    "Tyler",
    "Brooks",
    "tyler.brooks",
    "tyler.brooks@fieldflow360.com",
    "+1 515 555 0146",
    roleCrew,
    { created_at: "2026-02-05T08:00:00Z" }
  ),
  teamMember(
    6,
    "Dana",
    "White",
    "dana.white",
    "dana.white@fieldflow360.com",
    "+1 515 555 0147",
    roleBookkeeper,
    { created_at: "2026-01-15T08:00:00Z" }
  ),
];

// ---- Pending invitations (org 1 has two seats out to invitees) ----
const invitations = [
  {
    id: 5001,
    email: "jordan.pike@example.com",
    role_id: rolePM.id,
    role_fk: { id: rolePM.id, name: rolePM.name },
    role: rolePM.name,
    accepted: false,
    status: "pending",
    invited_by: "Sajid Zahid",
    created_at: "2026-06-12T10:00:00Z",
    last_updated: "2026-06-12T10:00:00Z",
  },
  {
    id: 5002,
    email: "casey.ng@example.com",
    role_id: roleCrew.id,
    role_fk: { id: roleCrew.id, name: roleCrew.name },
    role: roleCrew.name,
    accepted: false,
    status: "pending",
    invited_by: "Bilal Zahid",
    created_at: "2026-06-18T14:30:00Z",
    last_updated: "2026-06-18T14:30:00Z",
  },
];

export const routes: MockRoute[] = [
  // DETAIL — single TeamMember (must precede the list route)
  {
    match: /^ms\/organizations\/\d+\/team_members\/\d+\/?$/,
    list: false,
    data: teamMembers[0],
  },
  // LIST — full roster (RAW array)
  {
    match: /^ms\/organizations\/\d+\/team_members\/?$/,
    data: teamMembers,
  },
  // INVITATIONS — pending invites (RAW array, filtered client-side)
  {
    match: /^ms\/organizations\/\d+\/invitation\/?$/,
    data: invitations,
  },
];
