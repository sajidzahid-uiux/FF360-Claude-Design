"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import { useContact, useContactActivityLogs, useRouteIds } from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import { getHttpErrorStatus } from "@/lib/utils";
import { orgPath } from "@/shared/config/routes";
import { ResourceErrorView } from "@/shared/ui/common";
import { useCmsBreadcrumbLabel } from "@/shared/ui/layout/cmsBreadcrumbOverrides";
import { AccessDeniedView } from "@/shared/ui/permissions";

import { mapActivityLogsToLeadRows } from "../utils/mapActivityLogsToLeadRows";
import { ActivityLogSubpageLayout } from "./ActivityLogSubpageLayout";
import { ActivityLogTable } from "./ActivityLogTable";

export function ContactActivityLogPage() {
  const params = useParams();
  const { orgId } = useRouteIds();
  const { read: canViewPage } = useRoutePermissions() || {};

  const contactIdRaw = params.id as string;
  const contactId = Number(contactIdRaw);
  const { data: contact, isLoading } = useContact(
    Number.isNaN(contactId) ? null : contactId
  );

  const detailPath = orgId ? orgPath(orgId, `/contact/${contactIdRaw}`) : "";

  useCmsBreadcrumbLabel(
    contact?.full_name,
    detailPath ? { targetPath: detailPath } : undefined
  );

  const {
    data: activityPage,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErrorObj,
  } = useContactActivityLogs(contactIdRaw);

  const rows = useMemo(
    () => mapActivityLogsToLeadRows(activityPage?.results ?? []),
    [activityPage?.results]
  );

  if (!canViewPage) {
    return (
      <AccessDeniedView message="You do not have permission to view logs." />
    );
  }

  if (isLoading) {
    return (
      <Loader
        className="min-h-[40vh]"
        size={ComponentSizeEnum.SM}
        text="Loading..."
      />
    );
  }

  if (!contact) {
    return <p className="text-text-muted p-6 text-sm">Contact not found.</p>;
  }

  const subtitle = contact.full_name?.trim() || "No contact information";
  const phone = contact.phone_number || contact.home_phone_number;
  const meta = phone ? (
    <p className="text-text-muted text-sm">{phone}</p>
  ) : null;

  return (
    <ActivityLogSubpageLayout
      backLabel="Back to contact"
      badge="Contact logs"
      detailButtonLabel="View contact details"
      detailHref={detailPath || `/contact/${contactIdRaw}`}
      meta={meta}
      subtitle={subtitle}
    >
      {logsError ? (
        <ResourceErrorView
          orgId={orgId}
          resourceLabel="activity logs"
          status={getHttpErrorStatus(logsErrorObj)}
        />
      ) : (
        <ActivityLogTable
          isLoading={logsLoading}
          rows={rows}
          storageKey={
            orgId ? `contact-activity-log:${orgId}:${contactIdRaw}` : undefined
          }
        />
      )}
    </ActivityLogSubpageLayout>
  );
}
