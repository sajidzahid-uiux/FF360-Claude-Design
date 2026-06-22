"use client";

import { ReactNode } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { ArrowLeft } from "lucide-react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  backButton = false,
  onBack,
}: PageHeaderProps) {
  const hasTitle = title.trim().length > 0;

  return (
    <>
      {/* Header Content */}
      {(hasTitle || description || actions || (backButton && onBack)) && (
        <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="mt-2 flex min-w-0 flex-1 flex-col gap-[4px] pb-2 xl:pr-4">
            {backButton && onBack && (
              <Button
                className="mb-2 -ml-2"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
                size={ComponentSizeEnum.SM}
                title="Back"
                variant={ButtonVariantEnum.GHOST}
                onClick={onBack}
              />
            )}

            {hasTitle ? (
              <h1 className="text-text-primary text-2xl leading-7 font-bold sm:text-4xl">
                {title}
              </h1>
            ) : null}

            {description ? (
              <p className="text-text-muted">{description}</p>
            ) : null}
          </div>

          {actions ? (
            <div className="mt-0 flex w-full min-w-0 flex-wrap items-center gap-2 xl:mt-4 xl:w-auto xl:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
