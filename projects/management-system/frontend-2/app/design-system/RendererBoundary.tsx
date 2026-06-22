"use client";

import { Component, ReactNode } from "react";

/**
 * Isolates a single component renderer so a runtime error in one showcase item
 * (e.g. a map needing an API key) shows a friendly message instead of crashing
 * the whole design-system page.
 */
export class RendererBoundary extends Component<
  { name: string; children: ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { name: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidUpdate(prevProps: { name: string }) {
    // Reset when switching to a different component.
    if (prevProps.name !== this.props.name && this.state.hasError) {
      this.setState({ hasError: false, message: undefined });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          <p className="font-semibold">
            “{this.props.name}” couldn’t render in this prototype environment.
          </p>
          <p className="mt-1">
            This usually means it needs runtime config not available here (e.g. a
            Google Maps API key). The component itself is fine in the CMS.
          </p>
          {this.state.message ? (
            <pre className="mt-3 overflow-x-auto rounded bg-amber-100 p-2 text-xs dark:bg-amber-900/40">
              {this.state.message}
            </pre>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}
