import { redirect } from "next/navigation";

import { APP_ROUTES, orgRoute } from "@/shared/config/routes";

interface OrganizationSettingsRedirectPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function OrganizationSettingsRedirectPage({
  params,
}: OrganizationSettingsRedirectPageProps) {
  const { orgId } = await params;
  redirect(orgRoute(orgId, APP_ROUTES.statusManagement));
}
