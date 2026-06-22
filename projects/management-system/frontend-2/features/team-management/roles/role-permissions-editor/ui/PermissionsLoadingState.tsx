"use client";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

export function PermissionsLoadingState() {
  return (
    <Loader
      centerInContainer={false}
      className="py-8"
      size={ComponentSizeEnum.SM}
      text="Loading permissions..."
    />
  );
}
