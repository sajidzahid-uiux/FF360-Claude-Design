"use client";

import { useMemo } from "react";

import { TableActions } from "@fieldflow360/org-ui";

import {
  JOB_DETAIL_OVERFLOW_MENU_ITEM,
  type JobDetailOverflowActionParams,
  buildJobDetailOverflowActions,
} from "@/features/job-lead";

export type JobDetailOverflowMenuProps = JobDetailOverflowActionParams;

export function JobDetailOverflowMenu(props: JobDetailOverflowMenuProps) {
  const actions = useMemo(() => buildJobDetailOverflowActions(props), [props]);

  if (actions.length === 0) {
    return null;
  }

  return (
    <TableActions
      actions={actions}
      collapseOnTouch={false}
      item={JOB_DETAIL_OVERFLOW_MENU_ITEM}
      maxVisibleActions={0}
    />
  );
}
