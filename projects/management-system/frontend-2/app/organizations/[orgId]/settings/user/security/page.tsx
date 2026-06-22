"use client";
import { useAuth0 } from "@auth0/auth0-react";

import {
  ActiveDevicesCard,
  PasswordCard,
  RecentActivityCard,
  TwoFactorCard,
} from "@/features/security";

export default function UserSecurityPage() {
  const { user } = useAuth0();
  const isSocial =
    user?.sub?.startsWith("google-oauth2|") ||
    user?.sub?.startsWith("apple|") ||
    user?.sub?.startsWith("facebook|");
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <PasswordCard isSocial={isSocial} />
      <TwoFactorCard />
      <ActiveDevicesCard />
      <RecentActivityCard />
    </div>
  );
}
