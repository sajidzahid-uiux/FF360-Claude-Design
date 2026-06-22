export type InstalledHoursLogRow = {
  id: string;
  /** Member who created the entry (`entered_by` from API). */
  enteredByMemberId: number;
  member: string;
  date: string;
  hours: number;
  description: string;
};
