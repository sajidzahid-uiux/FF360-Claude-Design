import type { Metadata } from "next";

import { PrototypeCard, PrototypeChrome } from "../../_prototype/PrototypeChrome";

export const metadata: Metadata = {
  title: "Full Prototype · FieldFlow360",
};

export default function FullPrototypePage() {
  return (
    <PrototypeChrome
      title="Full Prototype — CMS baseline"
      subtitle="The existing management-system CMS, running entirely on dummy data (no backend). This is the production baseline; new flows branch from here."
      active="/flows"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PrototypeCard href="/organizations/1/dashboard" external title="Dashboard" badge="dummy data" description="Org dashboard with live charts and stats." />
        <PrototypeCard href="/organizations/1/leads" external title="Leads" badge="dummy data" description="Leads list and management." />
        <PrototypeCard href="/organizations/1/jobs" external title="Jobs" badge="dummy data" description="Jobs across repair, excavation, and tiling." />
        <PrototypeCard href="/organizations/1/equipment" external title="Equipment" badge="dummy data" description="Equipment tracking and maintenance." />
        <PrototypeCard href="/organizations/1/calendar" external title="Calendar" badge="dummy data" description="Scheduling and calendar view." />
        <PrototypeCard href="/organizations/1/contact" external title="Contacts" badge="dummy data" description="Contact directory." />
      </div>
      <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
        Note: pages beyond the dashboard render against generic empty mock data
        for now. As we build out each flow, we add realistic dummy datasets in
        <code className="mx-1 rounded bg-amber-100 px-1 dark:bg-amber-900/40">mocks/mockApi.ts</code>.
      </p>
    </PrototypeChrome>
  );
}
