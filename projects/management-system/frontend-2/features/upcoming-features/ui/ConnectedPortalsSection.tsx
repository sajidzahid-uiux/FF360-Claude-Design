import { Globe2 } from "lucide-react";

import {
  CONNECTED_PORTALS,
  PortalCard,
  UpcomingFeaturesSectionHeader,
} from "@/features/upcoming-features";

export function ConnectedPortalsSection() {
  return (
    <section className="space-y-4">
      <UpcomingFeaturesSectionHeader
        description="External portals that connect into the CMS workflow."
        icon={<Globe2 aria-hidden strokeWidth={2} />}
        title="Connected portals & CMS ecosystem"
      />

      <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
        {CONNECTED_PORTALS.map((portal) => (
          <li key={portal.id} className="min-w-0">
            <PortalCard portal={portal} />
          </li>
        ))}
      </ul>
    </section>
  );
}
