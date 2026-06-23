import type { MockRoute } from "./types";

/**
 * TASK MANAGEMENT ("To-Do List") mock data for "Sajid & Sons Contractors" (org 1).
 *
 * Endpoints (mockApi normalizes url -> protocol/host/query stripped):
 *   ms/organizations/1/tasks/         -> list (all tasks; query params page/search/
 *                                        filters are dropped by the normalizer, so
 *                                        the same list feeds every filtered view)
 *   ms/organizations/1/tasks/<id>/    -> single Task (detail / edit modal hydrate)
 *
 * Fields read by the renderers (TasksTable / task-org-ui-columns /
 * task-column-cells / TaskAssigneesCell / assigneesDisplay / taskForm):
 *   id, organization,
 *   task_name, description, overdue (TaskNameCell + ExpandableDescriptionCell),
 *   assignees (number[]), assignees_info[] { id, username, email,
 *     first_name, last_name } (TaskAssigneesCell -> getTaskAssigneeIds /
 *     getTaskAssigneesForDisplay), legacy assignee + assignee_info kept aligned,
 *   task_status (number), task_status_info { id, name, is_default } (TaskStatusCell),
 *   task_type (number), task_type_info { id, type_name, type_color } (TaskTypeCell),
 *   task_priority "urgent" | "high" | "medium" | "low" (TaskPriorityCell flag),
 *   created_at (ISO, orgUiIsoDateColumn), deadline (ISO|null, TaskDeadlineCell),
 *   updated_at (ISO).
 *
 * Assignee ids 1-6 mirror the SHARED CANON team roster so avatars/initials resolve
 * against the team-members mock (1 Sajid, 2 Bilal, 3 Omar, 4 Marcus, 5 Tyler, 6 Dana).
 * task_status ids/names mirror demo task statuses; task_type ids/colors are local.
 */

// ---- Canon assignee_info objects (id matches team member id) ----
const A_SAJID = {
  id: 1,
  username: "sajid.zahid",
  email: "sajid.zahid@fieldflow360.com",
  first_name: "Sajid",
  last_name: "Zahid",
};
const A_BILAL = {
  id: 2,
  username: "bilal.zahid",
  email: "bilal.zahid@fieldflow360.com",
  first_name: "Bilal",
  last_name: "Zahid",
};
const A_OMAR = {
  id: 3,
  username: "omar.zahid",
  email: "omar.zahid@fieldflow360.com",
  first_name: "Omar",
  last_name: "Zahid",
};
const A_MARCUS = {
  id: 4,
  username: "marcus.reed",
  email: "marcus.reed@fieldflow360.com",
  first_name: "Marcus",
  last_name: "Reed",
};
const A_TYLER = {
  id: 5,
  username: "tyler.brooks",
  email: "tyler.brooks@fieldflow360.com",
  first_name: "Tyler",
  last_name: "Brooks",
};
const A_DANA = {
  id: 6,
  username: "dana.white",
  email: "dana.white@fieldflow360.com",
  first_name: "Dana",
  last_name: "White",
};

// ---- Task statuses (id / name / is_default) ----
const TS_TODO = { id: 1, name: "To Do", is_default: true };
const TS_IN_PROGRESS = { id: 2, name: "In Progress", is_default: false };
const TS_BLOCKED = { id: 3, name: "Blocked", is_default: false };
const TS_DONE = { id: 4, name: "Done", is_default: false };

// ---- Task types (id / type_name / type_color) ----
const TT_FIELD = { id: 1, type_name: "Field Work", type_color: "#22c55e" };
const TT_OFFICE = { id: 2, type_name: "Office", type_color: "#3b82f6" };
const TT_EQUIPMENT = { id: 3, type_name: "Equipment", type_color: "#f59e0b" };
const TT_FOLLOWUP = { id: 4, type_name: "Follow-up", type_color: "#8b5cf6" };
const TT_PERSONAL = { id: 5, type_name: "Personal", type_color: "#6b7280" };

const ORG = 1;

const tasks = [
  {
    id: 101,
    organization: ORG,
    task_name: "Stake out tile lines at Johnson Family Farm (160 ac)",
    description:
      "Walk the south 160 acres with Omar and flag the main and lateral runs before the Soil-Max plow arrives. Reference the drainage design for job #DT-2041.",
    assignee: 3,
    assignee_info: A_OMAR,
    assignees: [3, 4],
    assignees_info: [A_OMAR, A_MARCUS],
    task_priority: "high",
    overdue: false,
    task_type: TT_FIELD.id,
    task_type_info: TT_FIELD,
    task_status: TS_IN_PROGRESS.id,
    task_status_info: TS_IN_PROGRESS,
    created_at: "2026-05-28T13:20:00Z",
    updated_at: "2026-06-10T09:05:00Z",
    deadline: "2026-06-25T17:00:00Z",
  },
  {
    id: 102,
    organization: ORG,
    task_name: "Send drainage-tiling proposal to Prairie View Acres",
    description:
      "Finalize the 240-acre tiling estimate and email the proposal PDF to the Prairie View contact. Follow up by phone if no reply in 3 days.",
    assignee: 2,
    assignee_info: A_BILAL,
    assignees: [2],
    assignees_info: [A_BILAL],
    task_priority: "urgent",
    overdue: true,
    task_type: TT_OFFICE.id,
    task_type_info: TT_OFFICE,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-06-02T15:45:00Z",
    updated_at: "2026-06-12T11:30:00Z",
    deadline: "2026-06-18T17:00:00Z",
  },
  {
    id: 103,
    organization: ORG,
    task_name: "500-hour service on CAT 336 Excavator",
    description:
      "Schedule and complete the 500-hour service: hydraulic filters, engine oil, track tension check. Log hours before the Hilltop Dairy excavation job.",
    assignee: 4,
    assignee_info: A_MARCUS,
    assignees: [4],
    assignees_info: [A_MARCUS],
    task_priority: "medium",
    overdue: false,
    task_type: TT_EQUIPMENT.id,
    task_type_info: TT_EQUIPMENT,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-06-05T08:10:00Z",
    updated_at: "2026-06-09T16:40:00Z",
    deadline: "2026-06-30T17:00:00Z",
  },
  {
    id: 104,
    organization: ORG,
    task_name: "Reconcile May invoices and chase outstanding payments",
    description:
      "Close out the May accounts: match deposits, send reminders to Riverside Grain Co. and Meadowbrook Farms on overdue balances.",
    assignee: 6,
    assignee_info: A_DANA,
    assignees: [6],
    assignees_info: [A_DANA],
    task_priority: "high",
    overdue: false,
    task_type: TT_OFFICE.id,
    task_type_info: TT_OFFICE,
    task_status: TS_IN_PROGRESS.id,
    task_status_info: TS_IN_PROGRESS,
    created_at: "2026-06-01T09:00:00Z",
    updated_at: "2026-06-14T10:15:00Z",
    deadline: "2026-06-22T17:00:00Z",
  },
  {
    id: 105,
    organization: ORG,
    task_name: "Inspect pipe-repair washout at Riverside Grain Co.",
    description:
      "Tyler to assess the collapsed 8-inch lateral near the east culvert and report whether it needs full replacement or a coupler repair.",
    assignee: 5,
    assignee_info: A_TYLER,
    assignees: [5, 3],
    assignees_info: [A_TYLER, A_OMAR],
    task_priority: "urgent",
    overdue: true,
    task_type: TT_FIELD.id,
    task_type_info: TT_FIELD,
    task_status: TS_BLOCKED.id,
    task_status_info: TS_BLOCKED,
    created_at: "2026-05-20T12:30:00Z",
    updated_at: "2026-06-08T14:20:00Z",
    deadline: "2026-06-15T17:00:00Z",
  },
  {
    id: 106,
    organization: ORG,
    task_name: "Order replacement teeth for Soil-Max Gold Tile Plow",
    description:
      "Parts are wearing thin after the Sandhill Ranch run. Order two sets of carbide teeth and confirm lead time before the next tiling job.",
    assignee: 4,
    assignee_info: A_MARCUS,
    assignees: [4, 5],
    assignees_info: [A_MARCUS, A_TYLER],
    task_priority: "medium",
    overdue: false,
    task_type: TT_EQUIPMENT.id,
    task_type_info: TT_EQUIPMENT,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-06-07T11:05:00Z",
    updated_at: "2026-06-11T08:50:00Z",
    deadline: "2026-06-28T17:00:00Z",
  },
  {
    id: 107,
    organization: ORG,
    task_name: "Follow up with Oakridge Agronomy on trade-show lead",
    description:
      "Call the Oakridge contact from the Farm Progress Show booth. Gauge interest in a fall excavation + tiling package and log the outcome.",
    assignee: 2,
    assignee_info: A_BILAL,
    assignees: [2],
    assignees_info: [A_BILAL],
    task_priority: "low",
    overdue: false,
    task_type: TT_FOLLOWUP.id,
    task_type_info: TT_FOLLOWUP,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-06-10T13:00:00Z",
    updated_at: "2026-06-13T09:25:00Z",
    deadline: "2026-07-02T17:00:00Z",
  },
  {
    id: 108,
    organization: ORG,
    task_name: "Renew DOT inspection for Mack Granite Dump Truck",
    description:
      "Annual federal inspection is due. Book the inspection slot and have the brakes and lights checked beforehand.",
    assignee: 1,
    assignee_info: A_SAJID,
    assignees: [1, 4],
    assignees_info: [A_SAJID, A_MARCUS],
    task_priority: "high",
    overdue: false,
    task_type: TT_EQUIPMENT.id,
    task_type_info: TT_EQUIPMENT,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-05-30T10:40:00Z",
    updated_at: "2026-06-06T15:10:00Z",
    deadline: "2026-06-26T17:00:00Z",
  },
  {
    id: 109,
    organization: ORG,
    task_name: "Final grade walkthrough at Clearwater Fields",
    description:
      "Completed the 120-acre tiling job; do the closing walkthrough with the customer and confirm sign-off before invoicing.",
    assignee: 3,
    assignee_info: A_OMAR,
    assignees: [3, 1],
    assignees_info: [A_OMAR, A_SAJID],
    task_priority: "medium",
    overdue: false,
    task_type: TT_FIELD.id,
    task_type_info: TT_FIELD,
    task_status: TS_DONE.id,
    task_status_info: TS_DONE,
    created_at: "2026-04-18T09:15:00Z",
    updated_at: "2026-05-02T16:00:00Z",
    deadline: "2026-04-30T17:00:00Z",
  },
  {
    id: 110,
    organization: ORG,
    task_name: "Update the 2026 equipment maintenance schedule",
    description:
      "Roll forward the maintenance calendar for all six machines and share the updated spreadsheet with the crew leads.",
    assignee: 1,
    assignee_info: A_SAJID,
    assignees: [1],
    assignees_info: [A_SAJID],
    task_priority: "low",
    overdue: false,
    task_type: TT_OFFICE.id,
    task_type_info: TT_OFFICE,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-06-09T14:30:00Z",
    updated_at: "2026-06-09T14:30:00Z",
    deadline: null,
  },
  {
    id: 111,
    organization: ORG,
    task_name: "Coordinate locate request for Meadowbrook excavation",
    description:
      "Submit the 811 utility locate ticket at least 48 hours before digging the outlet trench. Confirm all flags are placed before mobilizing.",
    assignee: 3,
    assignee_info: A_OMAR,
    assignees: [3, 4],
    assignees_info: [A_OMAR, A_MARCUS],
    task_priority: "urgent",
    overdue: false,
    task_type: TT_FIELD.id,
    task_type_info: TT_FIELD,
    task_status: TS_IN_PROGRESS.id,
    task_status_info: TS_IN_PROGRESS,
    created_at: "2026-06-11T08:00:00Z",
    updated_at: "2026-06-13T07:45:00Z",
    deadline: "2026-06-20T12:00:00Z",
  },
  {
    id: 112,
    organization: ORG,
    task_name: "Dentist appointment",
    description: "Personal reminder — annual cleaning at 3:30pm in Ames.",
    assignee: 6,
    assignee_info: A_DANA,
    assignees: [6],
    assignees_info: [A_DANA],
    task_priority: "low",
    overdue: false,
    task_type: TT_PERSONAL.id,
    task_type_info: TT_PERSONAL,
    task_status: TS_TODO.id,
    task_status_info: TS_TODO,
    created_at: "2026-06-12T17:20:00Z",
    updated_at: "2026-06-12T17:20:00Z",
    deadline: "2026-06-24T15:30:00Z",
  },
  {
    id: 113,
    organization: ORG,
    task_name: "Prepare quarterly fuel and material cost report",
    description:
      "Compile diesel, pipe, and gravel spend for Q2 across all active jobs for the owner review meeting.",
    assignee: 6,
    assignee_info: A_DANA,
    assignees: [6, 1],
    assignees_info: [A_DANA, A_SAJID],
    task_priority: "medium",
    overdue: false,
    task_type: TT_OFFICE.id,
    task_type_info: TT_OFFICE,
    task_status: TS_BLOCKED.id,
    task_status_info: TS_BLOCKED,
    created_at: "2026-06-04T10:00:00Z",
    updated_at: "2026-06-13T12:00:00Z",
    deadline: "2026-07-05T17:00:00Z",
  },
];

export const routes: MockRoute[] = [
  // LIST — all tasks
  {
    match: /^ms\/organizations\/\d+\/tasks\/?$/,
    data: tasks,
  },
  // DETAIL — single task by id
  {
    match: /^ms\/organizations\/\d+\/tasks\/\d+\/?$/,
    list: false,
    data: tasks[0],
  },
];
