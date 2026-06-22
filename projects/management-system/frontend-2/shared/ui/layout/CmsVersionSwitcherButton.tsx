"use client";

import { useEffect, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";

import { getCookie } from "@/lib/cookies";
import {
  type CmsFrontendId,
  getAlternateCmsDevUrl,
} from "@/shared/lib/cmsVersionSwitcher";

interface CmsVersionSwitcherButtonProps {
  frontendId: CmsFrontendId;
}

export function CmsVersionSwitcherButton({
  frontendId,
}: CmsVersionSwitcherButtonProps) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    setHref(
      getAlternateCmsDevUrl(
        frontendId,
        window.location.hostname,
        getCookie("lastOrgId")
      )
    );
  }, [frontendId]);

  if (!href) {
    return null;
  }

  const label = frontendId === "v1" ? "New CMS" : "Classic CMS";

  return (
    <Button
      aria-label={label}
      size={ComponentSizeEnum.SM}
      title={label}
      variant={ButtonVariantEnum.SURFACE}
      onClick={() => {
        window.location.href = href;
      }}
    />
  );
}
