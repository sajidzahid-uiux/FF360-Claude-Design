"use client";

import { OrgDesignParametersSettings } from "@/features/org-design-parameters";
import { useIsAdmin } from "@/hooks/queries";

export default function Ff360DesignParametersPage() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return (
      <p className="text-text-muted py-12 text-center">
        You need admin permissions to access this page.
      </p>
    );
  }

  return <OrgDesignParametersSettings />;
}
