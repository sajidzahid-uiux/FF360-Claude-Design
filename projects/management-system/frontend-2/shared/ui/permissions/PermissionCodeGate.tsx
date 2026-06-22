import { FC, ReactNode, useMemo } from "react";

import { PermissionCode } from "@/constants";
import { useHasPermission } from "@/hooks/queries";

interface PermissionCodeGateProps {
  permissionCode?: PermissionCode;
  permissionCodes?: PermissionCode[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on whether the user
 * has a specific permission code.
 */
export const PermissionCodeGate: FC<PermissionCodeGateProps> = ({
  permissionCode,
  permissionCodes,
  children,
  fallback = null,
}) => {
  const codes = useMemo(
    () =>
      Array.from(
        new Set(
          [...(permissionCodes ?? []), permissionCode].filter(
            Boolean
          ) as PermissionCode[]
        )
      ),
    [permissionCode, permissionCodes]
  );

  const { hasAnyPermission, isLoading } = useHasPermission(codes);

  if (isLoading) return null;
  if (!hasAnyPermission()) return <>{fallback}</>;
  return <>{children}</>;
};
