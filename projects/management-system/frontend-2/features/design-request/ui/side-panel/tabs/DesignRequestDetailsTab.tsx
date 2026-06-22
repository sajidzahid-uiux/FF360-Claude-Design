"use client";

import { useMemo, useState } from "react";

import {
  Input,
  TabsSwitcher,
  TabsSwitcherViewEnum,
  cn,
} from "@fieldflow360/org-ui";
import { formatDate } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";

import type { DesignRequestStatus } from "@/api/types/designRequest";

import {
  DIRECTION_OPTIONS,
  LINE_TYPE_TABS,
  type LineTypeKey,
  type LineTypeParamsFormFields,
} from "../../../lib/constants";
import type { DesignRequestEntityContext } from "../../../lib/design-request-entity-context";
import type { DesignRequestSubmittedSnapshot } from "../../../lib/design-request-snapshot";

export interface DesignRequestDetailsTabProps {
  status: DesignRequestStatus;
  updatedAt: string;
  entity: DesignRequestEntityContext;
  snapshot?: DesignRequestSubmittedSnapshot;
}

function directionLabel(value: string): string {
  return (
    DIRECTION_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

function emptyFields(): LineTypeParamsFormFields {
  return {
    min_depth: "",
    optimal_depth: "",
    max_depth: "",
    min_slope: "",
    outlet_to_optimal_distance: "",
  };
}

function TimelineStep({
  complete,
  description,
  isLast,
  showConnector,
  subtitle,
  title,
  titleClassName,
}: {
  complete: boolean;
  description?: string;
  isLast?: boolean;
  showConnector?: boolean;
  subtitle: string;
  title: string;
  titleClassName?: string;
}) {
  const Icon = complete ? CheckCircle2 : Circle;

  return (
    <li className="flex gap-3">
      <div className="flex w-5 shrink-0 flex-col items-center">
        <Icon
          aria-hidden
          className={cn(
            "h-5 w-5 shrink-0",
            complete ? "text-emerald-600" : "text-border-subtle"
          )}
        />
        {!isLast && showConnector ? (
          <div
            aria-hidden
            className={cn(
              "my-1 min-h-6 w-0.5 flex-1 rounded-full",
              complete ? "bg-emerald-600" : "bg-border-subtle"
            )}
          />
        ) : null}
      </div>
      <div className={cn("min-w-0 flex-1", !isLast && "pb-5")}>
        <p
          className={cn(
            "text-sm font-medium",
            titleClassName ?? "text-text-primary"
          )}
        >
          {title}
        </p>
        <p className="text-text-muted text-xs">{subtitle}</p>
        {description ? (
          <p className="text-text-muted mt-1 text-xs">{description}</p>
        ) : null}
      </div>
    </li>
  );
}

export function DesignRequestDetailsTab({
  status,
  updatedAt,
  entity,
  snapshot,
}: DesignRequestDetailsTabProps) {
  const [activeLineType, setActiveLineType] = useState<LineTypeKey>("submain");

  const requestedAt = snapshot?.submittedAt ?? updatedAt;
  const activeFields = snapshot?.[activeLineType] ?? emptyFields();

  const showApprovedStep =
    status === "approved" || status === "in_progress" || status === "shared";

  const spacing = snapshot?.spacing ?? "—";
  const direction = snapshot?.direction;

  const requestedBy = useMemo(() => {
    if (snapshot?.requestedByName) {
      return `${snapshot.requestedByName} (CMS)`;
    }
    return entity.requestedByName ? `${entity.requestedByName} (CMS)` : "—";
  }, [entity.requestedByName, snapshot?.requestedByName]);

  return (
    <div className="space-y-6">
      <section className="bg-bg-surface border-border-subtle space-y-3 rounded-lg border p-5">
        <h4 className="text-text-primary text-base font-semibold">
          Request Timeline
        </h4>
        <ol className="space-y-0">
          <TimelineStep
            complete
            showConnector={showApprovedStep}
            subtitle={formatDate(new Date(requestedAt), "PPpp")}
            title="Request Sent"
          />
          {showApprovedStep ? (
            <TimelineStep
              complete
              isLast
              description="Collaboration features are now active. Switch to Chat or Files tab to begin."
              subtitle={formatDate(new Date(updatedAt), "PPpp")}
              title="Request Approved (Work in progress)"
              titleClassName="text-emerald-600"
            />
          ) : null}
        </ol>
      </section>

      <section className="bg-bg-surface border-border-subtle space-y-2 rounded-lg border p-5">
        <h4 className="text-text-primary text-base font-semibold">
          Request Details
        </h4>
        <dl className="divide-border divide-y text-sm">
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-muted">Organization</dt>
            <dd className="text-text-primary text-right font-medium">
              {entity.organizationName || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-muted">Client</dt>
            <dd className="text-text-primary text-right font-medium">
              {entity.clientName || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-muted">Farm</dt>
            <dd className="text-text-primary text-right font-medium">
              {entity.farmName || "—"}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-muted">Job Reference</dt>
            <dd className="text-text-primary text-right font-medium">
              {entity.jobTitle}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-muted">Requested At</dt>
            <dd className="text-text-primary text-right font-medium">
              {formatDate(new Date(requestedAt), "PPpp")}
            </dd>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <dt className="text-text-muted">Requested By</dt>
            <dd className="text-text-primary text-right font-medium">
              {requestedBy}
            </dd>
          </div>
          {direction ? (
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-text-muted">Direction</dt>
              <dd className="text-text-primary text-right font-medium">
                {directionLabel(direction)}
              </dd>
            </div>
          ) : null}
          {snapshot ? (
            <div className="flex items-center justify-between py-2.5">
              <dt className="text-text-muted">Spacing</dt>
              <dd className="text-text-primary text-right font-medium">
                {spacing}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      {snapshot ? (
        <section className="bg-bg-surface border-border-subtle space-y-3 rounded-lg border p-5">
          <TabsSwitcher
            items={LINE_TYPE_TABS.map(({ id, label }) => ({
              value: id,
              label,
            }))}
            value={activeLineType}
            view={TabsSwitcherViewEnum.UNDERLINED}
            onChange={(tab) => setActiveLineType(tab)}
          />
          <h5 className="text-text-primary text-sm font-semibold">
            Depth Organization Settings
          </h5>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input
              disabled
              readOnly
              label="Minimum Depth"
              value={activeFields.min_depth}
            />
            <Input
              disabled
              readOnly
              label="Optimal"
              value={activeFields.optimal_depth}
            />
            <Input
              disabled
              readOnly
              label="max"
              value={activeFields.max_depth}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              disabled
              readOnly
              label="Minimum Slope"
              value={activeFields.min_slope}
            />
            <Input
              disabled
              readOnly
              label="Outlet to Optimal"
              value={activeFields.outlet_to_optimal_distance}
            />
          </div>
        </section>
      ) : (
        <p className="text-text-muted text-sm">
          Design parameters were submitted with this request. Reopen after
          sending from this session to view the parameter snapshot here.
        </p>
      )}
    </div>
  );
}
