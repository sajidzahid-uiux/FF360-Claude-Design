import { redirect } from "next/navigation";

import { APP_ROUTES, orgRoute } from "@/shared/config/routes";

export default async function OrganizationSettingsEntryPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  redirect(orgRoute(orgId, APP_ROUTES.organizationSettings));
}
