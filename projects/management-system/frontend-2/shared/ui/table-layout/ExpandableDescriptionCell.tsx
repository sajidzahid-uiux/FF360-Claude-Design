"use client";

import { useState } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { JobOrLeadListNameText } from "../JobOrLeadListNameText";

interface ExpandableDescriptionCellProps {
  title: string;
  description?: string;
  isOverdue?: boolean;
  truncateLength?: number;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function ExpandableDescriptionCell({
  title,
  description,
  isOverdue = false,
  truncateLength = 40,
  titleClassName = "",
  descriptionClassName = "",
}: ExpandableDescriptionCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const descriptionExists = description && description.length > 0;
  const needsTruncation = description && description.length > truncateLength;

  if (!descriptionExists) {
    return (
      <JobOrLeadListNameText
        className={`${isOverdue ? "text-feedback-error" : ""} ${titleClassName}`}
        name={title}
      />
    );
  }

  // If description is short enough, no need for expansion
  if (!needsTruncation) {
    return (
      <div className="flex flex-col gap-1">
        <JobOrLeadListNameText
          className={`flex-1 ${isOverdue ? "text-feedback-error" : ""} ${titleClassName}`}
          name={title}
        />
        <div
          className={`w-full text-xs break-words whitespace-normal ${
            isOverdue ? "text-feedback-error" : "text-text-muted"
          } ${descriptionClassName}`}
        >
          {description}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <JobOrLeadListNameText
            className={`${isOverdue ? "text-feedback-error" : ""} ${titleClassName}`}
            name={title}
          />
        </div>
      </div>
      {!isOpen ? (
        <div
          className={`w-full text-xs break-words whitespace-normal ${
            isOverdue ? "text-feedback-error" : "text-text-muted"
          } ${descriptionClassName}`}
        >
          {description.substring(0, truncateLength)}...
        </div>
      ) : (
        <div
          className={`max-h-[200px] w-full overflow-y-auto text-xs break-words whitespace-normal ${
            isOverdue ? "text-feedback-error" : "text-text-muted"
          } ${descriptionClassName}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
