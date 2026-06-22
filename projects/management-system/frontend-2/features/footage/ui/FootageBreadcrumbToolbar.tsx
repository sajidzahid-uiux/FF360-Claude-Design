"use client";

import { useEffect, useMemo } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from "@fieldflow360/org-ui";
import { ChartBar } from "lucide-react";

import { BreadcrumbToolbarLayout } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-layout";
import { useSetCmsBreadcrumbToolbar } from "@/shared/ui/layout/cms-breadcrumb-toolbar/breadcrumb-toolbar-store";

export interface FootageBreadcrumbToolbarProps {
  onOpenCharts: () => void;
}

export function FootageBreadcrumbToolbar({
  onOpenCharts,
}: FootageBreadcrumbToolbarProps) {
  const { setBreadcrumbToolbar } = useSetCmsBreadcrumbToolbar();

  const toolbarNode = useMemo(
    () => (
      <BreadcrumbToolbarLayout
        actions={
          <Button
            iconOnly
            aria-label="View footage statistics"
            leftIcon={
              <ChartBar aria-hidden className="h-4 w-4" strokeWidth={2.25} />
            }
            size={ComponentSizeEnum.SM}
            variant={ButtonVariantEnum.GHOST}
            onClick={onOpenCharts}
          />
        }
      />
    ),
    [onOpenCharts]
  );

  useEffect(() => {
    setBreadcrumbToolbar(toolbarNode);
    return () => {
      setBreadcrumbToolbar(null);
    };
  }, [setBreadcrumbToolbar, toolbarNode]);

  return null;
}
