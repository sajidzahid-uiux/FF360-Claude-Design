"use client";

import { Button, cn } from "@fieldflow360/org-ui";
import { AlertCircle } from "lucide-react";

export interface ErrorStateProps {
  error: Error | string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function ErrorState({
  error,
  title,
  description,
  action,
  className,
}: ErrorStateProps) {
  const errorMessage =
    typeof error === "string" ? error : error.message || "An error occurred";

  return (
    <section
      aria-label={`Error: ${errorMessage}`}
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
      role="alert"
    >
      <div className="text-feedback-error mb-4">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="text-text-primary mb-2 text-lg font-semibold">
        {title || "Something went wrong"}
      </h3>
      <p className="text-text-muted mb-6 max-w-md text-sm">
        {description || errorMessage}
      </p>
      {action ? (
        <Button
          aria-label={action.label}
          title={action.label}
          onClick={action.onClick}
        />
      ) : null}
    </section>
  );
}
