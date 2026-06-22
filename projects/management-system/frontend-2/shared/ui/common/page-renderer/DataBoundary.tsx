"use client";

import { ReactNode, useMemo } from "react";

import { ComponentSizeEnum, Loader } from "@fieldflow360/org-ui";

import { EmptyState, EmptyStateProps } from "./EmptyState";
import { ErrorState } from "./ErrorState";

export interface DataBoundaryProps<T> {
  isLoading: boolean;
  data: T[] | { results: T[] } | null | undefined;
  error?: Error | null;
  emptyState: EmptyStateProps;
  loadingMessage?: string;
  children: (data: T[]) => ReactNode;
  className?: string;
  /**
   * If true, renders children alongside empty state instead of replacing it.
   * Useful when you need to keep navigation/tabs visible even when data is empty.
   */
  renderChildrenWhenEmpty?: boolean;
}

/**
 * Data boundary component that handles loading, error, and empty states
 * for data rendering. Automatically normalizes data to an array format.
 */
export function DataBoundary<T>({
  isLoading,
  data,
  error,
  emptyState,
  loadingMessage = "Loading...",
  children,
  className,
  renderChildrenWhenEmpty = false,
}: DataBoundaryProps<T>) {
  // Normalize data to always be an array
  const normalizedData = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "results" in data) {
      return Array.isArray(data.results) ? data.results : [];
    }
    return [];
  }, [data]);

  // Handle loading state
  if (isLoading) {
    return (
      <Loader
        className={className}
        size={ComponentSizeEnum.MD}
        text={loadingMessage}
      />
    );
  }

  // Handle error state
  if (error) {
    return (
      <ErrorState
        className={className}
        description={error.message || "An error occurred while loading data"}
        error={error}
        title={emptyState.title || "Error loading data"}
      />
    );
  }

  // Handle empty state
  if (normalizedData.length === 0) {
    // If renderChildrenWhenEmpty is true, render both empty state and children
    if (renderChildrenWhenEmpty) {
      return <>{children(normalizedData)}</>;
    }
    return <EmptyState {...emptyState} className={className} />;
  }

  // Render content with normalized data
  return <>{children(normalizedData)}</>;
}
