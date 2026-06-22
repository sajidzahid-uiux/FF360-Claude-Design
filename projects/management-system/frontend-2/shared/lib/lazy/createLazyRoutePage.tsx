"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import { RouteContentLoading } from "@/shared/ui/layout/RouteContentLoading";

function routeLoading() {
  return <RouteContentLoading />;
}

export function createLazyRoutePage<P extends object = Record<string, never>>(
  loader: () => Promise<{ default: ComponentType<P> }>
) {
  return dynamic(loader, { loading: routeLoading });
}
