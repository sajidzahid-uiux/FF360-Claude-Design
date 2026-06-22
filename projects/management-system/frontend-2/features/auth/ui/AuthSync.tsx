"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";

import { useAuth0 } from "@auth0/auth0-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { PermissionsService } from "@/api/services";
import { OrganizationMember } from "@/api/types/common";
import { registerAuthRuntimeActions } from "@/features/auth/model/auth-actions";
import { useAuthStore } from "@/features/auth/model/auth-store";
import type {
  AuthRoleDetails,
  AuthUser,
} from "@/features/auth/model/auth-types";
import { StorageKey } from "@/hooks/storage-data";
import { usePersistentStorage } from "@/hooks/usePersistentStorage";
import { orgDashboardPath, signInLogoutReturnUrl } from "@/lib/auth-routes";
import { setSignOutFreshMarker } from "@/lib/auth-sign-out";
import axiosInstance from "@/lib/axios";
import {
  TIME_CONSTANTS,
  getCookie,
  removeCookie,
  setCookie,
} from "@/lib/cookies";
import { useUserStore } from "@/shared/model/user-store";

export function AuthSync({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const storage = usePersistentStorage();

  const setCurrentUser = useAuthStore((state) => state.setCurrentUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setSelectedOrganizationState = useAuthStore(
    (state) => state.setSelectedOrganization
  );
  const setFreshLogin = useAuthStore((state) => state.setFreshLogin);
  const resetAuthStore = useAuthStore((state) => state.reset);
  const selectedOrganization = useAuthStore(
    (state) => state.selectedOrganization
  );
  const freshLogin = useAuthStore((state) => state.freshLogin);

  const [debouncedOrg, setDebouncedOrg] = useState<string | null>(
    selectedOrganization
  );
  const [authSetupDone, setAuthSetupDone] = useState(false);

  const {
    logout: auth0Logout,
    user: auth0User,
    isAuthenticated,
    getAccessTokenSilently,
    isLoading: auth0Loading,
  } = useAuth0();

  const isTokenExpired = useCallback(() => {
    const token = getCookie(StorageKey.ACCESS_TOKEN);
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    resetAuthStore();
    setFreshLogin(true);
    removeCookie(StorageKey.ACCESS_TOKEN);
    removeCookie("lastOrgId");
    storage.clear();
    useUserStore.getState().clearTrialSubscription();
    delete axiosInstance.defaults.headers.common["Authorization"];
    setSignOutFreshMarker();
    await auth0Logout({ logoutParams: { returnTo: signInLogoutReturnUrl() } });
    queryClient.clear();
  }, [auth0Logout, queryClient, resetAuthStore, setFreshLogin, storage]);

  const refreshToken = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        timeoutInSeconds: 60,
        cacheMode: "off",
      });
      setCookie(StorageKey.ACCESS_TOKEN, token, 7);
      axiosInstance.defaults.headers.common["Authorization"] = `JWT ${token}`;
    } catch (e: unknown) {
      const authError = e as { error?: string };
      if (
        authError.error === "login_required" ||
        authError.error === "consent_required"
      ) {
        console.error("Token refresh failed, logging out:", e);
        handleLogout();
      }
      console.error("Error refreshing token:", e);
      handleLogout();
      throw new Error("Session expired. Please log in again.");
    }
  }, [getAccessTokenSilently, handleLogout]);

  const getAccessToken = useCallback(async () => {
    try {
      if (isTokenExpired()) {
        await refreshToken();
      }
      return getCookie(StorageKey.ACCESS_TOKEN);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }, [isTokenExpired, refreshToken]);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["user", auth0User?.email],
    queryFn: async () => {
      if (!auth0User?.email) return null;
      const token = await getAccessToken();
      if (!token) return null;

      const response = await axiosInstance.get("/auth/users/");
      const users = response.data;
      const foundUser = users.find(
        (user: AuthUser) => user.email === auth0User.email
      );
      return foundUser ?? null;
    },
    enabled: !!auth0User?.email && isAuthenticated,
  });

  const fetchOrganizations = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) throw new Error("No access token available");

    const response = await axiosInstance.get("/ms/organizations/");
    return response.data;
  }, [getAccessToken]);

  useEffect(() => {
    if (!selectedOrganization) {
      setDebouncedOrg(null);
      return;
    }
    const handler = setTimeout(() => {
      setDebouncedOrg(selectedOrganization);
    }, 200);

    return () => clearTimeout(handler);
  }, [selectedOrganization]);

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ["role", debouncedOrg, isAuthenticated],
    queryFn: async () => {
      if (!debouncedOrg) return null;
      const token = await getAccessToken();
      if (!token) return null;

      const response = await axiosInstance.get(
        `/ms/organizations/${debouncedOrg}/members/`
      );

      const members = response.data as OrganizationMember[];
      const userEmail = userData?.email || auth0User?.email;
      const currentMember =
        members.find((m) => m?.user?.email === userEmail) || members[0];

      if (!currentMember) {
        return null;
      }

      let roleDetails: AuthRoleDetails | null = null;
      const roleId = currentMember.role_fk?.id || currentMember.role_id;
      const isOwner = currentMember.owner || false;

      if (roleId) {
        roleDetails = {
          id: roleId,
          name: currentMember.role_fk?.name || null,
          is_admin: currentMember.role_fk?.is_admin || false,
          is_default: currentMember.role_fk?.is_default || false,
          organization: currentMember.role_fk?.organization || null,
          is_owner: isOwner,
        };
      } else {
        console.warn("AuthSync - No role_id or role_fk.id found for member");
      }

      storage.setItem(StorageKey.IS_OWNER, JSON.stringify(isOwner));
      storage.setItem(StorageKey.MEMBER_ID, currentMember.id?.toString() || "");

      return roleDetails;
    },
    enabled: !!debouncedOrg && isAuthenticated,
  });

  const { data: userPermissionsData, isLoading: userPermissionsLoading } =
    useQuery({
      queryKey: ["userPermissions", debouncedOrg, isAuthenticated],
      queryFn: async () => {
        if (!debouncedOrg) return null;
        try {
          return await PermissionsService.getMyPermissions(debouncedOrg);
        } catch (error) {
          console.error("Error fetching user permissions:", error);
          return null;
        }
      },
      enabled: !!debouncedOrg && isAuthenticated,
    });

  useEffect(() => {
    if (userPermissionsData) {
      try {
        storage.setItem("userPermissions", JSON.stringify(userPermissionsData));

        const permissionCodes = [...userPermissionsData.permission_codes];
        if (userPermissionsData.role?.name === "Admin") {
          permissionCodes.push("is_admin");
        }
        if (userPermissionsData.role?.name === "Bookkeeper") {
          permissionCodes.push("is_bookkeeper");
        }

        storage.setItem(StorageKey.PERM_CODES, JSON.stringify(permissionCodes));
        storage.setItem(
          StorageKey.USER_ROLE,
          JSON.stringify(userPermissionsData.role)
        );
      } catch (error) {
        console.error("Failed to store user permissions:", error);
      }
    }
  }, [userPermissionsData, storage]);

  useEffect(() => {
    if (isAuthenticated) {
      const refreshInterval = setInterval(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error("Token refresh failed:", error);
        }
      }, 7 * TIME_CONSTANTS.ONE_HOUR);

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, refreshToken]);

  useEffect(() => {
    const setupAuth = async () => {
      if (isAuthenticated && auth0User) {
        try {
          const token = await getAccessToken();
          if (token) {
            axiosInstance.defaults.headers.common["Authorization"] =
              `JWT ${token}`;
          }
        } catch (error) {
          console.error("Error in auth setup:", error);
        }
      }
      setAuthSetupDone(true);
    };

    void setupAuth();
  }, [auth0User, getAccessToken, isAuthenticated]);

  useEffect(() => {
    if (roleData || userData || auth0User) {
      setCurrentUser({
        ...userData,
        ...auth0User,
        roleDetails: roleData,
      });
    }
  }, [auth0User, roleData, setCurrentUser, userData]);

  useEffect(() => {
    if (isAuthenticated && !selectedOrganization) {
      const lastOrgId = getCookie("lastOrgId");
      if (!lastOrgId) {
        setFreshLogin(true);
      }
    }
  }, [isAuthenticated, selectedOrganization, setFreshLogin]);

  const syncOrgFromUrl = useCallback(
    (orgId: string) => {
      if (freshLogin) {
        return;
      }

      if (orgId && orgId !== selectedOrganization) {
        setSelectedOrganizationState(orgId);
        setCookie("lastOrgId", orgId, 30);
      }
    },
    [freshLogin, selectedOrganization, setSelectedOrganizationState]
  );

  const setSelectedOrganization = useCallback(
    (orgId: string, navigate: boolean = false) => {
      setSelectedOrganizationState(orgId);
      setCookie("lastOrgId", orgId, 30);
      setFreshLogin(false);
      queryClient.invalidateQueries({ queryKey: ["role", orgId] });
      queryClient.invalidateQueries({ queryKey: ["userPermissions", orgId] });

      if (navigate && typeof window !== "undefined") {
        window.location.href = orgDashboardPath(orgId);
      }
    },
    [queryClient, setFreshLogin, setSelectedOrganizationState]
  );

  useEffect(() => {
    setLoading(
      !authSetupDone ||
        auth0Loading ||
        userLoading ||
        roleLoading ||
        userPermissionsLoading
    );
  }, [
    auth0Loading,
    authSetupDone,
    roleLoading,
    setLoading,
    userLoading,
    userPermissionsLoading,
  ]);

  registerAuthRuntimeActions({
    logout: () => {
      void handleLogout();
    },
    fetchOrganizations,
    setSelectedOrganization,
    syncOrgFromUrl,
    getAccessToken,
    refreshToken,
  });

  useEffect(() => {
    return () => {
      registerAuthRuntimeActions(null);
    };
  }, []);

  return <>{children}</>;
}
