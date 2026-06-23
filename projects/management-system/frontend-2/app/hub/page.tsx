import type { Metadata } from "next";

import { PrototypeCard, PrototypeChrome } from "../_prototype/PrototypeChrome";

export const metadata: Metadata = {
  title: "Prototyping Hub · FieldFlow360",
};

export default function HubPage() {
  return (
    <PrototypeChrome
      title="Prototyping Hub"
      subtitle="One place to view the FieldFlow360 design system and the CMS prototype flows. Screens here pull from the same @fieldflow360/org-ui library the CMS uses, so anything you design stays consistent with production."
      active="/hub"
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <PrototypeCard
          href="/design-system"
          title="Design System"
          badge="org-ui"
          icon="design-system"
          description="Live gallery of @fieldflow360/org-ui components — buttons, inputs, charts, modals, and more — rendered from the exact package version the CMS imports."
        />
        <PrototypeCard
          href="/organizations/1/dashboard"
          external
          title="CMS Full Prototype"
          badge="dummy data"
          icon="cms"
          description="The full management-system CMS running on dummy data — every screen, built from the same org-ui components."
        />
        <PrototypeCard
          href="/flows"
          title="Flows"
          badge="prototypes"
          icon="flows"
          description="Clickable end-to-end prototypes: the lead-to-job journey and a new-module sandbox."
        />
      </div>
    </PrototypeChrome>
  );
}
