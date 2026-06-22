"use client";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

export function RouteContentLoading() {
  return (
    <Loader
      className="min-h-[40vh]"
      size={ComponentSizeEnum.SM}
      text="Loading…"
    />
  );
}
