/**
 * Messaging / chat dummy data for org 1 ("Sajid & Sons Contractors").
 *
 * Two transport paths are mocked from this file:
 *  - `chat/{org}/chatgroups/` and `chat/{org}/unseen/count/` go through the
 *    axios mock adapter (mockApi.ts) — see the handlers there.
 *  - `chat/{org}/groupmessages/?group_id=…` is fetched with the NATIVE fetch()
 *    API (not axios), so it is served by the window.fetch shim installed in
 *    lib/axios.ts. `buildGroupMessagesPage()` produces that response.
 *
 * Member ids 1–6 mirror the shared roster in mocks/data/members.ts:
 *   1 Sajid (the demo "me"), 2 Bilal, 3 Omar, 4 Marcus, 5 Tyler, 6 Dana.
 */
import type { ChatAuthor, ChatGroup, ChatMessage } from "@/api/types/chat";

/** username per member id (matches members.ts user.username). */
const ROSTER: Record<number, string> = {
  1: "sajid.zahid",
  2: "bilal.zahid",
  3: "omar.zahid",
  4: "marcus.reed",
  5: "tyler.brooks",
  6: "dana.white",
};

const author = (id: number): ChatAuthor => ({
  username: ROSTER[id],
  user: { id, username: ROSTER[id] },
});

// Timestamps are relative to "now" so the thread always looks current and the
// day separators render as Today / Yesterday in the demo.
const NOW = Date.now();
const at = (daysAgo: number, hour: number, minute: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ---- Conversations (group chats + private DM threads) ----------------------
export const CHAT_GROUPS: ChatGroup[] = [
  {
    id: 101,
    group_name: "Design Team",
    group_description: "Site layouts, takeoffs and proposals",
    group_image: null,
    is_private: false,
    members: [1, 2, 3],
  },
  {
    id: 102,
    group_name: "Field Crew",
    group_description: "Daily job coordination",
    group_image: null,
    is_private: false,
    members: [1, 3, 4, 5],
  },
  {
    id: 103,
    group_name: "Project Managers",
    group_description: "Scheduling and client updates",
    group_image: null,
    is_private: false,
    members: [1, 2, 6],
  },
  {
    id: 104,
    group_name: "Company-wide",
    group_description: "Announcements for everyone",
    group_image: null,
    is_private: false,
    members: [1, 2, 3, 4, 5, 6],
  },
  // Private 1:1 threads (members === [me, other]) so DMs have history too.
  { id: 201, group_name: "", group_image: null, is_private: true, members: [1, 2] },
  { id: 202, group_name: "", group_image: null, is_private: true, members: [1, 4] },
  { id: 203, group_name: "", group_image: null, is_private: true, members: [1, 6] },
];

// ---- Messages, oldest → newest per conversation ----------------------------
let mid = 9000;
const m = (
  groupId: number,
  authorId: number,
  text: string,
  created_at: string
): ChatMessage => ({
  id: ++mid,
  group_id: groupId,
  text,
  body: text,
  created_at,
  timestamp: created_at,
  author: author(authorId),
});

const MESSAGES: Record<number, ChatMessage[]> = {
  101: [
    m(101, 2, "Morning team — proposal for the Henderson lot is ready for review.", at(1, 8, 12)),
    m(101, 1, "Nice. Did we land on the irrigation layout?", at(1, 8, 30)),
    m(101, 3, "Yep, went with the drip lines along the north edge. Cuts runtime by ~20%.", at(1, 8, 41)),
    m(101, 2, "I'll attach the updated takeoff before lunch.", at(1, 9, 5)),
    m(101, 1, "Perfect. Let's send it to the client today.", at(0, 9, 15)),
    m(101, 3, "Done — uploaded the revised PDF to the job file.", at(0, 9, 47)),
  ],
  102: [
    m(102, 1, "Crew, we're starting at the Maple Ave site at 7am sharp.", at(1, 16, 30)),
    m(102, 4, "Copy. I'll have the skid steer loaded tonight.", at(1, 16, 48)),
    m(102, 5, "Weather looks clear, should be a full day.", at(1, 17, 2)),
    m(102, 3, "Bringing extra mulch — we ran short last time.", at(0, 6, 40)),
    m(102, 4, "On site now, gate's open.", at(0, 7, 3)),
  ],
  103: [
    m(103, 6, "Invoices for the Q2 jobs are out. Two are still unpaid.", at(2, 11, 0)),
    m(103, 2, "I'll chase the Henderson one — they asked for net-30.", at(2, 11, 22)),
    m(103, 1, "Thanks Dana. Let's review the schedule for next week on Friday.", at(1, 14, 10)),
    m(103, 6, "Works for me. Calendar invite sent.", at(1, 14, 18)),
  ],
  104: [
    m(104, 1, "Welcome to the team, Tyler! 🎉", at(3, 10, 0)),
    m(104, 5, "Thanks everyone, glad to be here!", at(3, 10, 12)),
    m(104, 6, "Reminder: timesheets are due end of day Friday.", at(1, 13, 30)),
    m(104, 2, "Great work closing out the Maple Ave job ahead of schedule, crew. 👏", at(0, 12, 5)),
  ],
  201: [
    m(201, 2, "Hey, did you get a chance to look at the Carter estimate?", at(1, 10, 20)),
    m(201, 1, "Looking now — the labor line seems high.", at(1, 10, 33)),
    m(201, 2, "Agreed, I padded it for the slope work. Can trim 8%.", at(1, 10, 41)),
    m(201, 1, "Do that and resend. Thanks!", at(0, 8, 55)),
    m(201, 2, "Sent ✅", at(0, 9, 2)),
  ],
  202: [
    m(202, 4, "Truck 2 is making a noise again, might need the shop.", at(1, 15, 12)),
    m(202, 1, "Drop it Monday, I'll book the appointment.", at(1, 15, 20)),
    m(202, 4, "Will do, thanks.", at(1, 15, 21)),
  ],
  203: [
    m(203, 6, "Payroll's processed for this period.", at(2, 9, 30)),
    m(203, 1, "Appreciate it. Any flags?", at(2, 9, 44)),
    m(203, 6, "All clean this time. 👍", at(2, 9, 46)),
  ],
};

/** DRF-style paginated page for a conversation, newest message first. */
export function buildGroupMessagesPage(groupId: number, page = 1) {
  const all = MESSAGES[groupId] ?? [];
  const results = [...all].reverse(); // API contract: newest first
  return {
    results,
    count: all.length,
    total_count: all.length,
    total_pages: 1,
    current_page: page,
    page_size: all.length || 20,
    next: null,
    previous: null,
  };
}

/** Unread badges per conversation id (powers MessageUnseenBadge + shell badge). */
export const UNSEEN_COUNTS: Record<number, number> = {
  102: 2,
  201: 1,
};
