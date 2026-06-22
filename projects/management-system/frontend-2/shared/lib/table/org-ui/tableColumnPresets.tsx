"use client";

import type { ReactNode } from "react";

import { type Column, TableHeaderLabel } from "@fieldflow360/org-ui";
import type { LucideIcon } from "lucide-react";
import { Calendar, FileClock, Phone } from "lucide-react";

import type { ContactInfo, TeamMember } from "@/api/types";

import {
  TableLastUpdatedCell,
  TableLocaleDateCell,
  TablePhoneCell,
  TableTouchSlideTextCell,
  TableTruncatedTextCell,
} from "./tableColumnCells";
import {
  formatTableIsoDate,
  formatTableLastUpdatedWithMemberId,
  formatTableLastUpdatedWithUsername,
} from "./tableDateFormat";

export function resolveContactPhone(
  contactInfo: ContactInfo | null | undefined,
  fallback = "N/A"
): string {
  return (
    contactInfo?.phone_number?.trim() ||
    contactInfo?.home_phone_number?.trim() ||
    fallback
  );
}

export function orgUiLastUpdatedWithUsernameColumn<
  T extends { id: string | number },
>({
  key = "last_updated",
  label = "Last Updated",
  sortable = true,
  width = "168px",
  truncateHeader = true,
  getDate,
  getUsername,
}: {
  key?: string;
  label?: string;
  sortable?: boolean;
  width?: string;
  truncateHeader?: boolean;
  getDate: (row: T) => string | undefined;
  getUsername: (row: T) => string | null | undefined;
}): Column<T> {
  return {
    key,
    label,
    sortable,
    width,
    header: (
      <TableHeaderLabel
        icon={FileClock}
        label={label}
        truncate={truncateHeader}
      />
    ),
    render: (row) => {
      const text = formatTableLastUpdatedWithUsername(
        getDate(row),
        getUsername(row)
      );
      return <TableLastUpdatedCell label={text} />;
    },
  };
}

export function orgUiLastUpdatedWithMemberColumn<
  T extends { id: string | number },
>({
  key = "last_updated",
  label = "Last Updated",
  sortable = true,
  width = "168px",
  truncateHeader = true,
  teamData,
  getDate,
  getMemberId,
}: {
  key?: string;
  label?: string;
  sortable?: boolean;
  width?: string;
  truncateHeader?: boolean;
  teamData: TeamMember[] | undefined;
  getDate: (row: T) => string | undefined;
  getMemberId: (row: T) => number | undefined;
}): Column<T> {
  return {
    key,
    label,
    sortable,
    width,
    header: (
      <TableHeaderLabel
        icon={FileClock}
        label={label}
        truncate={truncateHeader}
      />
    ),
    render: (row) => {
      const text = formatTableLastUpdatedWithMemberId(
        getDate(row),
        getMemberId(row),
        teamData
      );
      return <TableLastUpdatedCell label={text} />;
    },
  };
}

export function orgUiLocaleDateColumn<T extends { id: string | number }>({
  key,
  label,
  icon = Calendar,
  sortable = false,
  width,
  getValue,
  emptyLabel = "—",
  tabularNums = false,
  truncateHeader = false,
}: {
  key: string;
  label: string;
  icon?: LucideIcon | ReactNode;
  sortable?: boolean;
  width?: string;
  getValue: (row: T) => string | undefined | null;
  emptyLabel?: "N/A" | "—" | "-";
  tabularNums?: boolean;
  truncateHeader?: boolean;
}): Column<T> {
  return {
    key,
    label,
    sortable,
    width,
    header: (
      <TableHeaderLabel icon={icon} label={label} truncate={truncateHeader} />
    ),
    render: (row) => (
      <TableLocaleDateCell
        emptyLabel={emptyLabel}
        tabularNums={tabularNums}
        value={getValue(row)}
      />
    ),
  };
}

export function orgUiIsoDateColumn<T extends { id: string | number }>({
  key,
  label,
  icon = Calendar,
  sortable = false,
  width,
  getValue,
  truncateHeader = true,
}: {
  key: string;
  label: string;
  icon?: LucideIcon | ReactNode;
  sortable?: boolean;
  width?: string;
  getValue: (row: T) => string | undefined | null;
  truncateHeader?: boolean;
}): Column<T> {
  return {
    key,
    label,
    sortable,
    width,
    header: (
      <TableHeaderLabel icon={icon} label={label} truncate={truncateHeader} />
    ),
    render: (row) => (
      <span className="text-sm">{formatTableIsoDate(getValue(row))}</span>
    ),
  };
}

export function orgUiTruncatedTextColumn<T extends { id: string | number }>({
  key,
  label,
  icon,
  width,
  sortable = false,
  truncateHeader = false,
  getText,
  muted = false,
  tabularNums = false,
  emptyLabel = "—",
}: {
  key: string;
  label: string;
  icon?: LucideIcon | ReactNode;
  width?: string;
  sortable?: boolean;
  truncateHeader?: boolean;
  getText: (row: T) => string | null | undefined;
  muted?: boolean;
  tabularNums?: boolean;
  emptyLabel?: string;
}): Column<T> {
  return {
    key,
    label,
    sortable,
    width,
    cellClassName: width ? "min-w-0" : undefined,
    header: (
      <TableHeaderLabel icon={icon} label={label} truncate={truncateHeader} />
    ),
    render: (row) => (
      <TableTruncatedTextCell
        emptyLabel={emptyLabel}
        muted={muted}
        tabularNums={tabularNums}
        text={getText(row)}
      />
    ),
  };
}

export function orgUiTouchSlideTextColumn<T extends { id: string | number }>({
  key,
  label,
  icon,
  width,
  sortable = false,
  truncateHeader = true,
  maxWidth,
  getText,
  onDoubleClick,
  emptyLabel = "—",
}: {
  key: string;
  label: string;
  icon?: LucideIcon | ReactNode;
  width?: string;
  sortable?: boolean;
  truncateHeader?: boolean;
  maxWidth: string;
  getText: (row: T) => string | null | undefined;
  onDoubleClick?: (row: T) => void;
  emptyLabel?: string;
}): Column<T> {
  return {
    key,
    label,
    sortable,
    width,
    cellClassName: "min-w-0",
    header: (
      <TableHeaderLabel icon={icon} label={label} truncate={truncateHeader} />
    ),
    render: (row) => (
      <TableTouchSlideTextCell
        emptyLabel={emptyLabel}
        maxWidth={maxWidth}
        text={getText(row)}
        onDoubleClick={onDoubleClick ? () => onDoubleClick(row) : undefined}
      />
    ),
  };
}

export function orgUiPhoneColumn<T extends { id: string | number }>({
  key,
  label = "Phone",
  width = "124px",
  truncateHeader = true,
  getPhone,
  fallback = "N/A",
}: {
  key: string;
  label?: string;
  width?: string;
  truncateHeader?: boolean;
  getPhone: (row: T) => string | null | undefined;
  fallback?: string;
}): Column<T> {
  return {
    key,
    label,
    width,
    header: (
      <TableHeaderLabel icon={Phone} label={label} truncate={truncateHeader} />
    ),
    render: (row) => (
      <TablePhoneCell fallback={fallback} phone={getPhone(row)} />
    ),
  };
}
