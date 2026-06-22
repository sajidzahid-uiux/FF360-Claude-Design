"use client";

import { ReactNode } from "react";

import type { EmptyStateProps } from "@/shared/ui/common/page-renderer";
import {
  DataBoundary,
  PageContainer,
  PageHeader,
} from "@/shared/ui/common/page-renderer";

interface PageRendererProps<T = unknown> {
  // Header props
  title: string;
  description?: string;
  /** Rendered on the opposite side of the title in the header */
  headerActions?: ReactNode;

  // Data boundary props
  isLoading: boolean;
  data: T[] | { results: T[] } | null | undefined;
  error?: Error | null;
  emptyState: EmptyStateProps;
  loadingMessage?: string;
  renderChildrenWhenEmpty?: boolean;

  // Content to render inside DataBoundary
  children: (data: T[]) => ReactNode;
  /** PageContainer padding; use `none` inside settings layouts that already pad content. */
  padding?: "none" | "sm" | "md" | "lg" | "responsive";
}

/**
 * Generic PageRenderer component that handles page layout, header, and data boundaries.
 * This component should only care about:
 * - Page layout (PageContainer)
 * - Page header (PageHeader)
 * - Data boundary (loading, error, empty states via DataBoundary)
 *
 * Forms, modals, and other business logic should be handled by the page components or their child components.
 */
export function PageRenderer<T = unknown>({
  title,
  description,
  headerActions,
  isLoading,
  data,
  error,
  emptyState,
  loadingMessage = "Loading...",
  renderChildrenWhenEmpty = false,
  padding = "md",

  children,
}: PageRendererProps<T>) {
  return (
    <PageContainer padding={padding}>
      <PageHeader
        actions={headerActions}
        description={description}
        title={title}
      />
      <DataBoundary<T>
        {...{
          data,
          emptyState,
          error,
          isLoading,
          loadingMessage,
          renderChildrenWhenEmpty,
        }}
      >
        {children}
      </DataBoundary>
    </PageContainer>
  );
}
