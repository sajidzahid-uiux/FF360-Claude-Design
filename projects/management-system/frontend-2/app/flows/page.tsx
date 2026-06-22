import type { Metadata } from "next";

import { PrototypeCard, PrototypeChrome } from "../_prototype/PrototypeChrome";

export const metadata: Metadata = {
  title: "Flows · FieldFlow360 Prototyping",
};

export default function FlowsPage() {
  return (
    <PrototypeChrome
      title="Flows"
      subtitle="Clickable prototypes built on the org-ui design system and running on dummy data."
      active="/flows"
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <PrototypeCard
          href="/flows/full-prototype"
          title="Full Prototype"
          badge="baseline"
          description="The existing CMS as-is, on dummy data — the baseline every new screen is compared against."
        />
        <PrototypeCard
          href="/flows/lead-to-job"
          title="Lead → Job"
          badge="WIP"
          description="The journey from capturing a lead through converting it into an active job."
        />
        <PrototypeCard
          href="/flows/new-module"
          title="New Module"
          badge="sandbox"
          description="A blank sandbox for prototyping a brand-new module with org-ui components."
        />
      </div>
    </PrototypeChrome>
  );
}
