import type { ActivityLogEntityKind } from "@/constants";

export type { ActivityLogEntityKind };

export type LeadLogRow = {
  id: string;
  user: string;
  action: string;
  actionDetail: string;
};

export type ActivityLogEntry = {
  id: string;
  who: string;
  what: string;
  when: string;
  where: string;
  afterValues: Record<string, string>;
};
