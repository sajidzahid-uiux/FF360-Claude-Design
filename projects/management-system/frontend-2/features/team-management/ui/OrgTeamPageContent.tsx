"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
  Modal,
  TabsSwitcher,
  type TableFilterDefinition,
  type TableFilterValue,
  type TableSearchConfig,
  type TableSortRule,
  type TableViewMode,
  TableViewModeEnum,
  applyTableSort,
} from "@fieldflow360/org-ui";
import {
  Book,
  Briefcase,
  Eye,
  HelpCircle,
  PlusCircle,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import type { Role, TeamMember } from "@/api/types";
import { USER_ROLE_NAME_MAP, UserRole } from "@/constants/enums";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { TeamMemberMenuFlagsFooter } from "@/features/team";
import { filterStateToTableValues, tableValuesToFilterState } from "@/features/job-lead";
import {
  AddTeamMemberDialog,
  AllRolesTab,
  InvitedMembersDialog,
  RolePermissionsEditor,
  TeamManagementTab,
  TeamMemberQuotaCard,
} from "@/features/team-management";
import { TeamMembersTable } from "@/features/team-management/ui/TeamMembersTable";
import {
  useDialogManager,
  useMapping,
  useRouteIds,
  useSeatUsage,
  useTeamData,
} from "@/hooks";
import { useRoutePermissions } from "@/hooks/permissions";
import { useIsAdmin, useRoles, useUserRole } from "@/hooks/queries";
import { orgUrl } from "@/shared/config/routes";
import {
  DialogManager,
  Dropdown,
  type DropdownItem,
  FilterState,
  FilterType,
  PageRenderer,
} from "@/shared/ui/common";
import { getErrorMessage } from "@/utils/apiError";
import { canChangeRole } from "@/utils/ownerProtection";
import {
  getRoleDisplayName,
  getRoleLabel,
  isValidRoleId,
} from "@/utils/roleUtils";
import { filterActiveTeamMembers } from "@/utils/team/assignmentOrder";

function getMemberSortValue(member: TeamMember, columnKey: string): string {
  const user = member.user;
  switch (columnKey) {
    case "role":
      return member.role_fk?.name ?? member.role ?? "";
    case "username":
      return user.username ?? "";
    case "email":
      return user.email ?? "";
    case "phone":
      return user.phone_number ?? "";
    case "name":
    default:
      return (
        `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
        user.username ||
        ""
      );
  }
}

function teamFlagPatchErrorDetail(err: unknown): string | null {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response
  ) {
    return (
      (err.response as { data?: { detail?: string } }).data?.detail ?? null
    );
  }
  return null;
}

export default function OrgTeamPage() {
  const { read: canViewTeamMembers, write: canEditTeam } =
    useRoutePermissions() || {};
  const dialogManager = useDialogManager();
  const { orgId } = useRouteIds();

  const [activeTab, setActiveTab] = useState<string>(TeamManagementTab.MEMBERS);
  const [memberView, setMemberView] = useState<TableViewMode>(
    TableViewModeEnum.LIST
  );
  const [filters, setFilters] = useState<FilterState>({});
  const [search, setSearch] = useState("");
  const [sortRules, setSortRules] = useState<TableSortRule[]>([]);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const {
    data: team,
    isLoading: teamLoading,
    updateMember,
    patchMemberFlags,
    deleteMember,
  } = useTeamData();
  const { data: roles } = useRoles();
  const { data: roleMappings, isLoading: roleMappingsLoading } =
    useMapping("member_roles");
  const { data: userRole } = useUserRole();
  const { currentUser } = useAuth();
  const isAdmin = useIsAdmin();
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTeam = useMemo(() => filterActiveTeamMembers(team), [team]);

  // Find current user's member object to check if they're owner
  const currentUserMember = useMemo(() => {
    if (!activeTeam || !currentUser?.email) return null;
    return activeTeam.find((m) => m.user?.email === currentUser.email) || null;
  }, [activeTeam, currentUser]);

  const isOwner = Boolean(currentUserMember?.owner);
  const canManageTeamFlags =
    Boolean(canEditTeam) ||
    userRole?.name === USER_ROLE_NAME_MAP[UserRole.MANAGER];
  const { data: seatUsage } = useSeatUsage(isOwner);

  // Check if current user is admin but not owner
  const isAdminButNotOwner = useMemo(() => {
    return isAdmin && currentUserMember && !currentUserMember.owner;
  }, [isAdmin, currentUserMember]);

  // Remaining seats = total_seats - used_seats - pending_invites (matches backend formula)
  const remainingSeats = useMemo(() => {
    if (!seatUsage) return null;
    return Math.max(
      0,
      seatUsage.total_seats -
        seatUsage.used_seats -
        (seatUsage.pending_invites ?? 0)
    );
  }, [seatUsage]);

  useEffect(() => {
    // Only allow opening invite dialog via URL if user is admin
    const inviteParam = searchParams.get("invite");
    if (inviteParam === "true") {
      const atSeatLimit = remainingSeats !== null && remainingSeats <= 0;
      if (canEditTeam && !atSeatLimit) {
        dialogManager.openDialog({
          type: "addTeamMemberDialog",
          component: AddTeamMemberDialog,
          props: {
            open: true,
            onOpenChange: (open: boolean) => {
              if (!open) {
                dialogManager.closeDialog();
                // Remove the invite query parameter when closing the dialog
                const params = new URLSearchParams(searchParams.toString());
                params.delete("invite");
                router.replace(
                  orgUrl(
                    orgId,
                    "/settings/org/team",
                    params.toString() || undefined
                  )
                );
              }
            },
            roleOptions: roleMappings || [],
            canInviteMembers: canEditTeam,
          },
        });
      } else {
        // Remove invite parameter if user is not admin or at seat limit
        if (canEditTeam && remainingSeats !== null && remainingSeats <= 0) {
          toast.error(
            "Team member limit reached. Upgrade your plan to add more members."
          );
        }
        const params = new URLSearchParams(searchParams.toString());
        params.delete("invite");
        router.replace(
          orgUrl(orgId, "/settings/org/team", params.toString() || undefined)
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, canEditTeam, router, roleMappings, seatUsage]);

  // Redirect non-admin users away from roles tab
  useEffect(() => {
    if (!isAdmin && activeTab === TeamManagementTab.ROLES) {
      setActiveTab(TeamManagementTab.MEMBERS);
    }
  }, [isAdmin, activeTab]);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      dialogManager.closeDialog();
      // Remove the invite query parameter when closing the dialog
      const params = new URLSearchParams(searchParams.toString());
      params.delete("invite");
      router.replace(
        orgUrl(orgId, "/settings/org/team", params.toString() || undefined)
      );
    }
  };

  // Convert mapping array/object to a lookup for display
  const roleMap = useMemo(() => {
    if (!roleMappings) return {};
    return Array.isArray(roleMappings)
      ? Object.fromEntries(roleMappings)
      : roleMappings;
  }, [roleMappings]);

  // Role options array for easier access
  const roleOptions = useMemo(
    () => (Array.isArray(roleMappings) ? roleMappings : []),
    [roleMappings]
  );

  // Helper to get role label using utility function
  const getRoleLabelForCode = useCallback(
    (role: string | undefined) => getRoleLabel(role, roleMap, roles),
    [roleMap, roles]
  );

  // Filter team by role and search
  // Supports both old role codes and new role IDs
  const filteredTeam = useMemo(() => {
    if (!activeTeam) return [];
    let filtered = activeTeam;
    const selectedRoles = Array.isArray(filters[FilterType.MEMBER_ROLES])
      ? filters[FilterType.MEMBER_ROLES]
      : [];

    if (selectedRoles.length > 0) {
      filtered = filtered.filter((member) => {
        return selectedRoles.some((roleCode) => {
          if (isValidRoleId(roleCode)) {
            const roleFilterId = parseInt(roleCode);
            return member.role_fk?.id === roleFilterId;
          } else {
            // Legacy: compare with old role code
            return member.role === roleCode;
          }
        });
      });
    }
    if (search.trim()) {
      filtered = filtered.filter((member) => {
        const user = member.user;
        const name =
          (user.first_name + " " + user.last_name).trim() || user.username;
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          (user.email &&
            user.email.toLowerCase().includes(search.toLowerCase())) ||
          (user.phone_number &&
            user.phone_number.toLowerCase().includes(search.toLowerCase()))
        );
      });
    }
    return filtered;
  }, [activeTeam, filters, search]);

  // Sort is applied client-side (local dummy data) using the org-ui helper so
  // the unified toolbar's sort dropdown behaves like the lead/job listings.
  const sortedTeam = useMemo(
    () => applyTableSort(filteredTeam, sortRules, getMemberSortValue),
    [filteredTeam, sortRules]
  );

  const memberCount = activeTeam ? activeTeam.length : 0;
  const canInviteMore = remainingSeats !== null ? remainingSeats > 0 : true;

  // Handle role change and remove
  const handleRoleChange = useCallback(
    (id: string, newRoleIdOrCode: string) => {
      const member = team?.find((m) => m.id === parseInt(id, 10));

      if (!member) {
        toast.error("Member not found");
        return;
      }

      const validation = canChangeRole(member);
      if (!validation.allowed) {
        toast.error(validation.reason || "Role change is not allowed");
        return;
      }

      // Prevent admins (non-owners) from changing other admins' roles
      const memberIsAdmin =
        member.role_fk?.is_admin || member.role === UserRole.ADMIN;
      const memberIsOwner = member.owner === true;
      if (isAdminButNotOwner && memberIsAdmin && !memberIsOwner) {
        toast.error("Admins cannot edit other admins");
        return;
      }

      // Check if newRoleIdOrCode is a numeric role ID (new RBAC system)
      let targetRole: Role | undefined;

      if (isValidRoleId(newRoleIdOrCode)) {
        // New RBAC system: find role by ID
        const roleId = parseInt(newRoleIdOrCode);
        if (!roles || roles.length === 0) {
          toast.error("Roles are still loading. Please try again in a moment.");
          return;
        }
        targetRole = roles.find((r: Role) => r.id === roleId);
      } else {
        // Legacy system: map role code to role name using UserRole enum (for backward compatibility)
        const targetRoleName = USER_ROLE_NAME_MAP[newRoleIdOrCode as UserRole];
        if (!targetRoleName) {
          toast.error(`Invalid role code: ${newRoleIdOrCode}`);
          return;
        }
        // Find the role by name in the roles list
        if (!roles || roles.length === 0) {
          toast.error("Roles are still loading. Please try again in a moment.");
          return;
        }
        targetRole = roles.find(
          (r: Role) => r.name.toLowerCase() === targetRoleName.toLowerCase()
        );
      }

      if (!targetRole) {
        toast.error(
          `Role not found. Please ensure roles are properly configured.`
        );
        return;
      }

      // Use role_id for new RBAC system
      updateMember.mutate({
        id,
        updatedMember: { role_id: targetRole.id },
      } as Parameters<typeof updateMember.mutate>[0]);
    },
    [team, isAdminButNotOwner, roles, updateMember]
  );

  const handleDelete = useCallback(
    (id: string, name: string) => {
      const member = team?.find((m) => m.id === parseInt(id, 10));
      if (member) {
        const memberIsAdmin =
          member.role_fk?.is_admin || member.role === UserRole.ADMIN;
        const memberIsOwner = member.owner === true;
        if (isAdminButNotOwner && memberIsAdmin && !memberIsOwner) {
          toast.error("Admins cannot delete other admins");
          return;
        }
      }

      dialogManager.openConfirmationDialog({
        title: "Delete Team Member",
        confirmationType: "delete",
        itemTitle: name,
        variant: "destructive",
        confirmButtonText: "Delete",
        onConfirm: async () => {
          try {
            await deleteMember.mutateAsync(id);
            toast.success("Member deleted successfully");
            dialogManager.closeDialog();
          } catch (error: unknown) {
            console.error("Failed to delete member:", error);
            toast.error(getErrorMessage(error, "Failed to delete member"));
            dialogManager.setConfirmationProcessing(false);
          }
        },
      });
    },
    [isAdminButNotOwner, team, deleteMember, dialogManager]
  );

  const handleRoleEdit = (role: Role) => {
    setSelectedRole(role);
    setActiveTab(TeamManagementTab.ROLES);
  };

  const handleRoleEditorCancel = () => {
    setSelectedRole(null);
  };

  const handleRoleEditorSave = () => {
    setSelectedRole(null);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleInviteClick = () => {
    if (remainingSeats !== null && remainingSeats <= 0) {
      toast.error(
        "Team member limit reached. Upgrade your plan to add more members."
      );
      return;
    }
    dialogManager.openDialog({
      type: "addTeamMemberDialog",
      component: AddTeamMemberDialog,
      props: {
        open: true,
        onOpenChange: handleDialogOpenChange,
        roleOptions: roleMappings || [],
        canInviteMembers: canEditTeam,
      },
    });
  };

  const handleShowInvitedClick = () => {
    dialogManager.openDialog({
      type: "invitedMembersDialog",
      component: InvitedMembersDialog,
      props: {
        handleClose: () => dialogManager.closeDialog(),
        showInvitedDialog: true,
        setShowInvitedDialog: (open: boolean) => {
          if (!open) {
            dialogManager.closeDialog();
          }
        },
      },
    });
  };

  // Memoized factory: Change Role section only when user can edit team (not Project Manager–only).
  const buildMemberMenuItems = useCallback(
    (member: TeamMember): DropdownItem[] => {
      if (!canEditTeam) {
        return [];
      }

      const user = member.user;
      const isCurrentUser =
        currentUser && user.email && user.email === currentUser.email;

      // Check if member is admin or owner
      const memberIsAdmin =
        member.role_fk?.is_admin || member.role === UserRole.ADMIN;
      const memberIsOwner = member.owner === true;

      const canModifyRole =
        !isCurrentUser &&
        !memberIsOwner &&
        !(isAdminButNotOwner && memberIsAdmin);

      const roleSubmenu: DropdownItem[] = [];

      if (canModifyRole) {
        roleSubmenu.push(
          ...roleOptions.map(([code]) => {
            const isNumericRoleId = isValidRoleId(code);
            const roleId = isNumericRoleId ? parseInt(code) : null;
            const isCurrentRole = isNumericRoleId
              ? member.role_fk?.id === roleId
              : member.role === code;

            const isAdminRole =
              code === UserRole.ADMIN ||
              (isNumericRoleId &&
                roleId !== null &&
                roles?.some((role) => role.id === roleId && role.is_admin) ===
                  true);

            const roleName = getRoleLabelForCode(code);

            let icon = <User className="h-4 w-4" />;
            if (
              isAdminRole ||
              roleName === USER_ROLE_NAME_MAP[UserRole.ADMIN]
            ) {
              icon = <Shield className="h-4 w-4" />;
            } else if (roleName === USER_ROLE_NAME_MAP[UserRole.BOOKKEEPER]) {
              icon = <Book className="h-4 w-4" />;
            } else if (roleName === USER_ROLE_NAME_MAP[UserRole.CREW]) {
              icon = <Users className="h-4 w-4" />;
            } else if (roleName === USER_ROLE_NAME_MAP[UserRole.MANAGER]) {
              icon = <Briefcase className="h-4 w-4" />;
            } else if (roleName === USER_ROLE_NAME_MAP[UserRole.VIEWER]) {
              icon = <Eye className="h-4 w-4" />;
            } else if (roleName === USER_ROLE_NAME_MAP[UserRole.OWNER]) {
              icon = <Shield className="h-4 w-4" />;
            }

            return {
              id: `role-${code}`,
              label: getRoleLabelForCode(code),
              icon,
              onSelect: () => handleRoleChange(member.id.toString(), code),
              disabled: isCurrentRole,
            };
          })
        );
      }

      if (member.owner && !isCurrentUser) {
        roleSubmenu.push({
          id: "owner-message",
          label: "Organization owner - role cannot be changed",
          icon: <Shield className="h-4 w-4" />,
          disabled: true,
          onSelect: () => {},
        });
      }
      if (isCurrentUser) {
        roleSubmenu.push({
          id: "current-user-message",
          label: "You cannot edit your own role",
          icon: <User className="h-4 w-4" />,
          disabled: true,
          onSelect: () => {},
        });
      }
      if (
        isAdminButNotOwner &&
        memberIsAdmin &&
        !memberIsOwner &&
        !isCurrentUser
      ) {
        roleSubmenu.push({
          id: "admin-restriction-message",
          label: "Admins cannot edit other admins",
          icon: <Shield className="h-4 w-4" />,
          disabled: true,
          onSelect: () => {},
        });
      }

      const items: DropdownItem[] = [];
      if (roleSubmenu.length > 0) {
        items.push({
          type: "header",
          id: "change-role-section",
          label: "Change Role",
        });
        items.push({ type: "separator", id: "sep-under-change-role" });
        items.push(...roleSubmenu);
      }

      return items;
    },
    [
      canEditTeam,
      roleOptions,
      roles,
      isAdminButNotOwner,
      currentUser,
      handleRoleChange,
      getRoleLabelForCode,
    ]
  );

  const renderMemberActions = useCallback(
    (member: TeamMember) => {
      if (!canManageTeamFlags) return null;

      const user = member.user;
      const displayName =
        user.first_name || user.last_name
          ? `${user.first_name} ${user.last_name}`.trim()
          : user.username;
      const isCurrentUser =
        currentUser && user.email && user.email === currentUser.email;
      const memberIsAdmin =
        member.role_fk?.is_admin || member.role === UserRole.ADMIN;
      const memberIsOwner = member.owner === true;
      const canRemoveMember =
        !isCurrentUser &&
        !memberIsOwner &&
        !(isAdminButNotOwner && memberIsAdmin);
      const showMemberMenuFooter =
        canManageTeamFlags || (Boolean(canEditTeam) && canRemoveMember);

      return (
        <Dropdown
          contentClassName="min-w-[14rem]"
          footer={
            showMemberMenuFooter ? (
              <>
                {canManageTeamFlags ? (
                  <TeamMemberMenuFlagsFooter
                    disabled={patchMemberFlags.isPending}
                    member={member}
                    onPatchFlags={(payload) =>
                      patchMemberFlags.mutate(payload, {
                        onError: (err: unknown) => {
                          toast.error(
                            teamFlagPatchErrorDetail(err) ||
                              "Failed to update roles"
                          );
                        },
                      })
                    }
                  />
                ) : null}
                {canEditTeam && canRemoveMember ? (
                  <>
                    <div className="bg-border-subtle my-1 h-px" />
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--color-feedback-error)] hover:bg-[var(--color-feedback-error-soft)]"
                      type="button"
                      onClick={() =>
                        handleDelete(member.id.toString(), displayName)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </>
                ) : null}
              </>
            ) : undefined
          }
          items={buildMemberMenuItems(member)}
          width={220}
        />
      );
    },
    [
      canManageTeamFlags,
      canEditTeam,
      currentUser,
      isAdminButNotOwner,
      patchMemberFlags,
      handleDelete,
      buildMemberMenuItems,
    ]
  );

  // Unified toolbar wiring — search, role filter, sort, and actions all live in
  // the table toolbar, matching the lead/job listing layout.
  const searchConfig: TableSearchConfig = {
    value: search,
    onChange: handleSearchChange,
    placeholder: "Search team members...",
  };

  const filterDefinitions: TableFilterDefinition[] = isAdmin
    ? [
        {
          id: FilterType.MEMBER_ROLES,
          label: "Role",
          options: roleOptions.map(([code]: [string]) => ({
            value: code,
            label: getRoleLabelForCode(code),
          })),
        },
      ]
    : [];

  const filterValues = filterStateToTableValues(filters);

  const handleFilterValuesChange = (values: TableFilterValue[]) => {
    setFilters(tableValuesToFilterState<FilterState>(values));
  };

  const sortableColumns = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
  ];

  const teamToolbarActions = (
    <div className="flex shrink-0 items-center gap-2">
      <button
        aria-label="Team member roles help"
        className="text-text-muted hover:text-text-primary border-border-subtle inline-flex h-9 w-9 items-center justify-center rounded-md border"
        type="button"
        onClick={() => setHelpModalOpen(true)}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {canViewTeamMembers ? (
        <Button
          disabled={!canInviteMore}
          leftIcon={<PlusCircle className="h-4 w-4" />}
          size={ComponentSizeEnum.SM}
          title="Invite member"
          onClick={handleInviteClick}
        />
      ) : null}
      {canEditTeam ? (
        <Button
          size={ComponentSizeEnum.SM}
          title="Invited members"
          variant={ButtonVariantEnum.SURFACE}
          onClick={handleShowInvitedClick}
        />
      ) : null}
    </div>
  );

  return (
    <PageRenderer
      data={filteredTeam || []}
      emptyState={{
        title: "No team members",
        description: "Team members will appear here.",
      }}
      error={null}
      isLoading={teamLoading || roleMappingsLoading || false}
      loadingMessage="Loading team data..."
      padding="none"
      renderChildrenWhenEmpty={true}
      title=""
    >
      {() => {
        return (
          <div className="w-full min-w-0 space-y-4">
            {currentUserMember?.owner ? <TeamMemberQuotaCard /> : null}

            <TabsSwitcher
              items={[
                { value: TeamManagementTab.MEMBERS, label: "Team Members" },
                ...(isAdmin
                  ? [{ value: TeamManagementTab.ROLES, label: "All Roles" }]
                  : []),
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />

            {activeTab === TeamManagementTab.MEMBERS ? (
              <div className="space-y-2">
                <p className="text-text-muted text-sm">
                  {memberCount} members in your organization
                </p>
                <TeamMembersTable
                  filterDefinitions={filterDefinitions}
                  filterValues={filterValues}
                  getRoleDisplayName={(member) =>
                    getRoleDisplayName(member.role_fk) ||
                    getRoleLabelForCode(member.role)
                  }
                  isLoading={teamLoading || roleMappingsLoading}
                  members={sortedTeam}
                  organizationId={orgId}
                  renderRowActions={renderMemberActions}
                  search={searchConfig}
                  sortableColumns={sortableColumns}
                  sortRules={sortRules}
                  toolbarActions={teamToolbarActions}
                  view={memberView}
                  onFilterValuesChange={handleFilterValuesChange}
                  onSortRulesChange={setSortRules}
                  onViewChange={setMemberView}
                />
              </div>
            ) : null}

            <Modal
              isOpen={helpModalOpen}
              size="sm"
              title="Team Member Roles"
              onClose={() => setHelpModalOpen(false)}
            >
              <div className="space-y-3">
                <div>
                  <div className="font-medium">Admin</div>
                  <p className="text-text-muted text-sm">
                    Full access to all organization settings and data. Admin role
                    cannot be changed, edited, or deleted.
                  </p>
                </div>
                <div>
                  <div className="font-medium">Project Manager</div>
                  <p className="text-text-muted text-sm">
                    Can manage projects and assign tasks
                  </p>
                </div>
                <div>
                  <div className="font-medium">Project Crew</div>
                  <p className="text-text-muted text-sm">
                    Field workers assigned to specific projects
                  </p>
                </div>
                <div>
                  <div className="font-medium">Book Keeper</div>
                  <p className="text-text-muted text-sm">
                    Access to financial data and reports
                  </p>
                </div>
                <div>
                  <div className="font-medium">Viewer</div>
                  <p className="text-text-muted text-sm">
                    Read-only access to organization data
                  </p>
                </div>
              </div>
            </Modal>

            {isAdmin && activeTab === TeamManagementTab.ROLES ? (
              <div>
                {selectedRole ? (
                  <RolePermissionsEditor
                    role={selectedRole}
                    onCancel={handleRoleEditorCancel}
                    onSave={handleRoleEditorSave}
                  />
                ) : (
                  <AllRolesTab onEditRole={handleRoleEdit} />
                )}
              </div>
            ) : null}

            <DialogManager manager={dialogManager} />
          </div>
        );
      }}
    </PageRenderer>
  );
}
