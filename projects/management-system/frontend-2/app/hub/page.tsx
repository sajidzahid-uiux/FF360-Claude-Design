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
      <div className="grid gap-5 sm:grid-cols-2">
        <PrototypeCard
          href="/design-system"
          title="Design System"
          badge="org-ui"
          description="Live gallery of @fieldflow360/org-ui components — buttons, inputs, charts, modals, and more — rendered from the exact package version the CMS imports."
        />
        <PrototypeCard
          href="/flows"
          title="Flows"
          badge="prototypes"
          description="Clickable end-to-end prototypes: the full CMS baseline, the lead-to-job journey, and a new-module sandbox."
        />
        <PrototypeCard
          href="/flows/full-prototype"
          title="Full Prototype (CMS baseline)"
          badge="baseline"
          description="The existing management-system CMS running on dummy data — the starting point every new screen is measured against."
        />
        <PrototypeCard
          href="/organizations/1/dashboard"
          external
          title="Open the live CMS"
          badge="dummy data"
          description="Jump straight into the running CMS dashboard (no backend — all data is mocked)."
        />
      </div>
    </PrototypeChrome>
  );
}
