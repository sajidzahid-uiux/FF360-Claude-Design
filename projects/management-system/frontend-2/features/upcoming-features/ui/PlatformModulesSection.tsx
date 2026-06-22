import { Layers } from "lucide-react";

import {
  ModuleCard,
  PLATFORM_MODULES,
  UpcomingFeaturesSectionHeader,
} from "@/features/upcoming-features";

export function PlatformModulesSection() {
  return (
    <section className="space-y-4">
      <UpcomingFeaturesSectionHeader
        description="Major capabilities planned as integrated platform modules."
        icon={<Layers aria-hidden strokeWidth={2} />}
        title="Platform modules in development"
      />

      <ul className="grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
        {PLATFORM_MODULES.map((module) => (
          <li key={module.id} className="min-w-0">
            <ModuleCard module={module} />
          </li>
        ))}
      </ul>
    </section>
  );
}
