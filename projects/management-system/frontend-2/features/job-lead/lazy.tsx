"use client";

import dynamic from "next/dynamic";

import { RouteContentLoading } from "@/shared/ui/layout/RouteContentLoading";

import type { JobLeadDetailRoutePageProps } from "./ui/JobLeadDetailRoutePage";
import type { JobLeadListRoutePageProps } from "./ui/JobLeadListRoutePage";
import type { JobLeadLogsRoutePageProps } from "./ui/JobLeadLogsRoutePage";

const routeLoading = () => <RouteContentLoading />;

export const LazyJobLeadDetailRoutePage = dynamic<JobLeadDetailRoutePageProps>(
  () =>
    import("./ui/JobLeadDetailRoutePage").then(
      (module) => module.JobLeadDetailRoutePage
    ),
  { loading: routeLoading }
);

export const LazyJobLeadListRoutePage = dynamic<JobLeadListRoutePageProps>(
  () =>
    import("./ui/JobLeadListRoutePage").then(
      (module) => module.JobLeadListRoutePage
    ),
  { loading: routeLoading }
);

export const LazyJobLeadLogsRoutePage = dynamic<JobLeadLogsRoutePageProps>(
  () =>
    import("./ui/JobLeadLogsRoutePage").then(
      (module) => module.JobLeadLogsRoutePage
    ),
  { loading: routeLoading }
);
